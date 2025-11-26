"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/_shared/util/utils"; 
import { Button } from "@/_shared/components/button";
import {
  LayoutDashboard,
  PlusCircle,
  CheckSquare,
  KanbanSquare,
  Settings,
  LogOut,
  User,
  PanelLeftClose, // Ícone para fechar
  PanelLeftOpen,  // Ícone para abrir
} from "lucide-react";

// Props para controlar a sidebar de fora
interface AppSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const sidebarItems = [
  {
    title: "Visão Geral",
    items: [
      { label: "Dashboard", href: "/app", icon: LayoutDashboard },
    ],
  },
  {
    title: "Gerenciamento",
    items: [
      { label: "Nova Tarefa", href: "/tasks/new", icon: PlusCircle },
      { label: "Todas as Tarefas", href: "/tasks", icon: CheckSquare },
      { label: "Kanban Board", href: "/tasks/kanban", icon: KanbanSquare },
    ],
  },
  {
    title: "Configurações",
    items: [
      { label: "Meu Perfil", href: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar({ isCollapsed, toggleSidebar }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "min-h-screen bg-[#F7F7F5] border-r border-slate-200 flex flex-col justify-between fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out",
        // Se estiver colapsada, usa largura 20 (80px), se não, 64 (256px)
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Cabeçalho da Sidebar */}
      <div className="p-4 flex flex-col h-full">
        
        {/* Logo e Botão de Toggle */}
        <div className={cn("flex items-center mb-8 mt-2", isCollapsed ? "justify-center" : "justify-between px-2")}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-xs">
                T
              </div>
              <span className="font-semibold text-slate-700">TaskMaster</span>
            </div>
          )}
          
          {/* Botão para Esconder/Mostrar */}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-slate-400 hover:text-slate-600">
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {/* Menu de Navegação */}
        <div className="space-y-6 flex-1">
          {sidebarItems.map((group, index) => (
            <div key={index}>
              {/* Título do Grupo (Esconde se colapsado) */}
              {!isCollapsed && (
                <h4 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 fade-in">
                  {group.title}
                </h4>
              )}
              
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-slate-200/60 text-slate-900"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                          isCollapsed && "justify-center px-0" // Centraliza ícone se colapsado
                        )}
                        title={isCollapsed ? item.label : undefined} // Tooltip nativo
                      >
                        <Icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Rodapé da Sidebar (Perfil) */}
        <div className={cn("pt-4 border-t border-slate-200", isCollapsed && "flex flex-col items-center")}>
          {!isCollapsed ? (
            // Versão Expandida
            <>
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  {session?.user?.image ? (
                     // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="Avatar" className="h-8 w-8 rounded-full" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {session?.user?.name || "Usuário"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            // Versão Colapsada (Só ícone de sair)
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-600 hover:bg-red-50"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}