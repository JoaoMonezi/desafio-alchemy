import { createTRPCRouter, publicProcedure, protectedProcedure } from "./init";
import { tasksRouter } from "@/features/TaskManager/router"; // <--- Importamos o roteador da feature

export const appRouter = createTRPCRouter({
  // --- Rotas de Teste (Pode manter ou apagar depois) ---
  healthcheck: publicProcedure.query(() => {
    return { status: "ok", message: "tRPC funcionando a todo vapor! 🚀" };
  }),

  secretMessage: protectedProcedure.query(({ ctx }) => {
    return { 
      message: `Olá, ${ctx.session.user.name}! Você tem acesso à área secreta.`,
      serverTime: new Date(),
    };
  }),

  // --- Feature: Gerenciador de Tarefas ---
  tasks: tasksRouter, // <--- Adicionamos aqui. Agora 'trpc.tasks.*' existe!
});

// Exportamos o tipo para o Frontend usar
export type AppRouter = typeof appRouter;