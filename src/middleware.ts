import NextAuth from "next-auth";
import { auth } from "@/Config/auth"; // Ajuste o import conforme sua nova estrutura
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/app");
  const isOnAuthRoute = req.nextUrl.pathname.startsWith("/auth");

  // Se estiver logado e tentar acessar /auth/login, manda pro dashboard
  if (isLoggedIn && isOnAuthRoute) {
    return NextResponse.redirect(new URL("/app", req.nextUrl));
  }

  // Se NÃO estiver logado e tentar acessar /app, manda pro login
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  return NextResponse.next();
});

// Configuração: Onde o middleware deve rodar
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};