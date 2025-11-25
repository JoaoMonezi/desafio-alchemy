"use server";

import { db } from "@/lib/db";
import { users } from "../../database/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { signIn } from "@/lib/auth"; // Importando do nosso config
import { AuthError } from "next-auth";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha todos os campos!" };
  }

  // 1. Verificar se usuário já existe
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return { error: "Email já cadastrado!" };
  }

  // 2. Criptografar senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Salvar no banco
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Logar automaticamente após cadastro
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/app", // Manda para o dashboard
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Erro ao logar automaticamente." };
    }
    throw error; // Next.js redirect lança erro, precisamos deixar passar
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/app",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email ou senha incorretos." };
        default:
          return { error: "Algo deu errado." };
      }
    }
    throw error;
  }
}