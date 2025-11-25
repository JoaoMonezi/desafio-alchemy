import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginUser } from "@/actions/auth-actions";
import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px] bg-white"> {/* Forçando fundo branco no Card */}
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Escolha como deseja acessar</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Botões de Social Login */}
          <div className="flex flex-col gap-2 mb-4">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/app" });
              }}
            >
              {/* Botão Google: Forçando fundo branco, borda e texto preto */}
              <Button
                variant="outline"
                type="submit"
                className="w-full bg-white text-black border border-slate-200 hover:bg-slate-100 relative"
              >
                {/* Ícone Colorido do Google */}
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Entrar com Google
              </Button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("discord", { redirectTo: "/app" });
              }}
            >
              <Button
                type="submit"
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
              >
                {/* Ícone do Discord */}
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.772-.6083 1.1588a18.2915 18.2915 0 00-7.651 0 .1156.1156 0 00-.0685-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                </svg>
                Entrar com Discord
              </Button>
            </form>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              {/* CORREÇÃO: bg-white em vez de bg-background */}
              <span className="bg-white px-2 text-muted-foreground">
                Ou continue com email
              </span>
            </div>
          </div>

          <form action={loginUser} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>

              </div>
              <Input id="password" name="password" type="password" required />
               <Link
                  href="/auth/reset"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Esqueci minha senha
                </Link>
            </div>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Não tem conta?{" "}
            <Link href="/auth/register" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}