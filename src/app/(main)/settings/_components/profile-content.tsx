"use client";

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { useUploadThing } from "@/_shared/services/uploadthing";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Trophy, 
  CheckCircle2, 
  ListTodo, 
  Upload, 
  Loader2 
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/_shared/components/avatar";
import { Input } from "@/_shared/components/input";
import { Label } from "@/_shared/components/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/_shared/components/card";
import { Button } from "@/_shared/components/button";
import { Skeleton } from "@/_shared/components/skeleton";

export function ProfileContent({ session }: { session: Session }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils(); // Hook para atualizar dados na tela

  // 1. Buscamos os dados REAIS do banco (que tem a foto nova), não da sessão (que tem a velha)
  const { data: userProfile } = trpc.profile.getProfile.useQuery(undefined, {
    initialData: session.user as any, // Usa a sessão enquanto carrega para não piscar
  });

  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const updateAvatarMutation = trpc.profile.updateAvatar.useMutation();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (res) => {
      const fileUrl = res[0].url || res[0].serverData.url;
      
      await updateAvatarMutation.mutateAsync({ imageUrl: fileUrl });
      
      toast.success("Foto atualizada!");
      
      // 2. Força o tRPC a buscar o perfil de novo no banco
      utils.profile.getProfile.invalidate();
      router.refresh(); 
    },
    onUploadError: (error: Error) => {
      toast.error(`Erro no upload: ${error.message}`);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await startUpload([file]);
  };

  const totalTasks = stats?.kpi.total || 0;
  const completedTasks = totalTasks - (stats?.kpi.pending || 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Usamos a imagem do userProfile (banco) preferencialmente
  const displayImage = userProfile?.image || "";
  const displayName = userProfile?.name || session.user?.name || "Usuário";
  const displayEmail = userProfile?.email || session.user?.email || "";

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Gerencie sua identidade no TaskMaster.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8 items-start">
          
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-lg transition-opacity group-hover:opacity-80">
                {/* AQUI: Usamos a variável displayImage que vem do banco */}
                <AvatarImage src={displayImage} className="object-cover" />
                <AvatarFallback className="text-4xl bg-slate-900 text-white">
                  {displayName[0]?.toUpperCase() || "U"}
                </AvatarFallback>
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </Avatar>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>

            <Button 
              size="sm" 
              className="bg-slate-900 text-white hover:bg-slate-800"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Enviando..." : "Alterar Foto"}
            </Button>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-600">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  value={displayName} 
                  readOnly 
                  className="pl-9 bg-slate-50 border-slate-200 text-slate-600" 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-600">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  value={displayEmail} 
                  readOnly 
                  className="pl-9 bg-slate-50 border-slate-200 text-slate-600" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Estatísticas (Igual ao anterior) */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle>Histórico de Conquistas</CardTitle>
          </div>
          <CardDescription>Resumo da sua jornada produtiva.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50/50 border-slate-100">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <ListTodo className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tarefas Criadas</p>
                  <h4 className="text-2xl font-bold text-slate-900">{totalTasks}</h4>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50/50 border-slate-100">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                  <h4 className="text-2xl font-bold text-slate-900">{completedTasks}</h4>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50/50 border-slate-100">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                  <h4 className="text-2xl font-bold text-slate-900">{completionRate}%</h4>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}