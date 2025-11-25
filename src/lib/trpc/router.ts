import { createTRPCRouter, publicProcedure, protectedProcedure } from "./init";

export const appRouter = createTRPCRouter({
  // Rota simples para testar se o servidor está vivo (Pública)
  healthcheck: publicProcedure.query(() => {
    return { status: "ok", message: "tRPC funcionando a todo vapor! 🚀" };
  }),

  // Rota que só usuários logados conseguem chamar (Protegida)
  secretMessage: protectedProcedure.query(({ ctx }) => {
    return { 
      message: `Olá, ${ctx.session.user.name}! Você tem acesso à área secreta.`,
      serverTime: new Date(),
    };
  }),
});

// Exportamos o TIPO do roteador para o Frontend usar (Type Inference)
export type AppRouter = typeof appRouter