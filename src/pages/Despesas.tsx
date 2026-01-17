import { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  MoreVertical,
  Pencil,
  Trash2,
  Eraser,
  Filter,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppHeader from "@/components/AppHeader";
import ExpenseModal from "@/components/ExpenseModal";
import ImportPdfModal from "@/components/ImportPdfModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatDate,
  getCategoryBadgeClass,
  type Expense,
  type Income,
} from "@/data/mockData";

const EXPENSES_KEY = "carteira-pt-expenses";
const INCOMES_KEY = "carteira-pt-incomes";

const Despesas = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [deletingExpense, setDeletingExpense] = useState<Expense | undefined>();
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  useEffect(() => {
    const saved = localStorage.getItem(EXPENSES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setExpenses(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const categories = useMemo(() => {
    const cats = [...new Set(expenses.map((e) => e.category))];
    return cats.sort();
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = { total: 0, count: 0 };
    }
    acc[exp.category].total += exp.amount;
    acc[exp.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    if (selectedCategory !== "todas") {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, selectedCategory]);

  const filteredTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleOpenNewModal = () => {
    setEditingExpense(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleSaveExpense = (data: Omit<Expense, "id">) => {
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id ? { ...data, id: e.id } : e
        )
      );
      toast({
        title: "Despesa atualizada",
        description: `"${data.description}" foi atualizada com sucesso.`,
      });
    } else {
      const newExpense: Expense = {
        ...data,
        id: `exp-${Date.now()}`,
      };
      setExpenses((prev) => [...prev, newExpense]);
      toast({
        title: "Despesa adicionada",
        description: `"${data.description}" foi adicionada.`,
      });
    }
    setEditingExpense(undefined);
  };

  const handleDeleteExpense = () => {
    if (!deletingExpense) return;
    setExpenses((prev) => prev.filter((e) => e.id !== deletingExpense.id));
    toast({
      title: "Despesa eliminada",
      description: `"${deletingExpense.description}" foi eliminada.`,
      variant: "destructive",
    });
    setDeletingExpense(undefined);
  };

  const handleClearAllExpenses = () => {
    setExpenses([]);
    toast({
      title: "Despesas limpas",
      description: "Todas as despesas foram eliminadas.",
      variant: "destructive",
    });
    setIsClearAllDialogOpen(false);
  };

  const handleImportExpenses = (
    newExpenses: Omit<Expense, "id">[],
    newIncomes: Omit<Income, "id">[]
  ) => {
    if (newExpenses.length > 0) {
      const expensesWithIds: Expense[] = newExpenses.map((exp, index) => ({
        ...exp,
        id: `exp-import-${Date.now()}-${index}`,
      }));
      setExpenses((prev) => [...prev, ...expensesWithIds]);
    }

    if (newIncomes.length > 0) {
      const savedIncomes = localStorage.getItem(INCOMES_KEY);
      const existingIncomes: Income[] = savedIncomes
        ? JSON.parse(savedIncomes).map((i: any) => ({
            ...i,
            date: new Date(i.date),
          }))
        : [];

      const incomesWithIds: Income[] = newIncomes.map((inc, index) => ({
        ...inc,
        id: `inc-import-${Date.now()}-${index}`,
      }));

      localStorage.setItem(
        INCOMES_KEY,
        JSON.stringify([...existingIncomes, ...incomesWithIds])
      );
    }

    const parts = [];
    if (newExpenses.length > 0) parts.push(`${newExpenses.length} despesa(s)`);
    if (newIncomes.length > 0) parts.push(`${newIncomes.length} receita(s)`);

    toast({
      title: "Transações importadas",
      description: `${parts.join(" e ")} importada(s) com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Toaster />

      <main className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>Despesas</h1>
            <p className="text-muted-foreground mt-1">
              Regista e acompanha os teus gastos
            </p>
          </div>
          <div className="flex items-center gap-2">
            {expenses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearAllDialogOpen(true)}
              >
                <Eraser className="w-4 h-4 mr-1.5" />
                Limpar
              </Button>
            )}
            <ImportPdfModal onImport={handleImportExpenses} />
            <Button onClick={handleOpenNewModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Category Summary */}
        {Object.keys(expensesByCategory).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b.total - a.total)
              .slice(0, 4)
              .map(([category, data]) => (
                <div key={category} className="stat-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`badge-base text-[10px] ${getCategoryBadgeClass(
                        category
                      )}`}
                    >
                      {category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {data.count}
                    </span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(data.total)}</p>
                </div>
              ))}
          </div>
        )}

        {/* Total */}
        <div className="stat-card mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="icon-container-sm bg-primary/10">
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              <span className="text-muted-foreground">
                Total de despesas este mês
              </span>
            </div>
            <span className="stat-value">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        {/* Expenses List */}
        <div className="card-base overflow-hidden">
          <div className="section-header flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h2>
                {selectedCategory === "todas"
                  ? "Todas as Despesas"
                  : `Despesas: ${selectedCategory}`}
              </h2>
              <span className="text-sm text-muted-foreground">
                ({filteredExpenses.length} · {formatCurrency(filteredTotal)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat} ({expensesByCategory[cat]?.count || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="divide-y divide-border">
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="icon-container-lg bg-muted mx-auto mb-4">
                  <Receipt className="w-6 h-6 text-muted-foreground" />
                </div>
                {expenses.length === 0 ? (
                  <>
                    <p className="font-medium mb-1">Ainda não tens despesas.</p>
                    <p className="text-sm text-muted-foreground">
                      Adiciona manualmente ou importa um extrato.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium mb-1">
                      Nenhuma despesa em "{selectedCategory}".
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSelectedCategory("todas")}
                    >
                      Ver todas
                    </Button>
                  </>
                )}
              </div>
            ) : (
              filteredExpenses.map((expense) => (
                <div key={expense.id} className="list-item-interactive">
                  <div className="flex items-center gap-3">
                    <div className="icon-container-sm bg-muted">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(new Date(expense.date))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`badge-base ${getCategoryBadgeClass(
                        expense.category
                      )}`}
                    >
                      {expense.category}
                    </span>
                    <span className="font-semibold min-w-[70px] text-right">
                      {formatCurrency(expense.amount)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenEditModal(expense)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingExpense(expense)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <ExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        expense={editingExpense}
        onSave={handleSaveExpense}
      />

      <DeleteConfirmDialog
        open={!!deletingExpense}
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeletingExpense(undefined)}
        title="Eliminar despesa?"
        description={`Tens a certeza que queres eliminar "${deletingExpense?.description}"? Esta ação não pode ser desfeita.`}
      />

      <DeleteConfirmDialog
        open={isClearAllDialogOpen}
        onConfirm={handleClearAllExpenses}
        onCancel={() => setIsClearAllDialogOpen(false)}
        title="Limpar todas as despesas?"
        description="Tens a certeza que queres eliminar TODAS as despesas? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default Despesas;
