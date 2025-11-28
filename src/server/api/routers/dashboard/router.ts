import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";
import { tasks, users } from "../../../../../database/schema";
import { eq, sql } from "drizzle-orm";
import { calculateDashboardMetrics } from "./utils"; // <--- Importa sua lógica de cálculo

export const dashboardRouter = createTRPCRouter({
  // 1. DADOS PRIVADOS (Dashboard do Usuário)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // 🚨 CORREÇÃO: Forçamos o TypeScript a tratar userId como string (porque está em protectedProcedure)
    const userId = ctx.session.user!.id; 

    const allTasks = await ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId!));  // ✅ userId é garantido

    return calculateDashboardMetrics(allTasks);
  }),

  // 2. DADOS PÚBLICOS (Para a Landing Page / ISR)
  getPublicStats: publicProcedure.query(async ({ ctx }) => {
    // Consultas otimizadas
    const [userRes] = await ctx.db.select({ count: sql<number>`count(*)` }).from(users);
    const [taskRes] = await ctx.db.select({ count: sql<number>`count(*)` }).from(tasks);
    const [doneRes] = await ctx.db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, "DONE"));

    return {
      users: Number(userRes?.count ?? 0),
      tasks: Number(taskRes?.count ?? 0),
      completed: Number(doneRes?.count ?? 0),
    };
  }),
});