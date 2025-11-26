import { z } from "zod";

// Enums do banco espelhados no Zod
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Schema para CRIAR uma tarefa
export const createTaskSchema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(100),
  
  // A descrição é obrigatória na criação
  description: z.string().min(1, "A descrição é obrigatória"),
  
  priority: taskPrioritySchema.default("MEDIUM"),
  status: taskStatusSchema.default("TODO"),
  
  // Data de Vencimento (Opcional)
  dueDate: z.date().optional(), 
});

// Schema para ATUALIZAR uma tarefa
export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  
  description: z.string().min(1, "A descrição não pode ficar vazia").optional(),
  
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  dueDate: z.date().optional().nullable(),
});

// Schema para FILTROS
export const filterTaskSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  
  // ✅ Filtro de Data de Vencimento (Intervalo)
  // Permite buscar tarefas "de X até Y" ou "a partir de X"
  from: z.date().optional(),
  to: z.date().optional(),
});