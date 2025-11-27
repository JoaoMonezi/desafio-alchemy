import { startOfDay } from "date-fns";

// Definimos um tipo mínimo do que a função precisa para trabalhar
// Isso facilita os testes (não precisa mockar o objeto inteiro do banco)
type TaskData = {
  status: "TODO" | "IN_PROGRESS" | "DONE" | string;
  priority: "LOW" | "MEDIUM" | "HIGH" | string;
  updatedAt: Date;
};

export function calculateDashboardMetrics(allTasks: TaskData[]) {
  const now = new Date();
  const startOfToday = startOfDay(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. KPIs Básicos
  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === "DONE").length;
  const pending = total - completed;

  const completedToday = allTasks.filter(
    (t) => t.status === "DONE" && new Date(t.updatedAt) >= startOfToday
  ).length;

  const completedMonth = allTasks.filter(
    (t) => t.status === "DONE" && new Date(t.updatedAt) >= startOfMonth
  ).length;

  // 2. Dados para Gráfico de Status (Pizza)
  const statusData = [
    { name: "A Fazer", value: allTasks.filter((t) => t.status === "TODO").length, fill: "#94a3b8" },
    { name: "Em Progresso", value: allTasks.filter((t) => t.status === "IN_PROGRESS").length, fill: "#3b82f6" },
    { name: "Concluído", value: allTasks.filter((t) => t.status === "DONE").length, fill: "#22c55e" },
  ];

  // 3. Dados para Gráfico de Prioridade (Barras)
  const priorityData = [
    { name: "Baixa", value: allTasks.filter((t) => t.priority === "LOW").length, fill: "#94a3b8" },
    { name: "Média", value: allTasks.filter((t) => t.priority === "MEDIUM").length, fill: "#3b82f6" },
    { name: "Alta", value: allTasks.filter((t) => t.priority === "HIGH").length, fill: "#ef4444" },
  ];

  // 4. Streak (Atividade dos últimos 7 dias)
  const activityData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    const count = allTasks.filter(
      (t) =>
        t.status === "DONE" &&
        new Date(t.updatedAt).toISOString().split("T")[0] === dateKey
    ).length;

    activityData.push({
      day: d.toLocaleDateString("pt-BR", { weekday: "short" }), // Seg, Ter...
      tasks: count,
    });
  }

  return {
    kpi: { total, completedToday, completedMonth, pending },
    charts: { status: statusData, priority: priorityData, activity: activityData },
  };
}