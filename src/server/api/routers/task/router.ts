import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";
import { tasks, users } from "../../../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { ratelimit } from "@/Config/ratelimit";

type TaskInsert = typeof tasks.$inferInsert;

export const taskRouter = createTRPCRouter({
  // 1. CREATE (✅ CORRIGIDO SEM WARNINGS)
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string; 
      
      const { success } = await ratelimit.limit(`create_task:${userId}`);
      if (!success) {
        throw new TRPCError({ 
          code: "TOO_MANY_REQUESTS", 
          message: "Muitas requisições." 
        });
      }

      // ✅ Construir objeto com tipagem correta
      const taskData = {
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status,
        userId: userId,
        ...(input.dueDate instanceof Date && { dueDate: input.dueDate }),
      } satisfies Omit<TaskInsert, 'id' | 'createdAt' | 'updatedAt'>;

      const [newTask] = await ctx.db
        .insert(tasks)
        .values(taskData)
        .returning();

      return newTask;
    }),

  // 2. GET ALL
  getAll: protectedProcedure
    .input(filterTaskSchema.optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string; 
      const filters = [eq(tasks.userId, userId)];
      
      if (input?.status) filters.push(eq(tasks.status, input.status));
      if (input?.priority) filters.push(eq(tasks.priority, input.priority));
      if (input?.from) filters.push(gte(tasks.dueDate, input.from));
      if (input?.to) filters.push(lte(tasks.dueDate, input.to));
      
      const orderBy = input?.sort === "asc" ? asc(tasks.dueDate) : 
                      input?.sort === "desc" ? desc(tasks.dueDate) : 
                      desc(tasks.createdAt);

      return ctx.db.select().from(tasks).where(and(...filters)).orderBy(orderBy);
    }),

  // 3. GET BY ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string; 
      const [task] = await ctx.db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)));
      return task || null;
    }),

  // 4. UPDATE
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string;
      const { id, dueDate, ...data } = input;
      
      // Construir objeto de atualização
      const updateData = {
        ...data,
        updatedAt: new Date(),
        ...(dueDate !== undefined && { dueDate: dueDate || null }),
      };

      const [updatedTask] = await ctx.db
        .update(tasks)
        .set(updateData)
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
        .returning();

      if (!updatedTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tarefa não encontrada."
        });
      }

      return updatedTask;
    }),

  // 5. DELETE
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string;
      
      const [deletedTask] = await ctx.db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)))
        .returning();

      if (!deletedTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tarefa não encontrada."
        });
      }

      return { success: true, id: deletedTask.id };
    }),
});