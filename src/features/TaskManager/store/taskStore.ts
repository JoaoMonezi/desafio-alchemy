import { create } from "zustand";

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface TaskFilters {
  status?: Status;
  priority?: Priority;
  date?: Date;
}

interface TaskStore {
  filters: TaskFilters;
  setStatusFilter: (status?: Status | "ALL") => void;
  setPriorityFilter: (priority?: Priority | "ALL") => void;
  setDateFilter: (date?: Date) => void;
  clearFilters: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  filters: {},
  
  setStatusFilter: (status) => 
    set((state) => ({ 
      filters: { 
        ...state.filters, 
        status: status === "ALL" ? undefined : status 
      } 
    })),

  setPriorityFilter: (priority) => 
    set((state) => ({ 
      filters: { 
        ...state.filters, 
        priority: priority === "ALL" ? undefined : priority 
      } 
    })),

  setDateFilter: (date) => 
    set((state) => ({ 
      filters: { ...state.filters, date } 
    })),

  clearFilters: () => set({ filters: {} }),
}));