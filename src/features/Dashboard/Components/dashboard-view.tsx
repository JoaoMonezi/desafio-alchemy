"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/_shared/components/button";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from "recharts";
import { 
  CheckCircle2, 
  Clock, 
  CalendarDays, 
  Trophy 
} from "lucide-react";
import { Skeleton } from "@/_shared/components/skeleton"; // Supondo que tenha, ou usamos div

export function DashboardView() {
  const { data: stats, isLoading } = trpc.tasks.getDashboardStats.useQuery();

  if (isLoading || !stats) {
    return (
        <div className="p-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua produtividade.</p>
        </div>
        <Link href="/tasks">
          <Button>Gerenciar Tarefas</Button>
        </Link>
      </div>

      {/* 1. Linha de KPIs (Cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Concluídas Hoje" 
          value={stats.kpi.completedToday} 
          icon={CheckCircle2} 
          color="text-green-600" 
          bg="bg-green-50"
        />
        <KpiCard 
          title="Concluídas no Mês" 
          value={stats.kpi.completedMonth} 
          icon={CalendarDays} 
          color="text-blue-600" 
          bg="bg-blue-50"
        />
        <KpiCard 
          title="Pendentes" 
          value={stats.kpi.pending} 
          icon={Clock} 
          color="text-orange-600" 
          bg="bg-orange-50"
        />
        <KpiCard 
          title="Total Geral" 
          value={stats.kpi.total} 
          icon={Trophy} 
          color="text-purple-600" 
          bg="bg-purple-50"
        />
      </div>

      {/* 2. Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Gráfico de Streak */}
        <div className="col-span-4 border rounded-xl p-6 bg-white shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Atividade Recente (Streak)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.activity}>
                <XAxis 
                  dataKey="day" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="tasks" 
                  fill="#0f172a" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Status */}
        <div className="col-span-3 border rounded-xl p-6 bg-white shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Distribuição por Status</h3>
          <div className="h-[300px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.status}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.charts.status.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500">
            {stats.charts.status.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Auxiliar interno (poderia ser extraído se usado em outro lugar)
function KpiCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="p-6 bg-white border rounded-xl shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
      </div>
    </div>
  );
}