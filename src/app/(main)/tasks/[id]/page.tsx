import { auth } from "@/Config/auth";
import { redirect, notFound } from "next/navigation";
import { appRouter } from "@/lib/trpc/route";
import { createCallerFactory, createTRPCContext } from "@/lib/trpc/init";
import { TaskDetailView } from "@/app/(main)/tasks/_components/task-detail-view"; // Importa o componente visual da Feature

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskPageProps) {
  // 1. Segurança: Verifica sessão no servidor
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  // 2. Dados (SSR): Cria o caller do tRPC para buscar direto no banco
  const ctx = await createTRPCContext();
  const caller = createCallerFactory(appRouter)(ctx);
  const task = await caller.tasks.getById({ id });

  // 3. Validação: Se a tarefa não existir (ou não for do usuário), retorna 404
  if (!task) {
    return notFound();
  }

  // 4. Renderização: Delega a parte visual para a Feature
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <TaskDetailView task={task} />
    </div>
  );
}