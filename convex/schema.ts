import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    employer: v.optional(v.string()),
  }).index("by_name", ["name"]),

  contractors: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  transactions: defineTable({
    contractor_id: v.id("contractors"),
    project_id: v.id("projects"),
    type: v.union(v.literal("work"), v.literal("payment")),
    description: v.string(),
    amount_rial: v.number(),
    transaction_date: v.optional(v.string()),
    status: v.optional(v.string()),
  }).index("by_contractor", ["contractor_id"])
    .index("by_project", ["project_id"]),

  daily_reports: defineTable({
    project_id: v.id("projects"),
    report_date: v.string(),
    report_text: v.string(),
  }).index("by_project", ["project_id"]),

  worker_activities: defineTable({
    person_name: v.string(),
    activity_date: v.string(),
    hours: v.number(),
    description: v.string(),
    project_id: v.optional(v.id("projects")),
  }).index("by_date", ["activity_date"]),

  inventory_items: defineTable({
    project_id: v.optional(v.id("projects")),
    item_name: v.string(),
    unit: v.string(),
    current_quantity: v.number(),
  }).index("by_item_name", ["item_name"]),

  inventory_movements: defineTable({
    item_id: v.id("inventory_items"),
    movement_type: v.union(v.literal("in"), v.literal("out")),
    quantity: v.number(),
    unit: v.string(),
    movement_date: v.string(),
    description: v.optional(v.string()),
  }).index("by_item", ["item_id"]),

  purchases: defineTable({
    project_id: v.id("projects"),
    item_name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    purchase_date: v.string(),
    amount_rial: v.number(),
    description: v.optional(v.string()),
  }).index("by_project", ["project_id"]),

  personal_accounts: defineTable({
    person_name: v.string(),
    account_type: v.string(),
    amount_rial: v.number(),
    paid_rial: v.number(),
    account_date: v.string(),
  }),

  personal_expenses: defineTable({
    item_name: v.string(),
    category: v.optional(v.string()),
    amount_rial: v.number(),
    expense_date: v.string(),
    description: v.optional(v.string()),
  }),
});
