"use client";

import { trpc } from "@/lib/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/_shared/components/avatar";
import { Input } from "@/_shared/components/input";
import { Label } from "@/_shared/components/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/_shared/components/card";
import { Button } from "@/_shared/components/button";
import { Skeleton } from "@/_shared/components/skeleton";
import { User, Mail, Trophy, CheckCircle2, ListTodo } from "lucide-react";
import type { Session } from "next-auth";

export function ProfileContent({ session }: { session: Session }) {
  const { data: stats, isLoading } = trpc.tasks.getDashboardStats.useQuery();

  const totalTasks = stats?.kpi.total || 0;
  const completedTasks = totalTasks - (stats?.kpi.pending || 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Seção 1: Cartão de Identificação */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Gerencie sua identidade no TaskMaster.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Área do Avatar */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-lg">
              <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
              <AvatarFallback className="text-4xl bg-slate-900 text-white">
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            {/* MUDANÇA: Botão sólido com texto branco explícito */}
            <Button 
              size="sm" 
              disabled 
              className="bg-slate-900 text-white opacity-50 cursor-not-allowed hover:bg-slate-900"
            >
              Alterar Foto (Em breve)
            </Button>
          </div>

          {/* Formulário de Dados */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  defaultValue={session.user?.name || ""} 
                  readOnly 
                  className="pl-9 bg-slate-50" 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  defaultValue={session.user?.email || ""} 
                  readOnly 
                  className="pl-9 bg-slate-50" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Histórico e Gamificação */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle>Histórico de Conquistas</CardTitle>
          </div>
          <CardDescription>Resumo da sua jornada produtiva.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Card: Total Criado */}
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <ListTodo className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tarefas Criadas</p>
                  <h4 className="text-2xl font-bold text-slate-900">{totalTasks}</h4>
                </div>
              </div>

              {/* Card: Total Concluído */}
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                  <h4 className="text-2xl font-bold text-slate-900">{completedTasks}</h4>
                </div>
              </div>

              {/* Card: Taxa de Sucesso */}
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                  <h4 className="text-2xl font-bold text-slate-900">{completionRate}%</h4>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}