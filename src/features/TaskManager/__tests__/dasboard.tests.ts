import { calculateDashboardMetrics } from "../utils";

describe("Lógica do Dashboard (Unitário)", () => {
  
  // Vamos criar um cenário controlado (Mock)
  // Imagine que hoje criamos essas tarefas:
  const mockTasks = [
    { status: "DONE", priority: "HIGH", updatedAt: new Date() },       // Feito hoje
    { status: "DONE", priority: "MEDIUM", updatedAt: new Date() },     // Feito hoje
    { status: "TODO", priority: "LOW", updatedAt: new Date() },        // Pendente hoje
    { status: "IN_PROGRESS", priority: "HIGH", updatedAt: new Date() },// Fazendo hoje
  ];

  it("deve calcular corretamente os totais (KPIs)", () => {
    const result = calculateDashboardMetrics(mockTasks);
    
    expect(result.kpi.total).toBe(4);
    expect(result.kpi.pending).toBe(2); // 1 TODO + 1 IN_PROGRESS
    expect(result.kpi.completedToday).toBe(2); // 2 DONE
  });

  it("deve agrupar corretamente por status", () => {
    const result = calculateDashboardMetrics(mockTasks);
    
    const todo = result.charts.status.find(s => s.name === "A Fazer");
    const done = result.charts.status.find(s => s.name === "Concluído");

    expect(todo?.value).toBe(1);
    expect(done?.value).toBe(2);
  });

  it("deve agrupar corretamente por prioridade", () => {
    const result = calculateDashboardMetrics(mockTasks);
    
    // Temos 2 HIGH, 1 MEDIUM, 1 LOW
    const high = result.charts.priority.find(p => p.name === "Alta");
    const low = result.charts.priority.find(p => p.name === "Baixa");

    expect(high?.value).toBe(2);
    expect(low?.value).toBe(1);
  });
});