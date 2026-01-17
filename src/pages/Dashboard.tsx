import { useState, useEffect } from "react";
import {
  Receipt,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import {
  Expense,
  Subscription,
  formatCurrency,
  formatDate,
  getExpensesByCategory,
  getTotalSubscriptions,
  getActiveSubscriptionsCount,
  getCategoryBadgeClass,
} from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EXPENSES_KEY = "carteira-pt-expenses";
const SUBSCRIPTIONS_KEY = "carteira-pt-subscriptions";

const Dashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { getCategoryColor } = useExpenseCategories();

  useEffect(() => {
    const savedExpenses = localStorage.getItem(EXPENSES_KEY);
    const savedSubscriptions = localStorage.getItem(SUBSCRIPTIONS_KEY);

    if (savedExpenses) {
      const parsed = JSON.parse(savedExpenses);
      setExpenses(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
    }

    if (savedSubscriptions) {
      const parsed = JSON.parse(savedSubscriptions);
      setSubscriptions(
        parsed.map((s: any) => ({ ...s, renewalDate: new Date(s.renewalDate) }))
      );
    }
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalSubscriptions = getTotalSubscriptions(subscriptions);
  const totalMonthly = totalExpenses + totalSubscriptions;
  const activeSubsCount = getActiveSubscriptionsCount(subscriptions);
  const expensesByCategory = getExpensesByCategory(expenses, getCategoryColor);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const hasData = expenses.length > 0 || subscriptions.length > 0;

  const categoryExpenses = selectedCategory
    ? expenses.filter((e) => e.category === selectedCategory)
    : [];

  const handlePieClick = (data: any) => {
    if (data && data.name) {
      setSelectedCategory(data.name);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1>Olá! 👋</h1>
          <p className="text-muted-foreground mt-1">
            {hasData
              ? "Aqui está o resumo das tuas finanças"
              : "Começa a registar as tuas despesas e subscrições"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Expenses */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="icon-container-sm bg-primary/10">
                  <Receipt className="w-4 h-4 text-primary" />
                </div>
                <span className="stat-label">Despesas este mês</span>
              </div>
              {expenses.length > 0 && (
                <ArrowUpRight className="w-4 h-4 text-destructive" />
              )}
            </div>
            <p className="stat-value">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} {expenses.length === 1 ? "transação" : "transações"}
            </p>
          </div>

          {/* Subscriptions */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="icon-container-sm" style={{ background: 'hsl(var(--accent) / 0.1)' }}>
                  <CreditCard className="w-4 h-4" style={{ color: 'hsl(var(--accent))' }} />
                </div>
                <span className="stat-label">Subscrições ativas</span>
              </div>
              {activeSubsCount > 0 && (
                <span className="badge-accent">{activeSubsCount}</span>
              )}
            </div>
            <p className="stat-value">{formatCurrency(totalSubscriptions)}</p>
            <p className="text-xs text-muted-foreground mt-1">por mês</p>
          </div>

          {/* Total */}
          <div className="stat-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="icon-container-sm bg-primary/10">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="stat-label">Total mensal</span>
            </div>
            <p className="stat-value">{formatCurrency(totalMonthly)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              despesas + subscrições
            </p>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="card-base mb-6">
          <div className="section-header">
            <h2>Despesas por Categoria</h2>
          </div>
          <div className="p-5">
            {expensesByCategory.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="h-[220px] w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={handlePieClick}
                        style={{ cursor: "pointer" }}
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `€${value.toFixed(2)}`,
                          "Valor",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full lg:w-1/2 space-y-1">
                  {expensesByCategory
                    .sort((a, b) => b.value - a.value)
                    .map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm">{cat.name}</span>
                        </div>
                        <span className="font-medium text-sm">
                          {formatCurrency(cat.value)}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="Sem despesas registadas"
                description="Adiciona a tua primeira despesa para ver o gráfico de categorias."
                actionLabel="Adicionar despesa"
                actionLink="/despesas"
              />
            )}
          </div>
        </div>

        {/* Category Detail Modal */}
        <Dialog
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: expensesByCategory.find(
                      (c) => c.name === selectedCategory
                    )?.color,
                  }}
                />
                {selectedCategory}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              {categoryExpenses.length > 0 ? (
                <div className="space-y-1.5">
                  {categoryExpenses
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {expense.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(expense.date))}
                          </p>
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Sem despesas nesta categoria
                </p>
              )}
            </div>
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-bold text-lg">
                {formatCurrency(
                  categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
                )}
              </span>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recent Activity & Subscriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Expenses */}
          <div className="card-base">
            <div className="section-header">
              <h2>Despesas Recentes</h2>
              <Link
                to="/despesas"
                className="text-sm text-primary hover:underline"
              >
                {expenses.length > 0 ? "Ver todas" : "Adicionar"}
              </Link>
            </div>
            {recentExpenses.length > 0 ? (
              <div className="divide-y divide-border">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="list-item">
                    <div className="flex items-center gap-3">
                      <span
                        className={`badge-base ${getCategoryBadgeClass(
                          expense.category
                        )}`}
                      >
                        {expense.category}
                      </span>
                      <div>
                        <p className="font-medium text-sm">
                          {expense.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(expense.date))}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title="Nenhuma despesa"
                description="Regista as tuas compras e pagamentos."
                actionLabel="Adicionar despesa"
                actionLink="/despesas"
              />
            )}
          </div>

          {/* Active Subscriptions */}
          <div className="card-base">
            <div className="section-header">
              <h2>Subscrições Ativas</h2>
              <Link
                to="/subscricoes"
                className="text-sm text-primary hover:underline"
              >
                {subscriptions.length > 0 ? "Gerir" : "Adicionar"}
              </Link>
            </div>
            {activeSubscriptions.length > 0 ? (
              <div className="divide-y divide-border">
                {activeSubscriptions.map((sub) => (
                  <div key={sub.id} className="list-item">
                    <div className="flex items-center gap-3">
                      <div className="icon-container-sm bg-primary/10">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Renova a {formatDate(new Date(sub.renewalDate))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-sm">
                        {formatCurrency(sub.amount)}
                      </span>
                      <p className="text-xs text-muted-foreground">/mês</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CreditCard}
                title="Sem subscrições"
                description="Adiciona os teus serviços recorrentes."
                actionLabel="Adicionar subscrição"
                actionLink="/subscricoes"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
