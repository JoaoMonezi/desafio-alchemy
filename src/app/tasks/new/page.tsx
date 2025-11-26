import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
import { TaskForm } from "@/features/TaskManager/components/task-form"; // Importamos o componente que você já tem
import { Button } from "@/_shared/components/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewTaskPage() {
  // 1. Proteção da Rota (Backend)
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Cabeçalho da Página */}
      <div className="mb-6">
        <Link href="/tasks">
          <Button variant="ghost" className="pl-0 hover:pl-2 transition-all mb-2">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nova Tarefa</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para adicionar um novo item à sua lista.
        </p>
      </div>

      {/* Área do Formulário */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        {/* Aqui encaixamos o seu componente TaskForm */}
        <TaskForm />
      </div>
    </div>
  );
}