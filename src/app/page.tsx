import Link from "next/link";
import { Button } from "@/_shared/components/button";
import { 
  CheckCircle2, 
  KanbanSquare, 
  BarChart3, 
  ArrowRight, 
  Layout, 
  ShieldCheck 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* --- Header / Navegação --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              T
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">TaskMaster</span>
          </div>
          
          <nav className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6">
                Começar Grátis
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* --- Hero Section --- */}
        <section className="py-20 md:py-32 text-center px-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              Produtividade em primeiro lugar
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Organize sua vida e projetos <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                sem complicações.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              O gerenciador de tarefas feito para quem busca clareza. 
              Dashboards inteligentes, Quadro Kanban e relatórios detalhados em uma única plataforma.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/register">
                <Button size="lg" className="h-12 px-8 text-base bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all">
                  Criar Conta Grátis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-slate-200">
                  Ver Funcionalidades
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Tudo o que você precisa</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Uma suíte completa de ferramentas para gerenciar desde tarefas simples até projetos complexos.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={KanbanSquare}
                title="Quadro Kanban"
                description="Visualize seu fluxo de trabalho. Arraste e solte tarefas entre colunas para atualizar o status instantaneamente."
              />
              <FeatureCard 
                icon={BarChart3}
                title="Dashboard & Métricas"
                description="Acompanhe seu progresso com gráficos detalhados de produtividade, streak diário e distribuição de tarefas."
              />
              <FeatureCard 
                icon={Layout}
                title="Filtros Poderosos"
                description="Encontre exatamente o que precisa filtrando por prioridade, status e data de vencimento."
              />
            </div>
          </div>
        </section>

        {/* --- Social Proof / Tech Section --- */}
        <section className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-lg">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Construído para Performance
              </h3>
              <p className="text-slate-600 mb-6">
                Desenvolvido com as tecnologias mais modernas do mercado (Next.js 15, tRPC, Drizzle) para garantir que suas tarefas carreguem instantaneamente.
              </p>
              <ul className="space-y-3">
                <ListItem>Segurança de ponta com criptografia</ListItem>
                <ListItem>Interface limpa e responsiva</ListItem>
                <ListItem>Sincronização em tempo real</ListItem>
              </ul>
            </div>
            <div className="relative">
              {/* Placeholder visual de um gráfico ou print do app */}
              <div className="w-full md:w-[500px] h-[300px] bg-white rounded-xl shadow-2xl border border-slate-200 p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex p-4 bg-blue-50 rounded-full mb-4">
                    <ShieldCheck className="h-12 w-12 text-blue-600" />
                  </div>
                  <p className="font-semibold text-slate-900">Seus dados seguros</p>
                  <p className="text-sm text-slate-500">Autenticação robusta e proteção de dados.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA Final --- */}
        <section className="py-24 bg-slate-900 text-white text-center px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para organizar seu dia?</h2>
            <p className="text-slate-300 text-lg mb-10">
              Junte-se a milhares de usuários que já estão gerenciando suas tarefas de forma mais inteligente.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-transform">
                Começar Gratuitamente
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-slate-200 rounded flex items-center justify-center text-slate-600 font-bold text-xs">
              T
            </div>
            <span className="font-semibold text-slate-700">TaskMaster</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} TaskMaster. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Componentes Auxiliares para limpar o código principal
function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:border-slate-200 transition-all group">
      <div className="h-12 w-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
        <Icon className="h-6 w-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-slate-700">
      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}