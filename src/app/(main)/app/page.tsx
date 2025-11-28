import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
import { DashboardView } from "@/app/(main)/app/_components/dashboard-view"; 

export default async function DashboardPage() {
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