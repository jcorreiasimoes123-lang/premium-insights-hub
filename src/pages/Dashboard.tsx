import { useState, useEffect } from "react";
import { Receipt, CreditCard, TrendingUp, ArrowUpRight, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import {
  Expense,
  Subscription,
  formatCurrency,
  formatDate,
  categoryColors,
  getExpensesByCategory,
  getTotalSubscriptions,
  getActiveSubscriptionsCount,
} from "@/data/mockData";

// Chaves para localStorage
const EXPENSES_KEY = "carteira-pt-expenses";
const SUBSCRIPTIONS_KEY = "carteira-pt-subscriptions";

const Dashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedExpenses = localStorage.getItem(EXPENSES_KEY);
    const savedSubscriptions = localStorage.getItem(SUBSCRIPTIONS_KEY);

    if (savedExpenses) {
      const parsed = JSON.parse(savedExpenses);
      setExpenses(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
    }

    if (savedSubscriptions) {
      const parsed = JSON.parse(savedSubscriptions);
      setSubscriptions(parsed.map((s: any) => ({ ...s, renewalDate: new Date(s.renewalDate) })));
    }
  }, []);

  // Cálculos dinâmicos
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalSubscriptions = getTotalSubscriptions(subscriptions);
  const totalMonthly = totalExpenses + totalSubscriptions;
  const activeSubsCount = getActiveSubscriptionsCount(subscriptions);
  const expensesByCategory = getExpensesByCategory(expenses);

  // Últimas 5 despesas ordenadas por data
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Subscrições ativas
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");

  const hasData = expenses.length > 0 || subscriptions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Olá! 👋</h1>
          <p className="text-muted-foreground">
            {hasData 
              ? "Aqui está o resumo das tuas finanças" 
              : "Começa a registar as tuas despesas e subscrições"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Despesas este mês</span>
              </div>
              {expenses.length > 0 && (
                <ArrowUpRight className="w-4 h-4 text-destructive" />
              )}
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} {expenses.length === 1 ? "transação" : "transações"}
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <CreditCard className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Subscrições ativas</span>
              </div>
              {activeSubsCount > 0 && (
                <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded-full">
                  {activeSubsCount} {activeSubsCount === 1 ? "ativa" : "ativas"}
                </span>
              )}
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalSubscriptions)}</p>
            <p className="text-xs text-muted-foreground mt-1">por mês</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total mensal</span>
              </div>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalMonthly)}</p>
            <p className="text-xs text-muted-foreground mt-1">despesas + subscrições</p>
          </div>
        </div>

        {/* Expenses by Category Chart */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="font-semibold mb-4">Despesas por Categoria</h2>
          {expensesByCategory.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: €${value}`}
                    labelLine={false}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`€${value.toFixed(2)}`, "Valor"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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

        {/* Recent Activity & Subscriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Expenses */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Despesas Recentes</h2>
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
                  <div key={expense.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[expense.category]}`}>
                        {expense.category}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(new Date(expense.date))}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(expense.amount)}</span>
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
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Subscrições Ativas</h2>
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
                  <div key={sub.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Renova a {formatDate(new Date(sub.renewalDate))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-sm">{formatCurrency(sub.amount)}</span>
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
