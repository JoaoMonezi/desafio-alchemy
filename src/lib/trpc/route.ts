import { createTRPCRouter, publicProcedure, protectedProcedure } from "./init";
import { tasksRouter } from "@/features/TaskManager/router";
import { profileRouter } from "@/features/Profile/components/route"  ; // <--- 1. Importar o router do perfil

export const appRouter = createTRPCRouter({
  // Rotas de Teste
  healthcheck: publicProcedure.query(() => {
    return { status: "ok", message: "tRPC funcionando!" };
  }),
  
  secretMessage: protectedProcedure.query(({ ctx }) => {
    return { 
      message: `Olá, ${ctx.session.user.name}!`,
      serverTime: new Date(),
    };
  }),

  // Feature: Tarefas
  tasks: tasksRouter,
  
  // Feature: Perfil (✅ 2. Adicionar aqui)
  profile: profileRouter, 
});

export type AppRouter = typeof appRouter;