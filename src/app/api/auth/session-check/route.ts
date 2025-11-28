import { db } from "@/lib/db";
import { sessions } from "../../../../../database/schema";
import { eq, and, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  const token = req.headers.get("x-session-token");

  if (!token) {
    return NextResponse.json({ isValid: false }, { status: 401 });
  }

  try {
    // token já É o sessionToken
    const sessionToken = token;

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
    }

    return NextResponse.json({ isValid: false }, { status: 401 });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ isValid: false }, { status: 500 });
  }
}