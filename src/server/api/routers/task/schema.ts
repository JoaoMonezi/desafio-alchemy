import { z } from "zod";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(100),
  description: z.string().min(1, "A descrição é obrigatória"),
  

  priority: taskPrioritySchema.default("MEDIUM").optional(), 
  status: taskStatusSchema.default("TODO").optional(), 
  
  dueDate: z.date().optional(), 
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().min(1, "A descrição não pode ficar vazia").optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  dueDate: z.date().optional().nullable(),
});

export const filterTaskSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
});