import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
// Certifique-se que 'sessions' está sendo importado do seu schema
import { users, sessions } from "../../database/schema"; 
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  
  // Estratégia JWT para performance e compatibilidade com Middleware
  session: { strategy: "jwt" },
  
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
    // 1. Callback JWT: Executa no login (Google, Discord ou Senha)
    async jwt({ token, user, trigger }) {
      // Se for o momento do LOGIN ('signIn')
      if (trigger === "signIn" && user?.id) {
        const sessionToken = crypto.randomUUID();
        const expires = new Date();
        expires.setDate(expires.getDate() + 30); // 30 dias

        // Persistir a sessão no banco (Funciona para TODOS os providers)
        await db.insert(sessions).values({
          userId: user.id,
          sessionToken: sessionToken,
          expires: expires,
        });

        // AQUI ESTÁ O SEGREDO:
        // Salvamos o ID da sessão do banco DENTRO do token JWT.
        // Assim, o middleware consegue ler o cookie, pegar esse ID e conferir no banco.
        token.sessionToken = sessionToken;
        token.sub = user.id;
      }
      return token;
    },

    // 2. Callback Session: Passa dados para o frontend
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // @ts-ignore - Repassa o token da sessão se precisar usar no client
        session.sessionToken = token.sessionToken;
      }
      return session;
    },
  },

  // Removemos o 'events' pois agora o 'jwt' cuida de tudo
});