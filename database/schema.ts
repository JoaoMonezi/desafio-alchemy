import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum, // <--- Importamos isso para criar tipos fixos (Enum)
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// --- 1. Definição dos Enums (Opções Fixas) ---
// Isso cria tipos no banco de dados que só aceitam esses valores específicos
export const statusEnum = pgEnum("status", ["TODO", "IN_PROGRESS", "DONE"]);
export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH"]);

// --- 2. Tabelas de Autenticação (Já existentes) ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

export const passwordResetTokens = pgTable(
  "passwordResetToken",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  }
);

// --- 3. Tabela de Tarefas (A Nova) ---

export const tasks = pgTable("task", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  
  // Campos de Conteúdo
  title: text("title").notNull(),
  description: text("description"), // Pode ser nulo/vazio
  
  // Campos de Controle (Usam os Enums definidos no topo)
  status: statusEnum("status").default("TODO").notNull(),
  priority: priorityEnum("priority").default("MEDIUM").notNull(),
  
  // Datas
  dueDate: timestamp("dueDate", { mode: "date" }), // Data de vencimento
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),

  // Relacionamento: Cada tarefa pertence a um usuário
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});