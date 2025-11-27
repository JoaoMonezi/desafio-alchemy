import { auth } from "@/Config/auth";
import { redirect, notFound } from "next/navigation";
import { appRouter } from "@/lib/trpc/router";
import { createCallerFactory, createTRPCContext } from "@/lib/trpc/init";
import Link from "next/link";
import { Button } from "@/_shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/_shared/components/card";
import { Calendar, ChevronLeft, Clock, Flag, Activity, AlignLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/_shared/util/utils";

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  // Fetch dos dados no servidor (SSR)
  const ctx = await createTRPCContext();
  const caller = createCallerFactory(appRouter)(ctx);
  const task = await caller.tasks.getById({ id });

  if (!task) {
    return notFound();
  }

  // Mapas Visuais
  const priorityMap = {
    LOW: { label: "Baixa", color: "bg-slate-100 text-slate-700", icon: Flag },
    MEDIUM: { label: "Média", color: "bg-blue-50 text-blue-700", icon: Flag },
    HIGH: { label: "Alta", color: "bg-red-50 text-red-700", icon: Flag },
  };

  const statusMap = {
    TODO: { label: "A Fazer", color: "bg-slate-100 text-slate-600" },
    IN_PROGRESS: { label: "Em Progresso", color: "bg-blue-50 text-blue-700" },
    DONE: { label: "Concluído", color: "bg-green-50 text-green-700" },
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8">
      
      {/* 1. CABEÇALHO: Botão Voltar + Título */}
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/tasks">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all text-slate-500 hover:text-slate-900">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para todas as tarefas
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{task.title}</h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Clock className="h-4 w-4" />
            <span>Criado em {format(task.createdAt, "PPP 'às' HH:mm", { locale: ptBR })}</span>
          </div>
        </div>
      </div>

      {/* 2. GRID PRINCIPAL (2 Colunas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- LINHA 1 --- */}

        {/* BLOCO 1: Descrição */}
        <Card className="h-full border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <AlignLeft className="h-4 w-4" />
              Descrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            {task.description ? (
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                {task.description}
              </p>
            ) : (
              <p className="text-slate-400 italic">Sem descrição definida.</p>
            )}
          </CardContent>
        </Card>

        {/* BLOCO 2: Vencimento */}
        <Card className="h-full border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {task.dueDate ? (
                <>
                  <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                    <span className="font-bold text-lg">{format(task.dueDate, "dd")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-lg capitalize">
                      {format(task.dueDate, "MMMM", { locale: ptBR })}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {format(task.dueDate, "yyyy")} • {format(task.dueDate, "EEEE", { locale: ptBR })}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-slate-400 italic">Sem data de vencimento</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* --- LINHA 2 --- */}

        {/* BLOCO 3: Status */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-lg border",
              // @ts-ignore
              statusMap[task.status].color
            )}>
              <span className="font-semibold">
                {/* @ts-ignore */}
                {statusMap[task.status].label}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 4: Prioridade */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg border",
              // @ts-ignore
              priorityMap[task.priority].color
            )}>
              <span className="font-semibold">
                {/* @ts-ignore */}
                {priorityMap[task.priority].label}
              </span>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}