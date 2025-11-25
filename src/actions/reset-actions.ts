"use server";

import { db } from "@/lib/db";
import { users, passwordResetTokens } from "../../database/schema";
import { eq } from "drizzle-orm";
import { generatePasswordResetToken, getPasswordResetTokenByToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

// Ação 1: Usuário pede o reset (digita o email)
export const reset = async (formData: FormData) => {
  const email = formData.get("email") as string;

  if (!email) return { error: "Email é obrigatório" };

  // Verifica se usuário existe
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!existingUser) {
    // Por segurança, não dizemos se o email existe ou não, apenas dizemos "Email enviado"
    return { success: "Email de redefinição enviado!" };
  }

  // Gera token e envia email
  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Email de redefinição enviado!" };
};

// Ação 2: Usuário define a nova senha
export const newPassword = async (token: string | null, formData: FormData) => {
  const password = formData.get("password") as string;

  if (!token) return { error: "Token ausente!" };
  if (!password) return { error: "Senha é obrigatória!" };

  // 1. Valida o token no banco
  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Token inválido!" };
  }

  // 2. Verifica se expirou
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Token expirado!" };
  }

  // 3. Encontra o usuário
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, existingToken.email));

  if (!existingUser) {
    return { error: "Email não existe!" };
  }

  // 4. Hash da nova senha e atualização
  const hashedPassword = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, existingUser.id));

  // 5. Apaga o token usado
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.id, existingToken.id));

  return { success: "Senha atualizada com sucesso!" };
};