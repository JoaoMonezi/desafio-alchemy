"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/_shared/components/app-sidebar";
import { useAppStore } from "@/app/store"; // <--- Importa a Store Global
import { cn } from "@/_shared/util/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  // Apenas lê o estado global para ajustar a margem
  const { isSidebarCollapsed } = useAppStore();
  
  // Mantemos o mounted para evitar hydration mismatch
  // (Porque o servidor não sabe o estado inicial do Zustand no client)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; 

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar agora é autônoma, não precisa de props */}
      <AppSidebar />

      <main 
        className={cn(
          "flex-1 min-h-screen bg-white transition-all duration-300 ease-in-out",
          // Ajusta a margem esquerda baseada no estado global
          isSidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}