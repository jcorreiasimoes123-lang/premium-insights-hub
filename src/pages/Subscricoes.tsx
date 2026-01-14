import { Wallet, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Subscricoes = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-bg">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Carteira PT</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/despesas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Despesas
            </Link>
            <Link to="/subscricoes" className="text-sm font-medium text-foreground">
              Subscrições
            </Link>
          </nav>

          <Button variant="ghost" size="sm">
            Sair
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscrições</h1>
            <p className="text-muted-foreground">Gere as tuas subscrições SaaS e serviços</p>
          </div>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Nova Subscrição
          </Button>
        </div>

        {/* Empty state */}
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Sem subscrições registadas</h2>
          <p className="text-muted-foreground mb-6">
            Adiciona as tuas subscrições para nunca perderes uma renovação
          </p>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Subscrição
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Subscricoes;
