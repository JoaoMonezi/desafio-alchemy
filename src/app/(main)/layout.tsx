import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
import { LayoutShell } from "./layout-shell"; // <--- Importamos o componente que gerencia o estado

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verificação de Segurança (Server Side)
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // 2. Renderização
  // Em vez de desenhar a Sidebar direto aqui, passamos a bola para o Shell.
  // O Shell vai desenhar a Sidebar e o conteúdo (children) com as margens corretas.
  return (
    <LayoutShell>
      {children}
    </LayoutShell>
  );
}