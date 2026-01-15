import { CreditCard, Plus, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import {
  mockSubscriptions,
  getTotalSubscriptions,
  formatCurrency,
  formatDate,
} from "@/data/mockData";

const Subscricoes = () => {
  const totalSubscriptions = getTotalSubscriptions();
  const activeCount = mockSubscriptions.filter((s) => s.active).length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <span className="text-muted-foreground">Custo mensal total</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalSubscriptions)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(totalSubscriptions * 12)} /ano
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-muted-foreground">Subscrições ativas</span>
            </div>
            <p className="text-3xl font-bold">{activeCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              de {mockSubscriptions.length} total
            </p>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">As tuas Subscrições</h2>
          </div>
          <div className="divide-y divide-border">
            {mockSubscriptions.map((subscription) => (
              <div key={subscription.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{subscription.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {subscription.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Renova {formatDate(subscription.renewalDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {subscription.active ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                      Ativa
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                      Inativa
                    </span>
                  )}
                  <div className="text-right min-w-[100px]">
                    <span className="font-bold text-lg">{formatCurrency(subscription.amount)}</span>
                    <p className="text-xs text-muted-foreground">/mês</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscricoes;
