import { Wallet, Receipt, CreditCard, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
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
            <Link to="/dashboard" className="text-sm font-medium text-foreground">
              Dashboard
            </Link>
            <Link to="/despesas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Despesas
            </Link>
            <Link to="/subscricoes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Olá, utilizador!</h1>
          <p className="text-muted-foreground">Aqui está o resumo das tuas finanças</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Despesas este mês</span>
            </div>
            <p className="text-3xl font-bold">€0.00</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Subscrições ativas</span>
            </div>
            <p className="text-3xl font-bold">0</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total mensal</span>
            </div>
            <p className="text-3xl font-bold">€0.00</p>
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-card rounded-xl p-12 border border-border text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Começa a registar</h2>
          <p className="text-muted-foreground mb-6">
            Adiciona a tua primeira despesa ou subscrição para começar
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="hero" asChild>
              <Link to="/despesas">Adicionar Despesa</Link>
            </Button>
            <Button variant="hero-outline" asChild>
              <Link to="/subscricoes">Adicionar Subscrição</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
