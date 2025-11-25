"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import superjson from "superjson";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // Cria o cliente de cache (QueryClient) uma única vez
  const [queryClient] = useState(() => new QueryClient());

  // Cria o cliente tRPC uma única vez
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          // Define a URL da nossa API
          // O window.location.origin ajuda a pegar a URL certa em dev e prod no cliente
          url: typeof window !== 'undefined' 
            ? `${window.location.origin}/api/trpc`
            : "http://localhost:3000/api/trpc",
          
          // O superjson garante que objetos complexos (como Date) não quebrem
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}