"use server";

import { db } from "@/lib/db";
import { users, passwordResetTokens } from "../../database/schema";
import { eq } from "drizzle-orm";
import { generatePasswordResetToken, getPasswordResetTokenByToken } from "@/_shared/services/tokens";
import { sendPasswordResetEmail } from "@/_shared/services/mail";
import bcrypt from "bcryptjs";
import { passwordSchema } from "@/_shared/util/schemas";

// Ação 1: Reset (Agora avisa se o email não existe)
export const reset = async (prevState: any, formData: FormData) => {
  const email = formData.get("email") as string;

  if (!email) return { error: "Email é obrigatório" };

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  // MUDANÇA: Agora retornamos erro explícito em vez de sucesso falso
  if (!existingUser) {
    return { error: "Email não encontrado!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Email de redefinição enviado!" };
};

// Ação 2: Nova Senha
export const newPassword = async (prevState: any, formData: FormData) => {
  const password = formData.get("password") as string;
  const token = formData.get("token") as string;

  if (!token) {
    return { error: "Token ausente! Tente clicar no link do email novamente." };
  }

  // 1. Validação Zod (Senha Forte)
  const validation = passwordSchema.safeParse(password);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // 2. Valida o token no banco
  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Token inválido! Solicite uma nova redefinição." };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "O Token expirou! Solicite um novo email." };
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, existingToken.email));

  if (!existingUser) {
    return { error: "Email não existe!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, existingUser.id));

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.id, existingToken.id));

  return { success: "Senha atualizada com sucesso!" };
};