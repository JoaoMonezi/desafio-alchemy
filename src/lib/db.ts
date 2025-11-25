import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../database/schema"; // Importando suas tabelas da raiz

const connectionString = process.env.DATABASE_URL!;

// Cria a conexão com o banco
const client = postgres(connectionString);

// Exporta o objeto 'db' que vamos usar no app inteiro
export const db = drizzle(client, { schema });