import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
import { TaskForm } from "@/features/TaskManager/components/task-form";

export default async function NewTaskPage() {
  // 1. Proteção da Rota (Backend)
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    // MUDANÇA: Removemos 'max-w-6xl' e 'mx-auto'.
    // Adicionamos as classes responsivas que você mencionou para preencher a tela toda.
    <div className="flex flex-col flex-1 w-full h-full p-3 sm:p-3 md:p-6 lg:p-8 bg-slate-50/50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nova Tarefa</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para adicionar um novo item à sua lista.
        </p>
      </div>

      {/* Área do Formulário Expandida */}
      <div className="flex-1 border rounded-xl p-6 bg-white shadow-sm h-full">
        <TaskForm />
      </div>
    </div>
  );
}