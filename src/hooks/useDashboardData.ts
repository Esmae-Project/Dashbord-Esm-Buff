import { useState, useEffect, useCallback } from "react";
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
   HOOK
===================================================== */
export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
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
    connectionMessage: "🔄 در حال اتصال به Supabase...",
    refresh: () => {},
  });

  const loadData = useCallback(async () => {
    setData((prev) => ({
      ...prev,
      loading: true,
      connectionStatus: "connecting",
      connectionMessage: "🔄 در حال اتصال به Supabase...",
    }));

    try {
      // Test connection first
      const testResult = await supabase
        .from("projects")
        .select("id")
        .limit(1);

      if (testResult.error) {
        throw new Error("اتصال به Supabase برقرار نیست: " + testResult.error.message);
      }

      // Load all data in parallel
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
      ] = await Promise.all([
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
          .select("id, contractor_id, project_id, type, description, amount_rial, transaction_date, status, created_at")
          .order("created_at", { ascending: true }),
        supabase
          .from("daily_reports")
          .select("id, project_id, report_date, report_text, created_at")
          .order("report_date", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("worker_activities")
          .select("id, person_name, activity_date, hours, description, project_id, created_at")
          .order("activity_date", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("inventory_items")
          .select("id, project_id, item_name, unit, current_quantity, created_at, updated_at")
          .order("item_name"),
        supabase
          .from("inventory_movements")
          .select("id, item_id, movement_type, quantity, unit, movement_date, description, created_at")
          .order("movement_date", { ascending: false }),
        supabase
          .from("purchases")
          .select("id, project_id, item_name, quantity, unit, purchase_date, amount_rial, description, created_at")
          .order("purchase_date", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("personal_accounts")
          .select("*")
          .order("account_date", { ascending: false }),
        supabase
          .from("personal_expenses")
          .select("id, item_name, category, amount_rial, expense_date, description, created_at")
          .order("expense_date", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      // Check for errors
      const errors: string[] = [];
      if (projectsRes.error) errors.push("projects: " + projectsRes.error.message);
      if (contractorsRes.error) errors.push("contractors: " + contractorsRes.error.message);
      if (transactionsRes.error) errors.push("transactions: " + transactionsRes.error.message);

      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }

      const pCount = projectsRes.data?.length || 0;
      const cCount = contractorsRes.data?.length || 0;
      const tCount = transactionsRes.data?.length || 0;

      setData({
        projects: (projectsRes.data || []) as Project[],
        contractors: (contractorsRes.data || []) as Contractor[],
        transactions: (transactionsRes.data || []) as Transaction[],
        dailyReports: (dailyReportsRes.data || []) as DailyReport[],
        workerActivities: (workerActivitiesRes.data || []) as WorkerActivity[],
        inventoryItems: (inventoryItemsRes.data || []) as InventoryItem[],
        inventoryMovements: (inventoryMovementsRes.data || []) as InventoryMovement[],
        purchases: (purchasesRes.data || []) as Purchase[],
        personalAccounts: (personalAccountsRes.data || []) as PersonalAccount[],
        personalExpenses: (personalExpensesRes.data || []) as PersonalExpense[],
        loading: false,
        error: null,
        connectionStatus: "connected",
        connectionMessage: `✅ اتصال آنلاین به Supabase موفق است. ${pCount} پروژه، ${cCount} پیمانکار و ${tCount} تراکنش دریافت شد.`,
        refresh: loadData,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("SUPABASE ERROR:", err);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: message,
        connectionStatus: "error",
        connectionMessage: "❌ " + message,
        refresh: loadData,
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return data;
}
