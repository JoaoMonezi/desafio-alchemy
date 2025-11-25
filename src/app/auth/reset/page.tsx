"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reset } from "@/actions/reset-actions";
import { useActionState, startTransition } from "react";
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

// Schema simples apenas para validar formato de email no front
const resetSchema = z.object({
  email: z.string().email("Digite um email válido"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPage() {
  const [state, action, isPending] = useActionState(reset, null);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ResetFormValues) => {
    const formData = new FormData();
    formData.append("email", values.email);

    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px] bg-white">
        <CardHeader>
          <CardTitle>Esqueci a Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber o link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Sucesso: Caixa Verde (Backend) */}
          {state?.success && (
            <div className="p-3 mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md text-center">
              {state.success}
            </div>
          )}

          {/* Erro: Caixa Vermelha (Backend) */}
          {state?.error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md text-center">
              {state.error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar Email"}
              </Button>
            </form>
          </Form>

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