import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});