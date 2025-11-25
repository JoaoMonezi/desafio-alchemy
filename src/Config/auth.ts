import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
// Certifique-se que este caminho aponta para o seu schema do Drizzle
import { users } from "../../database/schema"; 
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import authConfig from "./auth.config"; // <--- Importa a config leve

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  
  // Espalha a configuração leve (Callbacks, Pages, etc)
  ...authConfig,

  providers: [
    // Adiciona novamente os providers leves (Google/Discord) para garantir que estejam registrados
    ...authConfig.providers,
    
    // Adiciona o provider de Credenciais (Que só funciona no ambiente Node.js)
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // 1. Validação dos tipos de entrada
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        // 2. Busca no banco
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user || !user.password) return null;

        // 3. Compara a senha
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) return user;
        return null;
      },
    }),
  ],
});