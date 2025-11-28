import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";
import { tasks, users } from "../../../../../database/schema";
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from "./schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { ratelimit } from "@/Config/ratelimit";

type TaskInsert = typeof tasks.$inferInsert;

export const taskRouter = createTRPCRouter({
  // 1. CREATE (Corrigido: Garantindo que todos os valores null/default são resolvidos)
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string; 
      
      const { success } = await ratelimit.limit(`create_task:${userId}`);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Muitas requisições." });
      }

      // ✅ CORREÇÃO: Forçamos a inserção de 'null' ou o objeto Date
      const dueDateValue = input.dueDate instanceof Date ? input.dueDate : null; 

      await ctx.db.insert(tasks).values({
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status,
        dueDate: dueDateValue, // Usamos o valor tratado (Date | null)
        userId: userId, 
      } as TaskInsert); 
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

  // 3. GET BY ID (Mantido)
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

  // 4. UPDATE (Aplica a mesma lógica para dueDate)
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string;
      const { id, dueDate, ...data } = input;
      
      // Mapeia dueDate para null se for undefined ou null
      const dueDateUpdate = dueDate === undefined ? undefined : (dueDate || null);

      await ctx.db.update(tasks).set({
        ...data,
        dueDate: dueDateUpdate,
      }).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    }),

  // 5. DELETE (Mantido)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user!.id as string;
      await ctx.db.delete(tasks).where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)));
    }),
});