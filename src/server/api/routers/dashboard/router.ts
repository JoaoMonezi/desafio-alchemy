import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";
import { tasks, users } from "../../../../../database/schema";
import { eq, sql } from "drizzle-orm";
import { calculateDashboardMetrics } from "./utils"; // <--- Importa sua lógica de cálculo

export const dashboardRouter = createTRPCRouter({
  // 1. DADOS PRIVADOS (Para o /app Dashboard do usuário logado)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Busca apenas as tarefas desse usuário
    const allTasks = await ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // Passa para a sua função de utilitário calcular os gráficos e KPIs
    return calculateDashboardMetrics(allTasks);
  }),

  // 2. DADOS PÚBLICOS (Para a Landing Page / ISR)
  getPublicStats: publicProcedure.query(async ({ ctx }) => {
    // Consultas otimizadas usando COUNT no banco
    const [userRes] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const [taskRes] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(tasks);
    
    const [completedRes] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, "DONE"));

    return {
      users: Number(userRes?.count ?? 0),
      tasks: Number(taskRes?.count ?? 0),
      completed: Number(completedRes?.count ?? 0),
    };
  }),
});