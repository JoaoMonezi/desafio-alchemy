import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { tasks } from "../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm"; 
import { z } from "zod";

export const tasksRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(tasks).values({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure
    .input(filterTaskSchema.optional())
    .query(async ({ ctx, input }) => {
      const filters = [eq(tasks.userId, ctx.session.user.id)];

      if (input?.status) {
        filters.push(eq(tasks.status, input.status));
      }
      if (input?.priority) {
        filters.push(eq(tasks.priority, input.priority));
      }
      
      // Filtros de Data (Intervalo)
      if (input?.from) {
        filters.push(gte(tasks.dueDate, input.from));
      }
      if (input?.to) {
        filters.push(lte(tasks.dueDate, input.to));
      }

      // ✅ Lógica de Ordenação Dinâmica
      // asc: Vencimento mais próximo primeiro (Antigos -> Futuro)
      // desc: Vencimento mais longe primeiro (Futuro -> Antigos)
      // undefined (Padrão): Criados recentemente primeiro
      const orderBy = input?.sort === "asc" 
        ? asc(tasks.dueDate) 
        : input?.sort === "desc" 
        ? desc(tasks.dueDate) 
        : desc(tasks.createdAt);

      return ctx.db
        .select()
        .from(tasks)
        .where(and(...filters))
        .orderBy(orderBy);
    }),

  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      await ctx.db
        .update(tasks)
        .set(updateData)
        .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.session.user.id)));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.session.user.id)));
    }),
  // ✅ NOVA ROTA: Estatísticas do Dashboard
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    
    // Datas de corte
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Vamos buscar todos os dados de uma vez para processar (em apps gigantes faríamos queries separadas, mas aqui é mais rápido assim)
    const allTasks = await ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // 1. Cálculos Básicos (KPIs)
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === "DONE").length;
    const pending = total - completed;
    
    const completedToday = allTasks.filter(
      t => t.status === "DONE" && t.updatedAt >= startOfToday
    ).length;

    const completedMonth = allTasks.filter(
      t => t.status === "DONE" && t.updatedAt >= startOfMonth
    ).length;

    // 2. Agrupamento por Status (Para o Gráfico de Pizza)
    const statusData = [
      { name: "A Fazer", value: allTasks.filter(t => t.status === "TODO").length, fill: "#94a3b8" },
      { name: "Em Progresso", value: allTasks.filter(t => t.status === "IN_PROGRESS").length, fill: "#3b82f6" },
      { name: "Concluído", value: allTasks.filter(t => t.status === "DONE").length, fill: "#22c55e" },
    ];

    // 3. Agrupamento por Prioridade (Para o Gráfico de Barras)
    const priorityData = [
      { name: "Baixa", value: allTasks.filter(t => t.priority === "LOW").length, fill: "#94a3b8" },
      { name: "Média", value: allTasks.filter(t => t.priority === "MEDIUM").length, fill: "#3b82f6" },
      { name: "Alta", value: allTasks.filter(t => t.priority === "HIGH").length, fill: "#ef4444" },
    ];

    // 4. "Streak" - Atividade dos últimos 7 dias
    // Vamos criar um array com os últimos 7 dias e preencher quantos foram concluídos em cada
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const count = allTasks.filter(t => 
        t.status === "DONE" && 
        t.updatedAt.toISOString().split('T')[0] === dateKey
      ).length;

      activityData.push({
        day: d.toLocaleDateString('pt-BR', { weekday: 'short' }), // Seg, Ter...
        tasks: count
      });
    }

    return {
      kpi: {
        total,
        completedToday,
        completedMonth,
        pending
      },
      charts: {
        status: statusData,
        priority: priorityData,
        activity: activityData
      }
    };
  }),
});