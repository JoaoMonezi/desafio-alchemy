import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { tasks } from "../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm"; 
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
});