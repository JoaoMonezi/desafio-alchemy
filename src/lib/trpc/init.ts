import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/Config/auth"; 
import { db } from "@/lib/db"; // <--- 1. IMPORTAR O BANCO
import { cache } from "react";
import superjson from "superjson";

// 1. CONTEXTO
export const createTRPCContext = cache(async () => {
  const session = await auth();
  
  // 2. INJETAR NO RETORNO
  return { 
    session,
    db, // <--- Agora 'ctx.db' vai existir em todos os roteadores!
  };
});

// 2. INICIALIZAÇÃO
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

// 3. EXPORTAÇÕES BASE
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

// 5. PROCEDURE PROTEGIDA
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // TypeScript infere que 'db' existe porque vem do contexto pai
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});