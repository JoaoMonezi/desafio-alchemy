import { createTRPCRouter, publicProcedure, protectedProcedure } from "./init";
import { tasksRouter } from "@/server/api/routers/task/router";
import { profileRouter } from "@/server/api/routers/profile/route" ;
import { dashboardRouter } from "@/server/api/routers/dashboard/router";

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

  dashboard: dashboardRouter,

});

export type AppRouter = typeof appRouter;