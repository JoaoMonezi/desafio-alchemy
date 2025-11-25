"use server";

import { db } from "@/lib/db";
import { users } from "../../database/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { signIn } from "@/Config/auth";
import { AuthError } from "next-auth";
import { registerSchema, loginSchema } from "@/_shared/util/schemas";

// --- Ação de Registro ---
export async function registerUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  // 1. Validação Zod no Server (Segurança)
  const validatedFields = registerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    // Retorna a primeira mensagem de erro amigável definida no schema
    return { error: validatedFields.error.issues[0].message };
  }

  const { name, email, password } = validatedFields.data;

  // 2. Verificar duplicidade no banco
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return { error: "Email já cadastrado!" };
  }

  // 3. Hash da Senha e Criação do Usuário
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Login Automático
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/app",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Erro ao logar automaticamente." };
    }
    throw error; // Importante relançar para o redirect do Next.js funcionar
  }

  return { success: true };
}

// --- Ação de Login ---
export async function loginUser(prevState: any, formData: FormData) {
  // Converter FormData para Objeto para o Zod ler
  const rawData = Object.fromEntries(formData.entries());

  // 1. Validação Zod Server-Side
  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: "Dados inválidos." };
  }

  const { email, password } = validatedFields.data;

  // 2. Tentar Login
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/app",
    });
  } catch (error) {
    // O NextAuth lança erros padrão que podemos capturar para feedback
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          // AQUI: Esse é o erro de senha errada que vai aparecer no Toast
          return { error: "Email ou senha incorretos." };
        default:
          return { error: "Algo deu errado. Tente novamente." };
      }
    }
    // Se não for erro de Auth (ex: erro de redirect NEXT_REDIRECT),
    // precisamos relançar para o Next.js tratar a navegação
    throw error;
  }

  return { success: true };
}