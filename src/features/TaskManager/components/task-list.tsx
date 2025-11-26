"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/_shared/components/button";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Trash2, 
  Calendar as CalendarIcon, 
  FilterX, 
  MoreHorizontal 
} from "lucide-react";
import { useTaskStore } from "../store/taskStore";

// Importações de Componentes UI (Ajustados para _shared)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_shared/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_shared/components/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_shared/components/popover";
import { Calendar } from "@/_shared/components/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/_shared/components/dropdown-menu";
import { cn } from "@/_shared/util/utils";

export function TaskList() {
  const utils = trpc.useUtils();
  
  // Estados globais do Zustand (persistência de filtros)
  const { 
    filters, 
    setStatusFilter, 
    setPriorityFilter, 
    setDateFilter, 
    clearFilters 
  } = useTaskStore();

  // Busca de dados com filtros aplicados
  const { data: tasks, isLoading } = trpc.tasks.getAll.useQuery({
    status: filters.status,
    priority: filters.priority,
    from: filters.date, 
  });

  // Mutação para deletar
  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa removida.");
      utils.tasks.getAll.invalidate();
    },
    onError: (err) => toast.error(`Erro ao deletar: ${err.message}`),
  });

  // Mapas visuais para tradução e estilização
  const priorityMap = {
    LOW: { label: "Baixa", color: "bg-slate-100 text-slate-700 border-slate-200" },
    MEDIUM: { label: "Média", color: "bg-blue-50 text-blue-700 border-blue-200" },
    HIGH: { label: "Alta", color: "bg-red-50 text-red-700 border-red-200" },
  };

  const statusMap = {
    TODO: { label: "A Fazer", icon: "○", color: "text-slate-500" },
    IN_PROGRESS: { label: "Em Progresso", icon: "◐", color: "text-blue-600" },
    DONE: { label: "Concluído", icon: "●", color: "text-green-600" },
  };

  const hasActiveFilters = filters.status || filters.priority || filters.date;

  return (
    <div className="space-y-6">
      {/* Barra de Ferramentas (Filtros) */}
      <div className="flex flex-col lg:flex-row gap-6 items-end justify-between bg-white p-5 rounded-xl border shadow-sm">
        
        {/* Área de Filtros com Labels */}
        <div className="flex flex-wrap gap-4 items-end w-full lg:w-auto">
          
          {/* Filtro de Status */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
            <Select 
              value={filters.status || "ALL"} 
              onValueChange={(v) => setStatusFilter(v === "ALL" ? undefined : v as any)}
            >
              <SelectTrigger className="w-[150px] bg-white text-slate-900 border-slate-200 h-10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Status</SelectItem>
                <SelectItem value="TODO">A Fazer</SelectItem>
                <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                <SelectItem value="DONE">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Prioridade */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</span>
            <Select 
              value={filters.priority || "ALL"} 
              onValueChange={(v) => setPriorityFilter(v === "ALL" ? undefined : v as any)}
            >
              <SelectTrigger className="w-[150px] bg-white text-slate-900 border-slate-200 h-10">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Priorid.</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Data */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">A partir de</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[160px] justify-start text-left font-normal bg-white text-slate-900 border-slate-200 h-10",
                    !filters.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {filters.date ? format(filters.date, "dd/MM/yyyy") : "Data..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Botão Limpar */}
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros" className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 mb-[1px]">
              <FilterX className="h-5 w-5" />
            </Button>
          )}
        </div>

        <Link href="/tasks/new">
          <Button className="h-10 px-6 font-medium shadow-sm bg-slate-900 hover:bg-slate-800 text-white">
            + Nova Tarefa
          </Button>
        </Link>
      </div>

      {/* Tabela de Dados */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%] text-slate-900 font-semibold h-12">Tarefa</TableHead>
              <TableHead className="text-slate-900 font-semibold">Status</TableHead>
              <TableHead className="text-slate-900 font-semibold">Prioridade</TableHead>
              <TableHead className="text-slate-900 font-semibold">Vencimento</TableHead>
              <TableHead className="text-right text-slate-900 font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}/>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}/>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}/>
                  </div>
                </TableCell>
              </TableRow>
            ) : tasks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <FilterX className="h-8 w-8 opacity-20" />
                    <p>Nenhuma tarefa encontrada.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tasks?.map((task) => (
                <TableRow key={task.id} className="hover:bg-slate-50 group border-b border-slate-100 last:border-0">
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">{task.title}</span>
                      {task.description && (
                        <span className="text-xs text-slate-500 truncate max-w-[300px] leading-relaxed">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className={cn("inline-flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-md bg-slate-50 border border-slate-100", statusMap[task.status].color)}>
                      <span>{statusMap[task.status].icon}</span>
                      <span>{statusMap[task.status].label}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm", priorityMap[task.priority].color)}>
                      {priorityMap[task.priority].label}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    {task.dueDate ? (
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span>{format(task.dueDate, "dd/MM/yyyy")}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic pl-1">--</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => alert("Em breve: Editar")}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => deleteTask.mutate({ id: task.id })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}