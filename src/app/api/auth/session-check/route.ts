import { db } from "@/lib/db";
import { sessions } from "../../../../../database/schema"; // Adjust path if necessary (e.g. ../../../../database/schema)
import { eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

export async function GET(req: Request) {
  const token = req.headers.get("x-session-token");

  if (!token) {
    return NextResponse.json({ isValid: false }, { status: 401 });
  }

  try {
    // 1. Decodificar o JWT apenas para pegar o ID da sessão (sessionToken)
    // Não confiamos apenas na assinatura dele, queremos o ID para checar no banco.
    let decoded = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt: "authjs.session-token",
    });

    if (!decoded) {
       decoded = await decode({
         token,
         secret: process.env.AUTH_SECRET!,
         salt: "__Secure-authjs.session-token",
       });
    }

    // Se não conseguiu ler o token, já era.
    if (!decoded || !decoded.sessionToken) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    const sessionToken = decoded.sessionToken as string;

    // 2. A CHECAGEM RIGOROSA (O segredo está aqui)
    // Buscamos no banco. Se não achar, retorna FALSO.
    const [dbSession] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expires, new Date()) // Tem que estar no futuro
        )
      );

    if (dbSession) {
      // ✅ Achou no banco: Sessão Válida
      return NextResponse.json({ isValid: true, userId: dbSession.userId });
    } else {
      // 🚫 Não achou no banco (foi deletada ou expirou): SESSÃO INVÁLIDA
      // Mesmo que o cookie no navegador ainda esteja "novo", nós bloqueamos.
      console.log(`🚫 Sessão revogada/não encontrada para token: ${sessionToken}`);
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ isValid: false }, { status: 500 });
  }
}