import { Receipt, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import AppHeader from "@/components/AppHeader";
import {
  mockUser,
  mockExpenses,
  mockSubscriptions,
  getTotalExpenses,
  getTotalSubscriptions,
  getActiveSubscriptionsCount,
  formatCurrency,
  formatDate,
  categoryColors,
  getExpensesByCategory,
} from "@/data/mockData";

const Dashboard = () => {
  const totalExpenses = getTotalExpenses();
  const totalSubscriptions = getTotalSubscriptions();
  const totalMonthly = totalExpenses + totalSubscriptions;
  const activeSubsCount = getActiveSubscriptionsCount();
  const expensesByCategory = getExpensesByCategory();

  // Últimas 5 despesas ordenadas por data
  const recentExpenses = [...mockExpenses]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Olá, {mockUser.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Aqui está o resumo das tuas finanças</p>
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
              <ArrowUpRight className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">{mockExpenses.length} transações</p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <CreditCard className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Subscrições ativas</span>
              </div>
              <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                {activeSubsCount} ativas
              </span>
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
              <ArrowDownRight className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalMonthly)}</p>
            <p className="text-xs text-muted-foreground mt-1">despesas + subscrições</p>
          </div>
        </div>

        {/* Expenses by Category Chart */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="font-semibold mb-4">Despesas por Categoria</h2>
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
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[expense.category]}`}>
                      {expense.category}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Subscrições Ativas</h2>
              <Link 
                to="/subscricoes" 
                className="text-sm text-primary hover:underline"
              >
                Gerir
              </Link>
            </div>
            <div className="divide-y divide-border">
              {mockSubscriptions.filter((s) => s.status === "active").map((sub) => (
                <div key={sub.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Renova a {formatDate(sub.renewalDate)}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
