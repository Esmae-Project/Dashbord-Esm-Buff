import { supabase } from "./supabase";

/* =====================================================
   توابع اضافه کردن اطلاعات به دیتابیس
===================================================== */

export async function insertProject(data: {
  name: string;
  employer?: string;
}) {
  const { error } = await supabase.from("projects").insert({
    name: data.name,
    employer: data.employer || null,
  });
  if (error) throw error;
}

export async function insertContractor(data: { name: string }) {
  const { error } = await supabase.from("contractors").insert({
    name: data.name,
  });
  if (error) throw error;
}

export async function insertTransaction(data: {
  contractor_id: string;
  project_id: string;
  type: "work" | "payment";
  description: string;
  amount_rial: number;
  transaction_date?: string;
  status?: string;
}) {
  const { error } = await supabase.from("transactions").insert({
    contractor_id: data.contractor_id,
    project_id: data.project_id,
    type: data.type,
    description: data.description,
    amount_rial: data.amount_rial,
    transaction_date: data.transaction_date || null,
    status: data.status || null,
  });
  if (error) throw error;
}

export async function insertDailyReport(data: {
  project_id: string;
  report_date: string;
  report_text: string;
}) {
  const { error } = await supabase.from("daily_reports").insert({
    project_id: data.project_id,
    report_date: data.report_date,
    report_text: data.report_text,
  });
  if (error) throw error;
}

export async function insertWorkerActivity(data: {
  person_name: string;
  activity_date: string;
  hours: number;
  description: string;
  project_id?: string;
}) {
  const { error } = await supabase.from("worker_activities").insert({
    person_name: data.person_name,
    activity_date: data.activity_date,
    hours: data.hours,
    description: data.description,
    project_id: data.project_id || null,
  });
  if (error) throw error;
}

export async function insertInventoryItem(data: {
  item_name: string;
  unit: string;
  current_quantity: number;
  project_id?: string;
}) {
  const { error } = await supabase.from("inventory_items").insert({
    item_name: data.item_name,
    unit: data.unit,
    current_quantity: data.current_quantity,
    project_id: data.project_id || null,
  });
  if (error) throw error;
}

export async function insertInventoryMovement(data: {
  item_id: string;
  movement_type: "in" | "out";
  quantity: number;
  unit: string;
  movement_date: string;
  description?: string;
}) {
  const { error } = await supabase.from("inventory_movements").insert({
    item_id: data.item_id,
    movement_type: data.movement_type,
    quantity: data.quantity,
    unit: data.unit,
    movement_date: data.movement_date,
    description: data.description || null,
  });
  if (error) throw error;
}

export async function insertPurchase(data: {
  project_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  purchase_date: string;
  amount_rial: number;
  description?: string;
}) {
  const { error } = await supabase.from("purchases").insert({
    project_id: data.project_id,
    item_name: data.item_name,
    quantity: data.quantity,
    unit: data.unit,
    purchase_date: data.purchase_date,
    amount_rial: data.amount_rial,
    description: data.description || null,
  });
  if (error) throw error;
}

export async function insertPersonalAccount(data: {
  person_name: string;
  account_type: string;
  amount_rial: number;
  paid_rial?: number;
  account_date: string;
}) {
  const { error } = await supabase.from("personal_accounts").insert({
    person_name: data.person_name,
    account_type: data.account_type,
    amount_rial: data.amount_rial,
    paid_rial: data.paid_rial || 0,
    account_date: data.account_date,
  });
  if (error) throw error;
}

export async function insertPersonalExpense(data: {
  item_name: string;
  amount_rial: number;
  expense_date: string;
  category?: string;
  description?: string;
}) {
  const { error } = await supabase.from("personal_expenses").insert({
    item_name: data.item_name,
    amount_rial: data.amount_rial,
    expense_date: data.expense_date,
    category: data.category || null,
    description: data.description || null,
  });
  if (error) throw error;
}
