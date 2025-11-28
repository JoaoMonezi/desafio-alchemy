import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { z } from "zod";
import { users } from "../../../../../database/schema";
import { eq } from "drizzle-orm";

export const profileRouter = createTRPCRouter({
  // Essa é a função que o seu componente chama para salvar o link
  updateAvatar: protectedProcedure
    .input(z.object({ imageUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      console.log("Salvando avatar no banco:", input.imageUrl); // Debug log

      await ctx.db
        .update(users)
        .set({ image: input.imageUrl }) // Campo 'image' na tabela 'user'
        .where(eq(users.id, ctx.session.user.id!));
      
      return { success: true };
    }),

  // Vamos criar uma query para buscar os dados frescos do usuário
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.session.user.id!));
      return user;
  }),
});