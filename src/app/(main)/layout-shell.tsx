"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/_shared/components/app-sidebar";
import { cn } from "@/_shared/util/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  // Estado para controlar se está fechado ou aberto
  // Dica: Poderíamos salvar isso no localStorage para lembrar a preferência do usuário
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Evita flash de hidratação se usássemos localStorage, por enquanto padrão é false
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Ou um skeleton

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Controlada */}
      <AppSidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* Área de Conteúdo */}
      <main 
        className={cn(
          "flex-1 min-h-screen bg-white transition-all duration-300 ease-in-out",
          // Ajusta a margem esquerda dependendo do tamanho da sidebar
          isCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}