import { auth } from "@/Config/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  
  // 1. Definir quais rotas são protegidas e quais são de auth
  const isOnDashboard = pathname.startsWith("/app") || 
                        pathname.startsWith("/tasks") || 
                        pathname.startsWith("/settings");
  
  const isOnAuthRoute = pathname.startsWith("/auth");
  
  // 2. Verificar se o usuário está autenticado (via JWT)
  const isAuthenticated = !!req.auth;

  // 3. Regras de Redirecionamento

  // Cenário A: Usuário já logado tentando acessar Login/Register → Redireciona para o App
  if (isAuthenticated && isOnAuthRoute) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // Cenário B: Usuário NÃO logado tentando acessar rota protegida → Manda para Login
  if (!isAuthenticated && isOnDashboard) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url));
  }

  // Se não caiu em nenhuma regra, deixa passar
  return NextResponse.next();
});

// Configuração: Onde o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};