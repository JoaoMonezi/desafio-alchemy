import { db } from "@/lib/db";
import { sessions } from "../../../../../database/schema";
import { eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
// Importamos o decodificador de JWT
import { decode } from "next-auth/jwt";

export async function GET(req: Request) {
  // 1. O Middleware manda o cookie bruto no header
  const token = req.headers.get("x-session-token");

  if (!token) {
    return NextResponse.json({ isValid: false }, { status: 401 });
  }

  try {
    // 2. Decodificar o JWT para ler o conteúdo (sessionToken)
    let decoded = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt: "authjs.session-token", // Padrão
    });

    // Tentativa de Fallback para a chave de segurança (se a primeira falhar)
    if (!decoded || !decoded.sessionToken) {
        decoded = await decode({
            token,
            secret: process.env.AUTH_SECRET!,
            salt: "__Secure-authjs.session-token",
        });
    }

    // 3. Checa se conseguimos decodificar e se o token interno existe
    if (!decoded || !decoded.sessionToken) {
      console.log("🚫 [SessionCheck] Falha ao decodificar ou token interno ausente.");
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    // ✅ Extraímos o ID da Sessão do Banco que está dentro do JWT
    const sessionToken = decoded.sessionToken as string;

    // 4. Validar no Banco de Dados: O ID existe e não expirou?
    const [dbSession] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expires, new Date())
        )
      );

    if (dbSession) {
      // ✅ Encontrou no banco
      return NextResponse.json({ isValid: true, userId: dbSession.userId });
    } else {
      // 🚫 Não encontrou no banco (sessão revogada ou expirada)
      console.log(`🚫 [SessionCheck] Token JWT válido, mas sessão revogada no DB.`);
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

  } catch (error) {
    console.error("🚫 [SessionCheck] Erro crítico na decodificação:", error);
    // Retornamos 401 em caso de erro, mas registramos o 500 no console.
    return NextResponse.json({ isValid: false }, { status: 401 }); 
  }
}