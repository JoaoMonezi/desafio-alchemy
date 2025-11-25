"use client";

import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { newPassword } from "@/actions/reset-actions";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { toast } from "sonner";

function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const data = await newPassword(token, formData);
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Senha alterada! Redirecionando...");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    });
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Nova Senha</CardTitle>
        <CardDescription>Digite sua nova senha segura</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Nova Senha</label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Alterando..." : "Redefinir Senha"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="underline">
            Voltar para Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewPasswordPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Suspense>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
