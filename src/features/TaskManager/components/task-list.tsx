"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/_shared/components/button";
import { Input } from "@/_shared/components/input";
import { Textarea } from "@/_shared/components/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Trash2, 
  Calendar as CalendarIcon, 
  FilterX, 
  MoreHorizontal,
  Pencil,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide
} from "lucide-react";
import { useTaskStore } from "../store/taskStore";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/_shared/components/dialog";
import { Label } from "@/_shared/components/label";
import { cn } from "@/_shared/util/utils";

export function TaskList() {
  const utils = trpc.useUtils();
  
  const { 
    filters, 
    setStatusFilter, 
    setPriorityFilter, 
    setDateRangeFilter, 
    setSortFilter, 
    clearFilters 
  } = useTaskStore();

  const dateRange = filters.dateRange;
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const queryFrom = dateRange?.from ? startOfDay(dateRange.from) : undefined;
  const queryTo = dateRange?.to ? endOfDay(dateRange.to) : 
                  dateRange?.from ? endOfDay(dateRange.from) : undefined;

  const { data: tasks, isLoading } = trpc.tasks.getAll.useQuery({
    status: filters.status,
    priority: filters.priority,
    from: queryFrom,
    to: queryTo,
    sort: filters.sort, 
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa removida.");
      utils.tasks.getAll.invalidate();
    },
    onError: (err) => toast.error(`Erro ao deletar: ${err.message}`),
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Tarefa atualizada!");
      setEditingTask(null);
      utils.tasks.getAll.invalidate();
    },
    onError: (err) => toast.error(`Erro ao atualizar: ${err.message}`),
  });

  const handleSaveEdit = () => {
    if (!editingTask) return;
    updateTask.mutate({
      id: editingTask.id,
      title: editingTask.title,
      description: editingTask.description,
      status: editingTask.status,
      priority: editingTask.priority,
      dueDate: editingTask.dueDate,
    });
  };

  const toggleSort = () => {
    if (filters.sort === "asc") setSortFilter("desc");
    else if (filters.sort === "desc") setSortFilter(undefined);
    else setSortFilter("asc");
  };

  const clearAllFilters = () => {
    clearFilters();
  };

  const priorityMap = {
    LOW: { label: "Baixa", color: "bg-slate-100 text-slate-700 border-slate-200" },
    MEDIUM: { label: "Média", color: "bg-blue-50 text-blue-700 border-blue-200" },
    HIGH: { label: "Alta", color: "bg-red-50 text-red-700 border-red-200" },
  };

  const statusMap = {
    TODO: { label: "A Fazer", icon: "○", color: "text-slate-500 bg-slate-50 border-slate-200" },
    IN_PROGRESS: { label: "Em Progresso", icon: "◐", color: "text-blue-700 bg-blue-50 border-blue-200" },
    DONE: { label: "Concluído", icon: "●", color: "text-green-700 bg-green-50 border-green-200" },
  };

  const hasActiveFilters = filters.status || filters.priority || filters.dateRange || filters.sort;

  return (
    <div className="space-y-6">
      {/* Toolbar (Filters) */}
      <div className="flex flex-col lg:flex-row gap-6 items-end justify-between bg-white p-5 rounded-xl border shadow-sm">
        <div className="flex flex-1 gap-4 items-end w-full lg:w-auto flex-wrap">
          
          {/* Status Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
            <Select 
              value={filters.status || "ALL"} 
              onValueChange={(v) => setStatusFilter(v === "ALL" ? undefined : v as any)}
            >
              <SelectTrigger className="w-[140px] bg-white text-slate-900 border-slate-200 h-10">
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

          {/* Priority Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</span>
            <Select 
              value={filters.priority || "ALL"} 
              onValueChange={(v) => setPriorityFilter(v === "ALL" ? undefined : v as any)}
            >
              <SelectTrigger className="w-[140px] bg-white text-slate-900 border-slate-200 h-10">
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

          {/* Date Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Período</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal bg-white text-slate-900 border-slate-200 h-10",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yy")} -{" "}
                        {format(dateRange.to, "dd/MM/yy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Filtrar por data...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRangeFilter}
                  numberOfMonths={2}
                  className="bg-white border rounded-md shadow-md"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Botão Ordenar */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordenar</span>
            <Button 
              variant="outline" 
              onClick={toggleSort}
              className={cn(
                "w-[50px] h-10 border-slate-200 px-0 bg-white text-slate-900",
                filters.sort && "bg-slate-100 border-slate-300 text-blue-600"
              )}
              title="Ordenar por Data de Vencimento"
            >
              {filters.sort === "asc" ? (
                <ArrowUpNarrowWide className="h-5 w-5" />
              ) : (
                <ArrowDownWideNarrow className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Botão Limpar */}
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearAllFilters} title="Limpar filtros" className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 mb-[1px]">
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

      {/* Data Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-slate-200">
              <TableHead className="w-[20%] text-slate-900 font-bold h-12 text-left pl-8">Título</TableHead>
              <TableHead className="w-[25%] text-slate-900 font-bold text-center">Descrição</TableHead>
              <TableHead className="w-[15%] text-slate-900 font-bold text-center">Prioridade</TableHead>
              <TableHead className="w-[15%] text-slate-900 font-bold text-center">Status</TableHead>
              <TableHead className="w-[15%] text-slate-900 font-bold text-center">Data</TableHead>
              <TableHead className="w-[10%] text-slate-900 font-bold text-center pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}/>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}/>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}/>
                  </div>
                </TableCell>
              </TableRow>
            ) : tasks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <FilterX className="h-8 w-8 opacity-20" />
                    <p>Nenhuma tarefa encontrada.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tasks?.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="hover:bg-slate-50 group border-b border-slate-100 last:border-0 h-16"
                  // MUDANÇA CRÍTICA: Removido o onClick global da Row para evitar conflito com Link
                >
                  <TableCell className="py-4 pl-8 text-left font-medium text-slate-900">
                    <div className="flex flex-col gap-1">
                      {/* Link de Navegação - Só aqui navega */}
                      <Link 
                        href={`/tasks/${task.id}`} 
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                      >
                        {task.title}
                      </Link>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <span className="text-sm text-slate-500 truncate max-w-[200px]" title={task.description || ""}>
                        {task.description || "-"}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border shadow-sm", priorityMap[task.priority].color)}>
                        {priorityMap[task.priority].label}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <div className={cn("inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border shadow-sm", statusMap[task.status].color)}>
                        <span>{statusMap[task.status].label}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex justify-center text-sm text-slate-600 font-medium">
                      {task.dueDate ? (
                        <span>{format(task.dueDate, "dd/MM/yyyy")}</span>
                      ) : (
                        <span className="text-slate-400 italic">--</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center pr-6">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          {/* MUDANÇA CRÍTICA: Apenas aqui abre o modal de edição */}
                          <DropdownMenuItem onClick={() => setEditingTask(task)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => deleteTask.mutate({ id: task.id })}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Editar Tarefa</DialogTitle>
          </DialogHeader>
          
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-slate-700">Título</Label>
                <Input
                  id="title"
                  className="bg-white text-slate-900 border-slate-200"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="desc" className="text-slate-700">Descrição</Label>
                <Textarea
                  id="desc"
                  className="resize-none min-h-[100px] bg-white text-slate-900 border-slate-200"
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-700">Status</Label>
                  <Select 
                    value={editingTask.status} 
                    onValueChange={(v) => setEditingTask({ ...editingTask, status: v })}
                  >
                    <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="TODO" className="text-slate-700">A Fazer</SelectItem>
                      <SelectItem value="IN_PROGRESS" className="text-blue-700">Em Progresso</SelectItem>
                      <SelectItem value="DONE" className="text-green-700">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-slate-700">Prioridade</Label>
                  <Select 
                    value={editingTask.priority} 
                    onValueChange={(v) => setEditingTask({ ...editingTask, priority: v })}
                  >
                    <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="LOW" className="text-slate-700">Baixa</SelectItem>
                      <SelectItem value="MEDIUM" className="text-slate-700">Média</SelectItem>
                      <SelectItem value="HIGH" className="text-red-700">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-700">Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white text-slate-900 border-slate-200",
                        !editingTask.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {editingTask.dueDate ? (
                        format(new Date(editingTask.dueDate), "PPP", { locale: ptBR })
                      ) : (
                        <span>Sem data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={editingTask.dueDate ? new Date(editingTask.dueDate) : undefined}
                      onSelect={(date) => setEditingTask({ ...editingTask, dueDate: date })}
                      initialFocus
                      className="bg-white border rounded-md shadow-md"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)} className="text-slate-700">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateTask.isPending} className="bg-slate-900 text-white hover:bg-slate-800">
              {updateTask.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}