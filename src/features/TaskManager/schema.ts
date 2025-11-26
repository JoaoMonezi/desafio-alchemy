import { z } from "zod";

// Enums do banco espelhados no Zod
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Schema para CRIAR uma tarefa
export const createTaskSchema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(100),
  description: z.string().min(1, "A descrição é obrigatória"),
  priority: taskPrioritySchema.default("MEDIUM"),
  status: taskStatusSchema.default("TODO"),
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

// Schema para FILTROS (Atualizado com Sort)
export const filterTaskSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  
  // ✅ Novo campo para permitir ordenação
  sort: z.enum(["asc", "desc"]).optional(),
});