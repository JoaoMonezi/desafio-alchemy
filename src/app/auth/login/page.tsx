import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { loginUser } from "@/actions/auth-actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Bem-vindo de volta</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginUser} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Senha</label>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
            <div className="flex justify-end">
              <Link href="/auth/reset" className="text-sm text-blue-600 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
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