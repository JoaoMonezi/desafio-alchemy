"use client";

import { trpc } from "@/lib/trpc/client";

export function DebugTrpc() {
  // 1. Tenta buscar a rota pública
  const health = trpc.healthcheck.useQuery();
  
  // 2. Tenta buscar a rota protegida (só funciona se o cookie de sessão estiver sendo lido corretamente)
  const secret = trpc.secretMessage.useQuery();

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {/* Teste Público */}
      <div className="p-4 border rounded-lg bg-slate-50">
        <h3 className="font-bold mb-2 text-slate-700">📡 Teste Público (Healthcheck)</h3>
        {health.isLoading ? (
          <span className="text-yellow-600">Carregando...</span>
        ) : health.error ? (
          <span className="text-red-600">Erro: {health.error.message}</span>
        ) : (
          <span className="text-green-600 font-medium">✅ {health.data?.message}</span>
        )}
      </div>

      {/* Teste Privado */}
      <div className="p-4 border rounded-lg bg-slate-50">
        <h3 className="font-bold mb-2 text-slate-700">🔐 Teste Privado (Sessão)</h3>
        {secret.isLoading ? (
          <span className="text-yellow-600">Validando sessão...</span>
        ) : secret.error ? (
          <div className="text-red-600 text-sm">
            <p className="font-bold">Erro de Acesso:</p>
            {secret.error.message}
          </div>
        ) : (
          <div className="text-green-600">
            <p className="font-medium">✅ {secret.data?.message}</p>
            <p className="text-xs text-slate-500 mt-1">Server Time: {secret.data?.serverTime.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}