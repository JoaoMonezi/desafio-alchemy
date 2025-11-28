import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/Config/auth"; // <-- O mais importante

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard =
    pathname.startsWith("/app") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/settings");

  const isAuthRoute = pathname.startsWith("/auth");

  // 🌱 Decodifica o JWT do cookie automaticamente!
  const session = await auth();

  const isLogged = !!session?.user;

  // 🔒 Bloqueia rotas protegidas
  if (isDashboard && !isLogged) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url)
    );
  }

  // 🚪 Usuário já logado tentando acessar login/register
  if (isLogged && isAuthRoute) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
