import { create } from "zustand";

interface AppState {
  // Estado da Sidebar (Global)
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Aqui você pode adicionar Tema, Notificações globais, etc. no futuro
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));