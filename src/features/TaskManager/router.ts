import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { tasks } from "../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const tasksRouter = createTRPCRouter({
  // 1. CRIAR TAREFA
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(tasks).values({
        ...input,
        userId: ctx.session.user.id, // Associa a tarefa ao usuário logado
      });
    }),

  // 2. LISTAR TAREFAS (Com filtros opcionais)
  getAll: protectedProcedure
    .input(filterTaskSchema.optional())
    .query(async ({ ctx, input }) => {
      // Filtros dinâmicos
      const filters = [eq(tasks.userId, ctx.session.user.id)]; // Sempre filtra pelo usuário

      if (input?.status) {
        filters.push(eq(tasks.status, input.status));
      }
      if (input?.priority) {
        filters.push(eq(tasks.priority, input.priority));
      }

      return ctx.db
        .select()
        .from(tasks)
        .where(and(...filters))
        .orderBy(desc(tasks.createdAt)); // Mais recentes primeiro
    }),

  // 3. ATUALIZAR TAREFA
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      await ctx.db
        .update(tasks)
        .set(updateData)
        .where(
          and(
            eq(tasks.id, id),
            eq(tasks.userId, ctx.session.user.id) // Segurança: só atualiza se for dono
          )
        );
    }),

  // 4. DELETAR TAREFA
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(tasks)
        .where(
          and(
            eq(tasks.id, input.id),
            eq(tasks.userId, ctx.session.user.id) // Segurança: só deleta se for dono
          )
        );
    }),
});