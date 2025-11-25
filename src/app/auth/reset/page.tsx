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
import { reset } from "@/actions/reset-actions";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function ResetPage() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const data = await reset(formData);
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.success);
      }
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Esqueci a Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber o link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar Email"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/login" className="underline">
              Voltar para Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}