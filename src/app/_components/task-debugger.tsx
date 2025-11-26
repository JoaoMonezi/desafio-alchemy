"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/_shared/components/button";
import { toast } from "sonner";

export function TaskDebugger() {
  // 1. Hook para atualizar a lista após criar/deletar
  const utils = trpc.useUtils();

  // 2. Buscar Tarefas (Query)
  const { data: tasks, isLoading } = trpc.tasks.getAll.useQuery({});

  // 3. Criar Tarefa (Mutation)
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada!");
      utils.tasks.getAll.invalidate(); // Atualiza a lista automaticamente
    },
    onError: (err) => toast.error(err.message),
  });

  // 4. Deletar Tarefa (Mutation)
  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa deletada!");
      utils.tasks.getAll.invalidate();
    },
  });

  return (
    <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl space-y-6 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          🛠️ Laboratório de Testes
          <span className="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Debug Mode</span>
        </h3>
        
        <Button 
          onClick={() => createTask.mutate({
            title: `Tarefa Teste #${Math.floor(Math.random() * 1000)}`,
            priority: "MEDIUM",
            status: "TODO",
            description: "Criada via Debugger"
          })}
          disabled={createTask.isPending}
        >
          {createTask.isPending ? "Criando..." : "+ Gerar Tarefa Aleatória"}
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Banco de Dados ({tasks?.length || 0})
        </h4>
        
        {isLoading ? (
          <div className="h-10 bg-slate-200 animate-pulse rounded" />
        ) : (
          <ul className="space-y-2">
            {tasks?.map((task) => (
              <li key={task.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border">
                <div className="flex flex-col">
                  <span className="font-medium">{task.title}</span>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span className="bg-blue-100 text-blue-700 px-1.5 rounded">{task.status}</span>
                    <span className="bg-purple-100 text-purple-700 px-1.5 rounded">{task.priority}</span>
                    <span>ID: {task.id}</span>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteTask.mutate({ id: task.id })}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending ? "..." : "Apagar"}
                </Button>
              </li>
            ))}
            
            {tasks?.length === 0 && (
              <p className="text-center py-8 text-slate-400 italic border rounded border-dashed">
                Nenhuma tarefa no banco. Clique no botão acima!
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}