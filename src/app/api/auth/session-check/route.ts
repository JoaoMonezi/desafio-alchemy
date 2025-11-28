import { db } from "@/lib/db";
import { sessions } from "../../../../../database/schema";
import { eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  try {
    // 1. Pega token do cookie automaticamente (com salt certo)
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET!,
    });

    if (!token || !token.sessionToken) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    const sessionToken = token.sessionToken as string;

    // 2. Confirma no banco
    const [dbSession] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expires, new Date())
        )
      );

    if (!dbSession) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    return NextResponse.json({
      isValid: true,
      userId: dbSession.userId,
    });

  } catch (err) {
    console.error("Session check error:", err);
    return NextResponse.json({ isValid: false }, { status: 500 });
  }
}
