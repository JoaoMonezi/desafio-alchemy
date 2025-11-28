"use client";

import { useEffect } from "react";
import { Button } from "@/_shared/components/button"; 
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Algo deu errado!</h2>
      <p className="text-slate-500 max-w-md text-center">
        Não foi possível carregar a aplicação. Tente recarregar.
      </p>
      <Button onClick={() => reset()}>Tentar Novamente</Button>
    </div>
  );
}