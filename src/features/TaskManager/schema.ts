import { z } from "zod";

// Validamos se o status é um dos permitidos
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Schema para CRIAR uma tarefa
export const createTaskSchema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(100),
  description: z.string().optional(),
  priority: taskPrioritySchema.default("MEDIUM"),
  status: taskStatusSchema.default("TODO"),
  dueDate: z.date().optional(), // Pode ser nulo
});

// Schema para ATUALIZAR uma tarefa (ID obrigatório + campos opcionais)
export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  dueDate: z.date().optional().nullable(), // Nullable para permitir remover a data
});

// Schema para FILTRAR tarefas (na listagem)
export const filterTaskSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
});