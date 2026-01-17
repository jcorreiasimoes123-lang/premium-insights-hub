// Dados de teste para a aplicação Carteira PT

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string; // Agora suporta categorias personalizadas
  date: Date;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  renewalDate: Date;
  status: "active" | "paused";
  includeInTotal: boolean;
  category: string;
}

// Categorias de receita
export const incomeCategories = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Reembolso",
  "Transferência",
  "Outros",
] as const;

// Categorias de subscrição
export const subscriptionCategories = [
  "Entretenimento",
  "Música",
  "Produtividade",
  "Outros",
] as const;

// Utilizador de teste
export const mockUser: User = {
  id: "user-001",
  name: "João Silva",
  email: "joao.silva@email.pt",
};

// Função para obter datas do mês atual
const getCurrentMonthDate = (day: number): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day);
};

// 8 despesas distribuídas ao longo do mês atual
export const mockExpenses: Expense[] = [
  {
    id: "exp-001",
    description: "Supermercado Continente",
    amount: 87.45,
    category: "Alimentação",
    date: getCurrentMonthDate(2),
  },
  {
    id: "exp-002",
    description: "Almoço restaurante",
    amount: 12.50,
    category: "Alimentação",
    date: getCurrentMonthDate(5),
  },
  {
    id: "exp-003",
    description: "Netflix",
    amount: 15.99,
    category: "Subscrições",
    date: getCurrentMonthDate(7),
  },
  {
    id: "exp-004",
    description: "Café e pastel de nata",
    amount: 3.20,
    category: "Alimentação",
    date: getCurrentMonthDate(9),
  },
  {
    id: "exp-005",
    description: "Spotify Premium",
    amount: 10.99,
    category: "Subscrições",
    date: getCurrentMonthDate(10),
  },
  {
    id: "exp-006",
    description: "Farmácia",
    amount: 24.80,
    category: "Outros",
    date: getCurrentMonthDate(12),
  },
  {
    id: "exp-007",
    description: "Supermercado Pingo Doce",
    amount: 52.30,
    category: "Alimentação",
    date: getCurrentMonthDate(14),
  },
  {
    id: "exp-008",
    description: "Uber (deslocação)",
    amount: 8.75,
    category: "Outros",
    date: getCurrentMonthDate(15),
  },
];

// 2 subscrições SaaS ativas
export const mockSubscriptions: Subscription[] = [
  {
    id: "sub-001",
    name: "Netflix",
    amount: 15.99,
    renewalDate: getCurrentMonthDate(7),
    status: "active",
    includeInTotal: true,
    category: "Entretenimento",
  },
  {
    id: "sub-002",
    name: "Spotify Premium",
    amount: 10.99,
    renewalDate: getCurrentMonthDate(10),
    status: "active",
    includeInTotal: true,
    category: "Música",
  },
];

// Funções utilitárias para cálculos
export const getTotalExpenses = (): number => {
  return mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
};

export const getTotalSubscriptions = (subscriptions: Subscription[] = mockSubscriptions): number => {
  return subscriptions
    .filter((s) => s.status === "active" && s.includeInTotal)
    .reduce((sum, sub) => sum + sub.amount, 0);
};

export const getActiveSubscriptionsCount = (subscriptions: Subscription[] = mockSubscriptions): number => {
  return subscriptions.filter((s) => s.status === "active").length;
};

export const formatCurrency = (value: number): string => {
  return `€${value.toFixed(2)}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
};

// Cores por categoria (fallback para categorias antigas)
export const categoryColors: Record<string, string> = {
  "Alimentação": "bg-emerald-500/10 text-emerald-600",
  "Subscrições": "bg-purple-500/10 text-purple-600",
  "Transporte": "bg-blue-500/10 text-blue-600",
  "Saúde": "bg-amber-500/10 text-amber-600",
  "Lazer": "bg-cyan-500/10 text-cyan-600",
  "Outros": "bg-slate-500/10 text-slate-600",
};

// Cores para gráfico (fallback)
export const categoryChartColors: Record<string, string> = {
  "Alimentação": "#10b981",
  "Subscrições": "#a855f7",
  "Transporte": "#3b82f6",
  "Saúde": "#f59e0b",
  "Lazer": "#06b6d4",
  "Outros": "#64748b",
};

// Agregar despesas por categoria (usa cores do hook quando disponível)
export const getExpensesByCategory = (
  expenses: Expense[] = mockExpenses,
  getCategoryColor?: (name: string) => string
) => {
  const grouped = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
    color: getCategoryColor ? getCategoryColor(name) : (categoryChartColors[name] || "#64748b"),
  }));
};

// Obter cor de badge para categoria
export const getCategoryBadgeClass = (category: string): string => {
  return categoryColors[category] || "bg-slate-500/10 text-slate-600";
};
