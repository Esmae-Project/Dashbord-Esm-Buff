import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addProject = mutation({
  args: {
    name: v.string(),
    employer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      name: args.name,
      employer: args.employer,
    });
  },
});

export const addContractor = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contractors", {
      name: args.name,
    });
  },
});

export const addTransaction = mutation({
  args: {
    contractor_id: v.id("contractors"),
    project_id: v.id("projects"),
    type: v.union(v.literal("work"), v.literal("payment")),
    description: v.string(),
    amount_rial: v.number(),
    transaction_date: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", args);
  },
});

export const addDailyReport = mutation({
  args: {
    project_id: v.id("projects"),
    report_date: v.string(),
    report_text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("daily_reports", args);
  },
});

export const addWorkerActivity = mutation({
  args: {
    person_name: v.string(),
    activity_date: v.string(),
    hours: v.number(),
    description: v.string(),
    project_id: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("worker_activities", args);
  },
});

export const addInventoryItem = mutation({
  args: {
    project_id: v.optional(v.id("projects")),
    item_name: v.string(),
    unit: v.string(),
    current_quantity: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inventory_items", args);
  },
});

export const addInventoryMovement = mutation({
  args: {
    item_id: v.id("inventory_items"),
    movement_type: v.union(v.literal("in"), v.literal("out")),
    quantity: v.number(),
    unit: v.string(),
    movement_date: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inventory_movements", args);
  },
});

export const addPurchase = mutation({
  args: {
    project_id: v.id("projects"),
    item_name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    purchase_date: v.string(),
    amount_rial: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("purchases", args);
  },
});

export const addPersonalAccount = mutation({
  args: {
    person_name: v.string(),
    account_type: v.string(),
    amount_rial: v.number(),
    paid_rial: v.number(),
    account_date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("personal_accounts", args);
  },
});

export const addPersonalExpense = mutation({
  args: {
    item_name: v.string(),
    category: v.optional(v.string()),
    amount_rial: v.number(),
    expense_date: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("personal_expenses", args);
  },
});
