import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { tasks } from "../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm"; 
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { ratelimit } from "@/Config/ratelimit"; // <--- Importante: Configuração do Redis

export const tasksRouter = createTRPCRouter({
  // 1. CREATE (Protegido com Rate Limit)
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 🛡️ RATE LIMITING
      // Verifica se o utilizador já excedeu o limite (ex: 3 tarefas/minuto)
      const { success } = await ratelimit.limit(`create_task:${userId}`);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Calma lá! Você está a criar tarefas muito rápido. Aguarde um minuto.",
        });
      }

      // Se passou, insere no banco
      await ctx.db.insert(tasks).values({
        ...input,
        userId: userId,
      });
    }),

  // 2. GET ALL (Lista com Filtros e Ordenação)
  getAll: protectedProcedure
    .input(filterTaskSchema.optional())
    .query(async ({ ctx, input }) => {
      const filters = [eq(tasks.userId, ctx.session.user.id)];

      if (input?.status) filters.push(eq(tasks.status, input.status));
      if (input?.priority) filters.push(eq(tasks.priority, input.priority));
      
      // Filtros de Data (Intervalo)
      if (input?.from) filters.push(gte(tasks.dueDate, input.from));
      if (input?.to) filters.push(lte(tasks.dueDate, input.to));

      // Lógica de Ordenação
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

  // 3. GET BY ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [task] = await ctx.db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.session.user.id)));
      
      return task || null;
    }),

  // 4. UPDATE
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      await ctx.db
        .update(tasks)
        .set(updateData)
        .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.session.user.id)));
    }),

  // 5. DELETE
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.session.user.id)));
    }),

  // 6. DASHBOARD STATS
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allTasks = await ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === "DONE").length;
    const pending = total - completed;
    
    const completedToday = allTasks.filter(
      t => t.status === "DONE" && t.updatedAt >= startOfToday
    ).length;

    const completedMonth = allTasks.filter(
      t => t.status === "DONE" && t.updatedAt >= startOfMonth
    ).length;

    const statusData = [
      { name: "A Fazer", value: allTasks.filter(t => t.status === "TODO").length, fill: "#94a3b8" },
      { name: "Em Progresso", value: allTasks.filter(t => t.status === "IN_PROGRESS").length, fill: "#3b82f6" },
      { name: "Concluído", value: allTasks.filter(t => t.status === "DONE").length, fill: "#22c55e" },
    ];

    const priorityData = [
      { name: "Baixa", value: allTasks.filter(t => t.priority === "LOW").length, fill: "#94a3b8" },
      { name: "Média", value: allTasks.filter(t => t.priority === "MEDIUM").length, fill: "#3b82f6" },
      { name: "Alta", value: allTasks.filter(t => t.priority === "HIGH").length, fill: "#ef4444" },
    ];

    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      
      const count = allTasks.filter(t => 
        t.status === "DONE" && 
        t.updatedAt.toISOString().split('T')[0] === dateKey
      ).length;

      activityData.push({
        day: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        tasks: count
      });
    }

    return {
      kpi: { total, completedToday, completedMonth, pending },
      charts: { status: statusData, priority: priorityData, activity: activityData }
    };
  }),
});