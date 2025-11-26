import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
import { TaskList } from "@/features/TaskManager/components/task-list";

export default async function TasksPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col flex-1 w-full h-full p-3 sm:p-3 md:p-6 lg:p-8 bg-slate-50/30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Tarefas</h1>
        <p className="text-muted-foreground mt-1">
          Visualize, filtre e gerencie suas atividades.
        </p>
      </div>
      
      {/* Renders the complete list with filters */}
      <TaskList />
    </div>
  );
}