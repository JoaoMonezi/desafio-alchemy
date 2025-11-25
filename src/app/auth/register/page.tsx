"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/_shared/util/schemas";
import { z } from "zod";
import { useActionState, startTransition } from "react";
import { registerUser } from "@/actions/auth-actions";
import Link from "next/link";

import { Button } from "@/_shared/components/button";
import { Input } from "@/_shared/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/_shared/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/_shared/components/form";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerUser, null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);

    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px] bg-white">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>Comece a gerenciar suas tarefas</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Caixa Vermelha de Erro do Backend (Padronizado) */}
              {state?.error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md text-center">
                  {state.error}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Já tem conta?{" "}
            <Link href="/auth/login" className="underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}