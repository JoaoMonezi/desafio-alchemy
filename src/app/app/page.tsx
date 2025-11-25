import { auth, signOut } from "@/Config/auth";
import { redirect } from "next/navigation";
import { Button } from "@/_shared/components/button";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Bem-vindo, {session.user?.name}!</p>
      <p className="text-muted-foreground mb-4">{session.user?.email}</p>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/auth/login" });
        }}
      >
        <Button variant="destructive">Sair</Button>
      </form>
    </div>
  );
}