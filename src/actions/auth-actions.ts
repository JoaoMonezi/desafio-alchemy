"use server";

import { db } from "@/lib/db";
import { users } from "../../database/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { signIn } from "@/Config/auth";
import { AuthError } from "next-auth";
import { registerSchema, loginSchema } from "@/_shared/util/schemas";

export async function registerUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = registerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { name, email, password } = validatedFields.data;

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return { error: "Email já cadastrado!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

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
    throw error; 
  }

  return { success: true };
}

export async function loginUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: "Dados inválidos." };
  }

  const { email, password } = validatedFields.data;

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
          return { error: "Algo deu errado. Tente novamente." };
      }
    }
    throw error;
  }

  return { success: true };
}