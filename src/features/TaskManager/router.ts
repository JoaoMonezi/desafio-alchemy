import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { tasks } from "../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, gte, lte } from "drizzle-orm"; 
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

  // ATUALIZADO: Lógica de Filtros Completa
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
      // Filtro de Data (De... Até...)
      if (input?.from) {
        filters.push(gte(tasks.dueDate, input.from));
      }
      if (input?.to) {
        filters.push(lte(tasks.dueDate, input.to));
      }

      return ctx.db
        .select()
        .from(tasks)
        .where(and(...filters))
        .orderBy(desc(tasks.createdAt));
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
});