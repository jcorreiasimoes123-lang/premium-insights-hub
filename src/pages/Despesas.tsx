import { useState } from "react";
import { Receipt } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AddExpenseModal from "@/components/AddExpenseModal";
import ImportPdfModal from "@/components/ImportPdfModal";
import { Toaster } from "@/components/ui/toaster";
import {
  formatCurrency,
  formatDate,
  categoryColors,
  type Expense,
} from "@/data/mockData";

const Despesas = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Agrupar despesas por categoria
  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = { total: 0, count: 0 };
    }
    acc[exp.category].total += exp.amount;
    acc[exp.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Ordenar despesas por data (mais recentes primeiro)
  const sortedExpenses = [...expenses].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const handleAddExpense = (newExpense: Omit<Expense, "id">) => {
    const expense: Expense = {
      ...newExpense,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [...prev, expense]);
  };

  const handleImportExpenses = (newExpenses: Omit<Expense, "id">[]) => {
    const expensesWithIds: Expense[] = newExpenses.map((exp, index) => ({
      ...exp,
      id: `exp-import-${Date.now()}-${index}`,
    }));
    setExpenses((prev) => [...prev, ...expensesWithIds]);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Toaster />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Despesas</h1>
            <p className="text-muted-foreground">Regista e acompanha os teus gastos</p>
          </div>
          <div className="flex items-center gap-2">
            <ImportPdfModal onImport={handleImportExpenses} />
            <AddExpenseModal onAddExpense={handleAddExpense} />
          </div>
        </div>

        {/* Category Summary */}
        {Object.keys(expensesByCategory).length > 0 && (
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
        )}

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
            {sortedExpenses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ainda não tens despesas.</p>
                <p className="text-sm">Adiciona manualmente ou importa um extrato bancário.</p>
              </div>
            ) : (
              sortedExpenses.map((expense) => (
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
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Despesas;
