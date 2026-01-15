import { Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import {
  mockExpenses,
  getTotalExpenses,
  formatCurrency,
  formatDate,
  categoryColors,
} from "@/data/mockData";

const Despesas = () => {
  const totalExpenses = getTotalExpenses();

  // Agrupar despesas por categoria
  const expensesByCategory = mockExpenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = { total: 0, count: 0 };
    }
    acc[exp.category].total += exp.amount;
    acc[exp.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Ordenar despesas por data (mais recentes primeiro)
  const sortedExpenses = [...mockExpenses].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Despesas</h1>
            <p className="text-muted-foreground">Regista e acompanha os teus gastos</p>
          </div>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>

        {/* Category Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(expensesByCategory).map(([category, data]) => (
            <div key={category} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[category]}`}>
                  {category}
                </span>
                <span className="text-xs text-muted-foreground">{data.count} itens</span>
              </div>
              <p className="text-2xl font-bold mt-3">{formatCurrency(data.total)}</p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Total de despesas este mês</span>
            </div>
            <span className="text-2xl font-bold">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Todas as Despesas</h2>
          </div>
          <div className="divide-y divide-border">
            {sortedExpenses.map((expense) => (
              <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[expense.category]}`}>
                    {expense.category}
                  </span>
                  <span className="font-semibold min-w-[80px] text-right">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Despesas;
