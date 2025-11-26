import { create } from "zustand";
import { DateRange } from "react-day-picker";

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type SortOrder = "asc" | "desc"; // ✅ Novo Tipo

interface TaskFilters {
  status?: Status;
  priority?: Priority;
  dateRange?: DateRange;
  sort?: SortOrder; // ✅ Novo Estado
}

interface TaskStore {
  filters: TaskFilters;
  setStatusFilter: (status?: Status | "ALL") => void;
  setPriorityFilter: (priority?: Priority | "ALL") => void;
  setDateRangeFilter: (range?: DateRange) => void;
  setSortFilter: (sort?: SortOrder) => void; // ✅ Nova Ação
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

  setDateRangeFilter: (range) => 
    set((state) => ({ 
      filters: { ...state.filters, dateRange: range } 
    })),

  // ✅ Nova lógica de ordenação
  setSortFilter: (sort) =>
    set((state) => ({
      filters: { ...state.filters, sort }
    })),

  clearFilters: () => set({ filters: {} }),
}));