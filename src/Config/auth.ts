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
  // ✅ SOLUÇÃO: Adapter simples (sem especificar tabelas)
  adapter: DrizzleAdapter(db),
  
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
          .object({ 
            email: z.string().email(), 
            password: z.string().min(6) 
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log("❌ Credenciais inválidas");
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user || !user.password) {
          console.log("❌ Usuário não encontrado ou sem senha");
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          console.log("❌ Senha incorreta");
          return null;
        }

        console.log("✅ Login bem-sucedido:", user.email);
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

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
    signIn: "/auth/login",
    error: "/auth/login",
  },

});