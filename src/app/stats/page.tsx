import { createCallerFactory, createTRPCContext } from "@/lib/trpc/init";
import { appRouter } from "@/lib/trpc/route";
import Link from "next/link";
import { Button } from "@/_shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/_shared/components/card";
import { 
  Users, 
  CheckCircle, 
  ListTodo, 
  ArrowLeft, 
  TrendingUp,
  HelpCircle
} from "lucide-react";

// ✅ ISR: Atualiza a cada 10 minutos (600 segundos)
export const revalidate = 600;

export default async function StatsPage() {
  // Cria o caller do tRPC no servidor (sem sessão, pois é público)
  const ctx = await createTRPCContext();
  const caller = createCallerFactory(appRouter)(ctx);
  
  // Busca os dados (Roda no build e na revalidação a cada 10min)
  const stats = await caller.tasks.getPublicStats();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* --- Header (Igual ao da Landing Page) --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
               <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                T
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">TaskMaster</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-2 md:gap-4">
            {/* Link para FAQ */}
            <Link href="/faq" className="hidden md:flex items-center">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2">
                <HelpCircle className="h-4 w-4" />
                Dúvidas
              </Button>
            </Link>

            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-4 md:px-6">
                Começar Grátis
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full space-y-12">
          
          {/* Cabeçalho da Seção */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 text-purple-700 rounded-full mb-2">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900">Impacto do TaskMaster</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Acompanhe em tempo (quase) real como nossa comunidade está se tornando mais produtiva.
            </p>
          </div>

          {/* Grid de Estatísticas */}
          <div className="grid gap-8 md:grid-cols-3">
            
            <StatCard 
              icon={Users}
              label="Usuários Ativos"
              value={stats.users}
              color="text-blue-600"
              bg="bg-blue-50"
            />

            <StatCard 
              icon={ListTodo}
              label="Tarefas Criadas"
              value={stats.tasks}
              color="text-orange-600"
              bg="bg-orange-50"
            />

            <StatCard 
              icon={CheckCircle}
              label="Tarefas Concluídas"
              value={stats.completed}
              color="text-green-600"
              bg="bg-green-50"
            />
            
          </div>

          <div className="text-center space-y-6">
            <p className="text-sm text-slate-400">
              * Dados atualizados automaticamente a cada 10 minutos.
            </p>
            
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>

        </div>
      </main>

      <footer className="bg-white py-8 border-t border-slate-100 text-center text-slate-400 text-sm">
        <div className="container mx-auto px-4">
           <span>© {new Date().getFullYear()} TaskMaster. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </CardTitle>
        <div className={`p-2 rounded-full ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-slate-900">
          {/* Formata número (ex: 1.200) */}
          {new Intl.NumberFormat('pt-BR').format(value)}
        </div>
      </CardContent>
    </Card>
  );
}