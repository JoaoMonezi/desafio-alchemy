"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTaskSchema } from "../schema"; 
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- CORREÇÃO: Removido '/ui' dos imports ---
import { Button } from "@/_shared/components/button";
import { Input } from "@/_shared/components/input";
import { Textarea } from "@/_shared/components/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/_shared/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_shared/components/select";
// ---------------------------------------------

type TaskFormValues = z.infer<typeof createTaskSchema>;

interface TaskFormProps {
  onSuccess?: () => void; 
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
    },
  });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!");
      form.reset(); 
      utils.tasks.getAll.invalidate(); 
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  function onSubmit(data: TaskFormValues) {
    createTask.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Comprar café" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes da tarefa..."
                  className="resize-none"
                  {...field}
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TODO">A Fazer</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                    <SelectItem value="DONE">Concluído</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={createTask.isPending}>
          {createTask.isPending ? "Salvando..." : "Criar Tarefa"}
        </Button>
      </form>
    </Form>
  );
}