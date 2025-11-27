"use client";

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GripVertical, Calendar as CalendarIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/_shared/util/utils";
import { toast } from "sonner";
import { Button } from "@/_shared/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/_shared/components/dialog";
import { Input } from "@/_shared/components/input";
import { Label } from "@/_shared/components/label";
import { Textarea } from "@/_shared/components/textarea";
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

// Tipos
type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: Status | string;
  priority: Priority | string;
  dueDate: Date | null;
};

const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: "TODO", title: "A Fazer", color: "bg-slate-100 border-slate-200" },
  { id: "IN_PROGRESS", title: "Em Progresso", color: "bg-blue-50/50 border-blue-100" },
  { id: "DONE", title: "Concluído", color: "bg-green-50/50 border-green-100" },
];

export function TaskKanban() {
  const utils = trpc.useUtils();
  const { data: serverTasks, isLoading } = trpc.tasks.getAll.useQuery({});
  
  // 1. Estado Local para Optimistic UI (Fluidez)
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 2. Estados para Modais (Edição e Criação)
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingColumn, setCreatingColumn] = useState<Status | null>(null); // Guarda qual coluna abriu o modal
  const [newTaskData, setNewTaskData] = useState<{
    title: string;
    description: string;
    priority: Priority;
    dueDate: Date | undefined;
  }>({ title: "", description: "", priority: "MEDIUM", dueDate: undefined });

  // Sincroniza o servidor com o local quando carrega ou revalida
  useEffect(() => {
    if (serverTasks) {
      setLocalTasks(serverTasks);
    }
  }, [serverTasks]);

  // Mutações
  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => utils.tasks.getAll.invalidate(),
    onError: () => {
      toast.error("Erro ao sincronizar.");
      utils.tasks.getAll.invalidate(); // Reverte se der erro
    },
  });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada!");
      setCreatingColumn(null);
      setNewTaskData({ title: "", description: "", priority: "MEDIUM", dueDate: undefined }); // Reset form
      utils.tasks.getAll.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa removida.");
      utils.tasks.getAll.invalidate();
    },
    onError: (err) => toast.error(`Erro ao deletar: ${err.message}`),
  });

  // Agrupamento Otimista
  const columns = useMemo(() => {
    const cols: Record<Status, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    localTasks.forEach((task) => {
      if (cols[task.status as Status]) {
        cols[task.status as Status].push(task);
      }
    });
    return cols;
  }, [localTasks]);

  // --- Lógica de Drag & Drop Otimista ---
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as Status;
    const currentTask = localTasks.find((t) => t.id === taskId);

    if (currentTask && currentTask.status !== newStatus) {
      // 1. Atualiza visualmente NA HORA (Sem esperar servidor)
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      // 2. Avisa o servidor em background
      updateTask.mutate({ id: taskId, status: newStatus });
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  // --- Lógica de Edição ---
  const handleSaveEdit = () => {
    if (!editingTask) return;
    // Atualiza otimistamente também
    setLocalTasks((prev) => prev.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
    
    updateTask.mutate({
      id: editingTask.id,
      title: editingTask.title,
      description: editingTask.description || undefined,
      status: editingTask.status as Status,
      priority: editingTask.priority as Priority,
      dueDate: editingTask.dueDate,
    });
  };

  // --- Lógica de Deleção ---
  const handleDelete = (taskId: string) => {
    // Otimista: remove da lista local
    setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTask.mutate({ id: taskId });
  };

  // --- Lógica de Criação ---
  const handleCreate = () => {
    if (!creatingColumn) return;
    if (!newTaskData.title) return toast.error("O título é obrigatório");

    createTask.mutate({
      title: newTaskData.title,
      description: newTaskData.description,
      priority: newTaskData.priority,
      status: creatingColumn, // TRAVADO NA COLUNA
      dueDate: newTaskData.dueDate,
    });
  };

  if (isLoading && localTasks.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Carregando quadro...</div>;
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start min-w-[1000px]">
          {COLUMNS.map((col) => (
            <KanbanColumn 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              tasks={columns[col.id]} 
              colorClass={col.color}
              onAdd={() => setCreatingColumn(col.id)}
              onEdit={(task) => setEditingTask(task)}
              onDelete={(id) => handleDelete(id)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? (
            <TaskCard task={localTasks.find((t) => t.id === activeId)!} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* --- MODAL DE CRIAÇÃO (Status Travado) --- */}
      <Dialog open={!!creatingColumn} onOpenChange={(open) => !open && setCreatingColumn(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input 
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                placeholder="Ex: Revisar contrato"
                className="bg-white text-slate-900 border-slate-200"
              />
            </div>
            
            {/* Campos lado a lado: Status e Prioridade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status (Bloqueado)</Label>
                <Select 
                  value={creatingColumn || undefined} 
                  disabled // <--- TRAVADO AQUI
                >
                  <SelectTrigger className="bg-slate-100 text-slate-500 cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">A Fazer</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                    <SelectItem value="DONE">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select 
                  value={newTaskData.priority} 
                  onValueChange={(v: Priority) => setNewTaskData({...newTaskData, priority: v})}
                >
                  <SelectTrigger className="bg-white text-slate-900 border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  {/* CORREÇÃO VISUAL: Forçando bg-white, borda e texto escuro */}
                  <Button 
                    variant={"outline"} 
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white text-slate-900 border-slate-200 hover:bg-slate-50",
                      !newTaskData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {newTaskData.dueDate ? format(newTaskData.dueDate, "PPP", { locale: ptBR }) : <span>Sem data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar 
                    mode="single" 
                    selected={newTaskData.dueDate} 
                    onSelect={(d) => setNewTaskData({...newTaskData, dueDate: d})} 
                    initialFocus 
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea 
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                className="bg-white text-slate-900 border-slate-200 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreatingColumn(null)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createTask.isPending} className="bg-slate-900 text-white hover:bg-slate-800">
                {createTask.isPending ? "Criando..." : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE EDIÇÃO (Status Livre) --- */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título</Label>
                <Input 
                  value={editingTask.title} 
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="bg-white text-slate-900 border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select 
                    value={editingTask.status} 
                    onValueChange={(v) => setEditingTask({ ...editingTask, status: v })}
                  >
                    <SelectTrigger className="bg-white text-slate-900 border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="TODO">A Fazer</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                      <SelectItem value="DONE">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Prioridade</Label>
                  <Select 
                    value={editingTask.priority} 
                    onValueChange={(v) => setEditingTask({ ...editingTask, priority: v })}
                  >
                    <SelectTrigger className="bg-white text-slate-900 border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                  <Label>Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      {/* CORREÇÃO VISUAL: Mesma correção aplicada aqui */}
                      <Button 
                        variant={"outline"} 
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white text-slate-900 border-slate-200 hover:bg-slate-50",
                          !editingTask.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {editingTask.dueDate ? format(new Date(editingTask.dueDate), "PPP", { locale: ptBR }) : <span>Sem data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <Calendar 
                        mode="single" 
                        selected={editingTask.dueDate ? new Date(editingTask.dueDate) : undefined} 
                        onSelect={(d) => setEditingTask({...editingTask, dueDate: d})} 
                        initialFocus
                        className="bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Textarea 
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="bg-white text-slate-900 border-slate-200 resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingTask(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={updateTask.isPending} className="bg-slate-900 text-white hover:bg-slate-800">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- SUBCOMPONENTS ---

function KanbanColumn({ id, title, tasks, colorClass, onAdd, onEdit, onDelete }: any) {
  const { setNodeRef } = useDroppable({ id: id });

  return (
    <div ref={setNodeRef} className={cn("flex h-full w-80 min-w-[320px] flex-col rounded-xl border-2 border-dashed p-4 transition-colors", colorClass)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          {title}
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs text-slate-600">
            {tasks.length}
          </span>
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-200/50" onClick={onAdd}>
            <Plus className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task: Task) => (
          <TaskCard key={task.id} task={task} onEdit={() => onEdit(task)} onDelete={() => onDelete(task.id)} />
        ))}
        {tasks.length === 0 && (
            <button onClick={onAdd} className="h-24 rounded-lg border-2 border-dotted border-slate-300/50 flex items-center justify-center text-sm text-slate-400 italic hover:bg-white/50 transition-colors w-full">
                + Adicionar em {title}
            </button>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, isOverlay, onEdit, onDelete }: { task: Task; isOverlay?: boolean, onEdit?: () => void, onDelete?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  const priorityColors: any = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "group relative flex cursor-grab flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-30 ring-2 ring-slate-400 ring-offset-2",
        isOverlay && "rotate-2 scale-105 shadow-xl opacity-100 ring-0 cursor-grabbing"
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", priorityColors[task.priority] || "bg-slate-100")}>
          {task.priority === 'LOW' ? 'Baixa' : task.priority === 'MEDIUM' ? 'Média' : 'Alta'}
        </span>
        
        <div className="flex gap-1">
            {/* Botão Editar */}
            {!isOverlay && (
                <div 
                    role="button" 
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded cursor-pointer text-slate-400 hover:text-blue-600 transition-all"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onEdit?.();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    title="Editar"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </div>
            )}
            {/* Botão Deletar (Lixeira) */}
            {!isOverlay && (
                <div 
                    role="button" 
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded cursor-pointer text-slate-400 hover:text-red-600 transition-all"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        if(confirm("Tem certeza que deseja excluir?")) onDelete?.();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    title="Excluir"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </div>
            )}
            <GripVertical className="h-4 w-4 text-slate-300" />
        </div>
      </div>

      <p className="font-medium text-slate-900 line-clamp-2 text-sm">{task.title}</p>
      
      {task.dueDate && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <CalendarIcon className="h-3 w-3" />
            {format(new Date(task.dueDate), "dd MMM", { locale: ptBR })}
        </div>
      )}
    </div>
  );
}