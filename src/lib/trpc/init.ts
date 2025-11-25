import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/Config/auth"; // Sua config completa
import { cache } from "react";
import superjson from "superjson";

// 1. Contexto: Roda em cada requisição para preparar o terreno
export const createTRPCContext = cache(async () => {
  const session = await auth();
  return { session };
});

// 2. Inicialização
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson, // Permite passar Datas e Maps automaticamente
});

// 3. Exportar Router e Caller
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// 4. Procedure Pública (Qualquer um acessa)
export const publicProcedure = t.procedure;

// 5. Procedure Protegida (Só logado acessa)
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // Infere que session existe e não é nula daqui pra frente
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});