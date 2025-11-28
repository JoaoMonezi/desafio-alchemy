"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTaskSchema } from "../../../../server/api/routers/task/schema"; // Caminho corrigido: ../schema
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/_shared/util/utils";

/// Imports de UI
import { Button } from "@/_shared/components/button";
import { Input } from "@/_shared/components/input";
import { Textarea } from "@/_shared/components/textarea";
import { Calendar } from "@/_shared/components/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_shared/components/popover";

// MUDANÇA: O Zod faz inferência correta, mas se for para resolver o erro,
// a melhor prática é garantir que os 'defaultValues' coincidam
// estritamente com os tipos string literais definidos.
type TaskFormValues = z.infer<typeof createTaskSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    // 🚨 CORREÇÃO: Usamos o Non-Nullable Assertion no lado do RHF
    // Embora o Zod defina o default, o RHF precisa de valores não-nulos iniciais
    // para campos que não são marcados como .optional() no schema.
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM", 
      status: "TODO",    
      dueDate: undefined, // Opcional, então pode ser undefined/null
    },
  });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!");
      form.reset(); 
      utils.tasks.getAll.invalidate(); 
      
      if (onSuccess) {
        onSuccess();
      }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-full">
        
        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-base font-semibold text-slate-700">Título da Tarefa</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Finalizar relatório mensal" 
                  className="text-lg py-6 bg-white text-slate-900 w-full" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-slate-600 font-medium">Descrição Detalhada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os detalhes, requisitos ou notas importantes..."
                  className="resize-none min-h-[120px] bg-white text-slate-900 w-full"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Prioridade */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 font-medium">Prioridade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white text-slate-900 w-full">
                      <SelectValue placeholder="Definir Prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    <SelectItem value="LOW" className="text-slate-700">Baixa</SelectItem>
                    <SelectItem value="MEDIUM" className="text-slate-700">Média</SelectItem>
                    <SelectItem value="HIGH" className="text-red-600 font-medium">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 font-medium">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white text-slate-900 w-full">
                      <SelectValue placeholder="Definir Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    <SelectItem value="TODO" className="text-slate-700">A Fazer</SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-blue-600">Em Progresso</SelectItem>
                    <SelectItem value="DONE" className="text-green-600">Concluído</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vencimento */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-slate-600 font-medium">Vencimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-white text-slate-900 border-slate-200",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Selecionar Data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      className="bg-white rounded-md border shadow-md"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center pt-4 border-t border-slate-100 w-full">
            <Button type="submit" size="lg" className="w-full md:w-auto px-8" disabled={createTask.isPending}>
            {createTask.isPending ? "Salvando..." : "Criar Tarefa"}
            </Button>
        </div>
      </form>
    </Form>
  );
}