import { db } from "@/lib/db";
import { passwordResetTokens } from "../../database/schema";
import { eq } from "drizzle-orm";

export const generatePasswordResetToken = async (email: string) => {
  // 1. Gera um token aleatório e data de expiração (1 hora)
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hora

  // 2. Verifica se já existe um token para esse email e apaga
  const existingToken = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.email, email));

  if (existingToken[0]) {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, existingToken[0].id));
  }

  // 3. Cria o novo token no banco
  const [passwordResetToken] = await db
    .insert(passwordResetTokens)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return passwordResetToken;
};

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const [passwordResetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    return passwordResetToken;
  } catch {
    return null;
  }
};