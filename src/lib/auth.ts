import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users } from "../../database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db), // Conecta o Auth com suas tabelas
  session: { strategy: "jwt" }, // Sessão via Token (mais rápido e seguro para Next)
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // 1. Valida se os dados chegaram
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        // 2. Busca o usuário no banco
        // Note: Retorna um array, pegamos o primeiro item [user]
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user) return null;
        if (!user.password) return null; // Se usuário existe mas não tem senha (login social)

        // 3. Verifica se a senha bate
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) return user;
        
        return null;
      },
    }),
  ],
  callbacks: {
    // Adiciona o ID do usuário no token para usarmos no front
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});