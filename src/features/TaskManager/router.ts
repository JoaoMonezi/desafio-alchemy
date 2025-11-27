import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";
import { tasks, users } from "../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm"; 
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { ratelimit } from "@/Config/ratelimit"; // <--- Importante: Configuração do Redis

import { calculateDashboardMetrics } from "./utils"; // <--- Importando a lógica extraída

export const tasksRouter = createTRPCRouter({
  // 1. CREATE
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

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

  // 2. GET ALL
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

  // 6. DASHBOARD STATS
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const allTasks = await ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    return calculateDashboardMetrics(allTasks);
  }),

  // ✅ 7. PUBLIC STATS (Corrigido: users plural)
  getPublicStats: publicProcedure.query(async ({ ctx }) => {
    // Usamos sql.raw ou sql simples para evitar problemas de tipagem no count
    const [userRes] = await ctx.db
      .select({ count: sql`count(*)` })
      .from(users); // <--- CORRIGIDO: 'users' (plural)
    
    const [taskRes] = await ctx.db
      .select({ count: sql`count(*)` })
      .from(tasks);
    
    const [completedRes] = await ctx.db
      .select({ count: sql`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, "DONE"));

    return {
      // O Postgres retorna count como string (ex: "10"), convertemos aqui
      users: Number(userRes?.count ?? 0),
      tasks: Number(taskRes?.count ?? 0),
      completed: Number(completedRes?.count ?? 0),
    };
  }),
});