import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { z } from "zod";
import { users } from "../../../../../database/schema";
import { eq } from "drizzle-orm";

export const profileRouter = createTRPCRouter({
  updateAvatar: protectedProcedure
    .input(z.object({ imageUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      console.log("Salvando avatar no banco:", input.imageUrl); 

      await ctx.db
        .update(users)
        .set({ image: input.imageUrl }) 
        .where(eq(users.id, ctx.session.user.id!));
      
      return { success: true };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.session.user.id!));
      return user;
  }),
});