import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export type UserSummary = {
  xp?: number;
  level?: number;
  levelName?: string;
  mastered?: number;
  total?: number;
  streak?: number;
  bestStreak?: number;
  badges?: string[];
  lessons?: number;
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  pseudo: varchar("pseudo", { length: 24 }).notNull(),
  pseudoKey: varchar("pseudo_key", { length: 24 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  summary: jsonb("summary").$type<UserSummary>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const progress = pgTable("progress", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const results = pgTable(
  "results",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 30 }).notNull(),
    correct: integer("correct").notNull(),
    total: integer("total").notNull(),
    xp: integer("xp").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("results_created_idx").on(t.createdAt), index("results_user_idx").on(t.userId)],
);

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  textId: varchar("text_id", { length: 40 }).notNull(),
  comment: varchar("comment", { length: 200 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
