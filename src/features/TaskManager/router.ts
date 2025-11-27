import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { tasks } from "../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm"; 
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { ratelimit } from "@/Config/ratelimit"; // <--- Importante: Configuração do Redis

import { calculateDashboardMetrics } from "./utils"; // <--- Importando a lógica extraída

export const tasksRouter = createTRPCRouter({
  // 1. CREATE (Com Rate Limit)
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 🛡️ Rate Limiting
      const { success } = await ratelimit.limit(`create_task:${userId}`);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Calma lá! Você está criando tarefas muito rápido.",
        });
      }

      await ctx.db.insert(tasks).values({
        ...input,
        userId: userId,
      });
    }),

  // 2. GET ALL (Com Filtros e Ordenação)
  getAll: protectedProcedure
    .input(filterTaskSchema.optional())
    .query(async ({ ctx, input }) => {
      const filters = [eq(tasks.userId, ctx.session.user.id)];

      if (input?.status) filters.push(eq(tasks.status, input.status));
      if (input?.priority) filters.push(eq(tasks.priority, input.priority));
      if (input?.from) filters.push(gte(tasks.dueDate, input.from));
      if (input?.to) filters.push(lte(tasks.dueDate, input.to));

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

  // 6. DASHBOARD STATS (✅ Refatorado e Limpo)
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // 1. Busca os dados brutos no banco (apenas do usuário)
    const allTasks = await ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // 2. Passa para a função pura calcular as métricas
    // Isso mantém o Router leve e a lógica testável via Jest
    return calculateDashboardMetrics(allTasks);
  }),
});