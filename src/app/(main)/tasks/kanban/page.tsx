import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
import { TaskKanban } from "@/app/(main)/tasks/_components/task-kanban";

export default async function KanbanPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col h-screen w-full p-6 bg-slate-50/30 overflow-hidden">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quadro Kanban</h1>
        <p className="text-muted-foreground mt-1">
          Arraste e solte para organizar seu fluxo de trabalho.
        </p>
      </div>
      
      {/* Área do Kanban (ocupa o resto da altura e permite scroll horizontal) */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <TaskKanban />
      </div>
    </div>
  );
}