import { pgTable, varchar, integer, serial, date, timestamp, boolean, decimal, text } from "drizzle-orm/pg-core";

// Carbon Footprints table
export const carbonFootprintsTable = pgTable("carbon_footprints", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  date: date("date").notNull(),
  transportation: decimal("transportation", { precision: 10, scale: 2 }).notNull(),
  energy: decimal("energy", { precision: 10, scale: 2 }).notNull(),
  food: decimal("food", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const carbonInsightsTable = pgTable("carbon_insights", {
    id: serial("id").primaryKey(),
    carbonFootprintId: serial("carbon_footprint_id").references(() => carbonFootprintsTable.id),
    userId: varchar("user_id", { length: 256 }).notNull(),
    date: date("date").notNull(),
    insight: text("insight").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
  });
  
  export type CarbonFootprint = typeof carbonFootprintsTable.$inferInsert;
  export type CarbonInsight = typeof carbonInsightsTable.$inferInsert;

// Sustainability Goals table
export const sustainabilityGoalsTable = pgTable("sustainability_goals", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
    goal: varchar("goal", { length: 255 }).notNull(),
    targetDate: date("target_date"),
    completed: boolean("completed").default(false).notNull(),
    progress: integer("progress").default(0).notNull(), // New field: 0-100 to represent percentage
    notes: text("notes"), // New field: for user comments on progress
    createdAt: timestamp("created_at").defaultNow().notNull()
  });
  
  export type SustainabilityGoal = typeof sustainabilityGoalsTable.$inferInsert;




// Eco Tips table
export const ecoTipsTable = pgTable("eco_tips", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  tip: varchar("tip", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }),
  imageUrl: varchar("image_url", { length: 1000 }),
  isAiGenerated: boolean("is_ai_generated").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type EcoTip = typeof ecoTipsTable.$inferInsert;


export const waterSavingsTable = pgTable("water_savings", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    date: date("date").notNull(),
    amountSaved: decimal("amount_saved", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  });
  
  export type WaterSaving = typeof waterSavingsTable.$inferInsert;