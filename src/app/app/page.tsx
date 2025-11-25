import { auth, signOut } from "@/Config/auth";
import { redirect } from "next/navigation";
import { Button } from "@/_shared/components/button";
import { DebugTrpc } from "@/app/_components/debug-trpc"; // <--- IMPORTAR AQUI

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, {session.user?.name}!</p>
        </div>
        
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/auth/login" });
          }}
        >
          <Button variant="destructive">Sair</Button>
        </form>
      </div>

      <hr className="my-6" />

      {/* Área de Diagnóstico do tRPC */}
      <h2 className="text-lg font-semibold mb-4">Status do Sistema</h2>
      <DebugTrpc /> {/* <--- ADICIONAR O COMPONENTE AQUI */}
      
    </div>
  );
}