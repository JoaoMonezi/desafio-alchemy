"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { passwordSchema } from "@/_shared/util/schemas";
import { newPassword } from "@/actions/reset-actions";
import { useActionState, useEffect, startTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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

// Schema local usando a regra de senha forte
const formSchema = z.object({
  password: passwordSchema,
});

type NewPasswordValues = z.infer<typeof formSchema>;

function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [state, action, isPending] = useActionState(newPassword, null);

  const form = useForm<NewPasswordValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  // Sucesso: Toast verde e redirecionamento
  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  }, [state, router]);

  const onSubmit = (values: NewPasswordValues) => {
    if (!token) {
      toast.error("Token inválido ou ausente!");
      return;
    }

    const formData = new FormData();
    formData.append("password", values.password);
    formData.append("token", token);

    startTransition(() => {
      action(formData);
    });
  };

  return (
    <Card className="w-[350px] bg-white">
      <CardHeader>
        <CardTitle>Nova Senha</CardTitle>
        <CardDescription>Digite sua nova senha segura</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Caixa Vermelha de Erro (Backend) */}
            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md text-center">
                {state.error}
              </div>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Alterando..." : "Redefinir Senha"}
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