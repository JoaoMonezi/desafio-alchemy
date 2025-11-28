import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users } from "../../database/schema"; 
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  
  // ✅ Apenas JWT - sem sessão no banco
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  secret: process.env.AUTH_SECRET,
  
  ...authConfig,

  providers: [
    ...authConfig.providers,
    
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) return user;
        return null;
      },
    }),
  ],

  callbacks: {
    // ✅ JWT Callback - Adiciona dados ao token
    async jwt({ token, user, trigger, session }) {
      // No momento do login, adiciona o user.id ao token
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Permite atualizar o token via update (opcional)
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    // ✅ Session Callback - Expõe dados para o cliente
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});