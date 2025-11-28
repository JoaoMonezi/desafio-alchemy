import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";
import { tasks, users } from "../../../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { ratelimit } from "@/Config/ratelimit";

export const taskRouter = createTRPCRouter({
  // 1. CREATE (✅ CORRIGIDO)
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

      // ✅ SOLUÇÃO: Adicionar timestamps explicitamente
      const now = new Date();

      try {
        const [newTask] = await ctx.db
          .insert(tasks)
          .values({
            title: input.title,
            description: input.description,
            priority: input.priority ?? "MEDIUM",  // ✅ Garante valor padrão
            status: input.status ?? "TODO",        // ✅ Garante valor padrão
            dueDate: input.dueDate ?? null,        // ✅ null se undefined
            userId: userId,
            createdAt: now,                        // ✅ Adiciona explicitamente
            updatedAt: now,                        // ✅ Adiciona explicitamente
          })
          .returning();

        return newTask;
      } catch (error) {
        console.error("Erro detalhado ao criar task:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar tarefa. Verifique os logs.",
        });
      }
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

  // 4. UPDATE (✅ CORRIGIDO)
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string;
      const { id, ...data } = input;
      
      try {
        const [updatedTask] = await ctx.db
          .update(tasks)
          .set({
            ...data,
            updatedAt: new Date(),  // ✅ Atualiza timestamp
          })
          .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
          .returning();

        if (!updatedTask) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tarefa não encontrada."
          });
        }

        return updatedTask;
      } catch (error) {
        console.error("Erro ao atualizar task:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar tarefa.",
        });
      }
    }),

  // 5. DELETE (✅ CORRIGIDO)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string;
      
      try {
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
      } catch (error) {
        console.error("Erro ao deletar task:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar tarefa.",
        });
      }
    }),
});