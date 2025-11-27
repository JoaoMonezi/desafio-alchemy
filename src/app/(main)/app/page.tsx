import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
// Certifique-se de que você criou este componente no passo anterior
import { DashboardView } from "@/features/Dashboard/components/dashboard-view"; 

export default async function DashboardPage() {
  // 1. Segurança: Verifica a sessão no servidor antes de renderizar qualquer coisa
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* 2. Renderiza a View do Cliente */}
      <DashboardView />
    </div>
  );
}