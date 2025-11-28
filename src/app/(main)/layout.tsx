import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
import { LayoutShell } from "./layout-shell"; // <--- Importamos o componente que gerencia o estado

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

 
  return (
    <LayoutShell>
      {children}
    </LayoutShell>
  );
}