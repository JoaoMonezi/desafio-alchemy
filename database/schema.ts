import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// --- Enums ---
export const statusEnum = pgEnum("status", ["TODO", "IN_PROGRESS", "DONE"]);
export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH"]);

// --- Users, Accounts, Sessions, Verification, Password Reset (Mantidos) ---
// ... (código das outras tabelas) ...
export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const accounts = pgTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccount>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (verificationToken) => [primaryKey({ columns: [verificationToken.identifier, verificationToken.token] })]);

export const passwordResetTokens = pgTable("passwordResetToken", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// --- Tabela de Tarefas (tasks) ---
export const tasks = pgTable("task", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  status: statusEnum("status").default("TODO").notNull(),
  priority: priorityEnum("priority").default("MEDIUM").notNull(),
  dueDate: timestamp("dueDate", { mode: "date" }),
  
  // ✅ CORREÇÃO APLICADA AQUI: forçar notNull()
  createdAt: timestamp("createdAt").defaultNow().notNull(), 
  updatedAt: timestamp("updatedAt").defaultNow().notNull(), 
  
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});