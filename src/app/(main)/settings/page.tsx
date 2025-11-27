import { auth } from "@/Config/auth";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/app/(main)/settings/_components/profile-content";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Visualize seus dados e estatísticas de uso.
        </p>
      </div>

      <ProfileContent session={session} />
    </div>
  );
}