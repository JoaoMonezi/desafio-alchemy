"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/_shared/util/utils"; 
import { Button } from "@/_shared/components/button";
// 👇 1. Importamos a Store Global que criamos na raiz do app
import { useAppStore } from "@/app/store"; 
import {
  LayoutDashboard,
  PlusCircle,
  CheckSquare,
  KanbanSquare,
  Settings,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// 👇 2. Removemos a interface de Props (não é mais necessária)

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

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // 👇 3. Usamos o Hook Global para controlar o estado
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();

  const { data: userProfile } = trpc.profile.getProfile.useQuery(undefined, {
    enabled: !!session,
    initialData: session?.user as any,
  });

  const displayName = userProfile?.name || session?.user?.name || "Usuário";
  const displayEmail = userProfile?.email || session?.user?.email || "";
  const displayImage = userProfile?.image || session?.user?.image;

  return (
    <aside
      className={cn(
        "min-h-screen bg-[#F7F7F5] border-r border-slate-200 flex flex-col justify-between fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out",
        // 👇 4. Usamos a variável da store aqui
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <div className={cn("flex items-center mb-8 mt-2", isSidebarCollapsed ? "justify-center" : "justify-between px-2")}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-xs">
                T
              </div>
              <span className="font-semibold text-slate-700">TaskMaster</span>
            </div>
          )}
          
          {/* 👇 5. Ação de Toggle conectada à store */}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-slate-400 hover:text-slate-600">
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-6 flex-1">
          {sidebarItems.map((group, index) => (
            <div key={index}>
              {!isSidebarCollapsed && (
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
                          isSidebarCollapsed && "justify-center px-0"
                        )}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="h-5 w-5" />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className={cn("pt-4 border-t border-slate-200", isSidebarCollapsed && "flex flex-col items-center")}>
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="h-8 w-8 min-w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 overflow-hidden border border-slate-300">
                  {displayImage ? (
                     // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayImage} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {displayEmail}
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