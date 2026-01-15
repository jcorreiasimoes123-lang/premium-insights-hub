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
  category: "Alimentação" | "Subscrições" | "Outros";
  date: Date;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  renewalDate: Date;
  active: boolean;
  category: string;
}

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
    active: true,
    category: "Entretenimento",
  },
  {
    id: "sub-002",
    name: "Spotify Premium",
    amount: 10.99,
    renewalDate: getCurrentMonthDate(10),
    active: true,
    category: "Música",
  },
];

// Funções utilitárias para cálculos
export const getTotalExpenses = (): number => {
  return mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
};

export const getTotalSubscriptions = (): number => {
  return mockSubscriptions.filter((s) => s.active).reduce((sum, sub) => sum + sub.amount, 0);
};

export const getActiveSubscriptionsCount = (): number => {
  return mockSubscriptions.filter((s) => s.active).length;
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

// Cores por categoria
export const categoryColors: Record<string, string> = {
  "Alimentação": "bg-emerald-500/10 text-emerald-600",
  "Subscrições": "bg-purple-500/10 text-purple-600",
  "Outros": "bg-slate-500/10 text-slate-600",
};

// Cores para gráfico (hex)
export const categoryChartColors: Record<string, string> = {
  "Alimentação": "#10b981",
  "Subscrições": "#a855f7",
  "Outros": "#64748b",
};

// Agregar despesas por categoria
export const getExpensesByCategory = (expenses: Expense[] = mockExpenses) => {
  const grouped = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
    color: categoryChartColors[name] || "#64748b",
  }));
};
