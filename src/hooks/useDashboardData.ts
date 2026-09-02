import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

/* =====================================================
   TYPES
===================================================== */
export type Project = {
  id: string;
  name: string;
  employer: string | null;
  created_at: string;
};

export type Contractor = {
  id: string;
  name: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  contractor_id: string;
  project_id: string;
  type: "work" | "payment";
  description: string;
  amount_rial: number;
  transaction_date: string | null;
  status: string | null;
  created_at: string;
};

export type DailyReport = {
  id: string;
  project_id: string;
  report_date: string;
  report_text: string;
  created_at: string;
};

export type WorkerActivity = {
  id: string;
  person_name: string;
  activity_date: string;
  hours: number;
  description: string;
  project_id: string | null;
  created_at: string;
};

export type InventoryItem = {
  id: string;
  project_id: string | null;
  item_name: string;
  unit: string;
  current_quantity: number;
  created_at: string;
  updated_at: string;
};

export type InventoryMovement = {
  id: string;
  item_id: string;
  movement_type: "in" | "out";
  quantity: number;
  unit: string;
  movement_date: string;
  description: string | null;
  created_at: string;
};

export type Purchase = {
  id: string;
  project_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  purchase_date: string;
  amount_rial: number;
  description: string | null;
  created_at: string;
};

export type PersonalAccount = {
  id: string;
  person_name: string;
  account_type: string;
  amount_rial: number;
  paid_rial: number;
  account_date: string;
  created_at: string;
};

export type PersonalExpense = {
  id: string;
  item_name: string;
  category: string | null;
  amount_rial: number;
  expense_date: string;
  description: string | null;
  created_at: string;
};

export type DashboardData = {
  projects: Project[];
  contractors: Contractor[];
  transactions: Transaction[];
  dailyReports: DailyReport[];
  workerActivities: WorkerActivity[];
  inventoryItems: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  purchases: Purchase[];
  personalAccounts: PersonalAccount[];
  personalExpenses: PersonalExpense[];
  loading: boolean;
  error: string | null;
  connectionStatus: "connecting" | "connected" | "error";
  connectionMessage: string;
  refresh: () => void;
};

/* =====================================================
   CACHE — کش ساده برای سرعت بیشتر
===================================================== */
const CACHE_KEY = "dashboard_cache";
const CACHE_TTL = 60_000; // ۱ دقیقه

function getCached(): Partial<DashboardData> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data: Partial<DashboardData>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ذخیره نشد — مهم نیست
  }
}

/* =====================================================
   INITIAL STATE
===================================================== */
const INITIAL: DashboardData = {
  projects: [],
  contractors: [],
  transactions: [],
  dailyReports: [],
  workerActivities: [],
  inventoryItems: [],
  inventoryMovements: [],
  purchases: [],
  personalAccounts: [],
  personalExpenses: [],
  loading: true,
  error: null,
  connectionStatus: "connecting",
  connectionMessage: "🔄 در حال اتصال به دیتابیس...",
  refresh: () => {},
};

/* =====================================================
   HOOK — با لود تدریجی و کش
===================================================== */
export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>(() => {
    // اگه کش داریم، فوری نشون بده
    const cached = getCached();
    if (cached && cached.projects && cached.projects.length > 0) {
      return {
        ...INITIAL,
        ...cached,
        loading: false,
        connectionStatus: "connected" as const,
        connectionMessage: "✅ بارگذاری از حافظه — در حال به‌روزرسانی...",
        refresh: () => {},
      };
    }
    return INITIAL;
  });

  const loadRef = useRef(false);

  const loadData = useCallback(async () => {
    // جلوگیری از لود تکراری
    if (loadRef.current) return;
    loadRef.current = true;

    setData((prev) => ({
      ...prev,
      loading: true,
      connectionStatus: "connecting",
      connectionMessage: "🔄 در حال دریافت اطلاعات...",
    }));

    try {
      // همه ۱۰ کوئری همزمان — بدون تست اضافی
      const [
        projectsRes,
        contractorsRes,
        transactionsRes,
        dailyReportsRes,
        workerActivitiesRes,
        inventoryItemsRes,
        inventoryMovementsRes,
        purchasesRes,
        personalAccountsRes,
        personalExpensesRes,
      ] = await Promise.allSettled([
        supabase
          .from("projects")
          .select("id, name, employer, created_at")
          .order("name"),
        supabase
          .from("contractors")
          .select("id, name, created_at")
          .order("name"),
        supabase
          .from("transactions")
          .select(
            "id, contractor_id, project_id, type, description, amount_rial, transaction_date, status, created_at"
          )
          .order("created_at", { ascending: true }),
        supabase
          .from("daily_reports")
          .select("id, project_id, report_date, report_text, created_at")
          .order("report_date", { ascending: false }),
        supabase
          .from("worker_activities")
          .select(
            "id, person_name, activity_date, hours, description, project_id, created_at"
          )
          .order("activity_date", { ascending: false }),
        supabase
          .from("inventory_items")
          .select(
            "id, project_id, item_name, unit, current_quantity, created_at, updated_at"
          )
          .order("item_name"),
        supabase
          .from("inventory_movements")
          .select(
            "id, item_id, movement_type, quantity, unit, movement_date, description, created_at"
          )
          .order("movement_date", { ascending: false }),
        supabase
          .from("purchases")
          .select(
            "id, project_id, item_name, quantity, unit, purchase_date, amount_rial, description, created_at"
          )
          .order("purchase_date", { ascending: false }),
        supabase
          .from("personal_accounts")
          .select("*")
          .order("account_date", { ascending: false }),
        supabase
          .from("personal_expenses")
          .select(
            "id, item_name, category, amount_rial, expense_date, description, created_at"
          )
          .order("expense_date", { ascending: false }),
      ]);

      // استخراج داده از Promise.allSettled
      function extract<T>(r: PromiseSettledResult<{ data: T[] | null; error: unknown }>): T[] {
        if (r.status === "rejected") return [];
        if (r.value.error) return [];
        return (r.value.data || []) as T[];
      }

      const projects = extract<Project>(projectsRes);
      const contractors = extract<Contractor>(contractorsRes);
      const transactions = extract<Transaction>(transactionsRes);
      const dailyReports = extract<DailyReport>(dailyReportsRes);
      const workerActivities = extract<WorkerActivity>(workerActivitiesRes);
      const inventoryItems = extract<InventoryItem>(inventoryItemsRes);
      const inventoryMovements = extract<InventoryMovement>(inventoryMovementsRes);
      const purchases = extract<Purchase>(purchasesRes);
      const personalAccounts = extract<PersonalAccount>(personalAccountsRes);
      const personalExpenses = extract<PersonalExpense>(personalExpensesRes);

      const newState: DashboardData = {
        projects,
        contractors,
        transactions,
        dailyReports,
        workerActivities,
        inventoryItems,
        inventoryMovements,
        purchases,
        personalAccounts,
        personalExpenses,
        loading: false,
        error: null,
        connectionStatus: "connected",
        connectionMessage: `✅ اتصال موفق — ${projects.length} پروژه، ${contractors.length} پیمانکار، ${transactions.length} تراکنش`,
        refresh: loadData,
      };

      setData(newState);
      setCache(newState);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("LOAD ERROR:", err);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: message,
        connectionStatus: "error",
        connectionMessage: "❌ " + message,
        refresh: loadData,
      }));
    } finally {
      loadRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { ...data, refresh: loadData };
}
