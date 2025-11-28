
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("AUTH_SECRET", process.env.AUTH_SECRET);
console.log("NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET);
  const { pathname } = req.nextUrl;
  
  // 1. Definir quais rotas são protegidas e quais são de auth
  const isOnDashboard = pathname.startsWith("/app") || pathname.startsWith("/tasks") || pathname.startsWith("/settings");
  const isOnAuthRoute = pathname.startsWith("/auth");
  
  // 2. Ler o token do cookie manualmente
  // O nome do cookie muda se estiver em produção (Secure) ou local
  const sessionToken = 
    req.cookies.get("authjs.session-token")?.value || 
    req.cookies.get("__Secure-authjs.session-token")?.value;

  let isValidSession = false;

  // 3. Se o cookie existe, validamos ele chamando nossa API interna
  if (sessionToken) {
    try {
      // Precisamos montar a URL absoluta porque o fetch no server-side exige
      const url = req.nextUrl.clone();
      url.pathname = "/api/auth/session-check";
      
      const response = await fetch(url, {
        headers: {
          "x-session-token": sessionToken, // Passamos o token no header
        },
        cache: "no-store", // Importante: não cachear a validação
      });

      const data = await response.json();
      isValidSession = data.isValid;
    } catch (error) {
      console.error("Erro ao validar sessão no middleware:", error);
      isValidSession = false;
    }
  }

  // 4. Regras de Redirecionamento

  // Cenário A: Usuário já logado tentando acessar Login/Register -> Redireciona para o App
  if (isValidSession && isOnAuthRoute) {
    return NextResponse.redirect(new URL("/app", req.nextUrl));
  }

  // Cenário B: Usuário NÃO logado (ou sessão inválida/expirada) tentando acessar rota protegida -> Manda para Login
  if (!isValidSession && isOnDashboard) {
    // Dica: Passamos a URL de retorno para redirecionar o usuário de volta para onde ele queria ir depois de logar
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.nextUrl));
  }

  // Se não caiu em nenhuma regra, deixa passar
  return NextResponse.next();
}

// Configuração: Onde o middleware deve rodar
// Ignora arquivos estáticos, imagens e a própria API de auth (para não gerar loop)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};