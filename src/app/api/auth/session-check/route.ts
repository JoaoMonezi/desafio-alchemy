import { db } from "@/lib/db";
import { sessions } from "../../../../../database/schema";
import { eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

export async function GET(req: Request) {
  console.log("session check SECRET", process.env.AUTH_SECRET);
  const token = req.headers.get("x-session-token");

  if (!token) {
    return NextResponse.json({ isValid: false }, { status: 401 });
  }

  try {
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

    if (!decoded || !decoded.sessionToken) {
      console.log("🚫 [SessionCheck] Falha ao decodificar ou token interno ausente.");
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    const sessionToken = decoded.sessionToken as string;

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
      return NextResponse.json({ isValid: true, userId: dbSession.userId });
    } else {
      console.log(`🚫 [SessionCheck] Token JWT válido, mas sessão revogada no DB.`);
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

  } catch (error) {
    console.error("🚫 [SessionCheck] Erro crítico na decodificação:", error);
    return NextResponse.json({ isValid: false }, { status: 401 }); 
  }
}