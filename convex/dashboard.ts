import { query } from "./_generated/server";

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").collect();
  },
});

export const getContractors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contractors").collect();
  },
});

export const getTransactions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transactions").collect();
  },
});

export const getDailyReports = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("daily_reports").collect();
  },
});

export const getWorkerActivities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("worker_activities").collect();
  },
});

export const getInventoryItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inventory_items").collect();
  },
});

export const getInventoryMovements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inventory_movements").collect();
  },
});

export const getPurchases = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("purchases").collect();
  },
});

export const getPersonalAccounts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("personal_accounts").collect();
  },
});

export const getPersonalExpenses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("personal_expenses").collect();
  },
});
