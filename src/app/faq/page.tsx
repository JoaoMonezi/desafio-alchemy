import Link from "next/link";
import { Button } from "@/_shared/components/button";
import { ChevronLeft, HelpCircle, CreditCard, Globe, ShieldCheck, Zap } from "lucide-react";

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Simples */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="font-bold text-xl tracking-tight text-slate-900 cursor-pointer hover:opacity-80 transition-opacity">
                TaskMaster
              </span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-medium text-slate-500">Central de Ajuda</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-600">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-full mb-4">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Como podemos ajudar?</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tire suas dúvidas sobre o TaskMaster. Se não encontrar o que procura, entre em contato com nosso suporte.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FaqCard 
            icon={CreditCard}
            question="O TaskMaster é pago?"
            answer="Não! O TaskMaster é um projeto Open Source e gratuito para uso pessoal. Você pode criar quantas tarefas quiser, organizar seu Kanban e acompanhar suas métricas sem custo algum."
          />
          
          <FaqCard 
            icon={Globe}
            question="Onde o TaskMaster funciona?"
            answer="O TaskMaster é uma aplicação web moderna (PWA). Ele funciona em qualquer navegador (Chrome, Safari, Edge, Firefox) e é totalmente responsivo, adaptando-se perfeitamente ao seu computador, tablet ou celular."
          />

          <FaqCard 
            icon={ShieldCheck}
            question="Meus dados estão seguros?"
            answer="Sim. Utilizamos autenticação de ponta com criptografia robusta. Suas senhas nunca são salvas em texto puro e suas sessões são protegidas. Apenas você tem acesso às suas tarefas."
          />

          <FaqCard 
            icon={Zap}
            question="Preciso instalar algo?"
            answer="Nada! Tudo roda na nuvem. Basta criar uma conta e começar a usar. Seus dados são sincronizados automaticamente entre todos os seus dispositivos."
          />
        </div>

        {/* Seção de Contato / CTA */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Ainda tem dúvidas?</h3>
          <p className="text-slate-600 mb-6">Estamos prontos para te ajudar a ser mais produtivo.</p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">Criar Conta Grátis</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Acessar minha conta</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200 mt-12 bg-white">
        © {new Date().getFullYear()} TaskMaster. Todos os direitos reservados.
      </footer>
    </div>
  );
}

function FaqCard({ icon: Icon, question, answer }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-700">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">{question}</h3>
          <p className="text-slate-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}