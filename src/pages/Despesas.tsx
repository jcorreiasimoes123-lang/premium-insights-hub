import { useState, useEffect, useMemo } from "react";
import { Receipt, MoreVertical, Pencil, Trash2, Eraser, Filter } from "lucide-react";
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
} from "@/data/mockData";

const EXPENSES_KEY = "carteira-pt-expenses";

const Despesas = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [deletingExpense, setDeletingExpense] = useState<Expense | undefined>();
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(EXPENSES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setExpenses(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
    }
  }, []);

  // Guardar no localStorage
  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  // Obter lista única de categorias
  const categories = useMemo(() => {
    const cats = [...new Set(expenses.map((e) => e.category))];
    return cats.sort();
  }, [expenses]);

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

  // Filtrar e ordenar despesas
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

  const handleImportExpenses = (newExpenses: Omit<Expense, "id">[]) => {
    const expensesWithIds: Expense[] = newExpenses.map((exp, index) => ({
      ...exp,
      id: `exp-import-${Date.now()}-${index}`,
    }));
    setExpenses((prev) => [...prev, ...expensesWithIds]);
    toast({
      title: "Despesas importadas",
      description: `${newExpenses.length} despesa(s) importada(s) com sucesso.`,
    });
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
            {expenses.length > 0 && (
              <Button variant="outline" onClick={() => setIsClearAllDialogOpen(true)}>
                <Eraser className="w-4 h-4 mr-2" />
                Limpar Tudo
              </Button>
            )}
            <ImportPdfModal onImport={handleImportExpenses} />
            <Button variant="hero" onClick={handleOpenNewModal}>
              <Receipt className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Category Summary */}
        {Object.keys(expensesByCategory).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Object.entries(expensesByCategory).map(([category, data]) => (
              <div key={category} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryBadgeClass(category)}`}>
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
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">
                {selectedCategory === "todas" ? "Todas as Despesas" : `Despesas: ${selectedCategory}`}
              </h2>
              <span className="text-sm text-muted-foreground">
                ({filteredExpenses.length} {filteredExpenses.length === 1 ? "item" : "itens"} · {formatCurrency(filteredTotal)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
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
              <div className="p-8 text-center text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                {expenses.length === 0 ? (
                  <>
                    <p>Ainda não tens despesas.</p>
                    <p className="text-sm">Adiciona manualmente ou importa um extrato bancário.</p>
                  </>
                ) : (
                  <>
                    <p>Nenhuma despesa em "{selectedCategory}".</p>
                    <Button variant="link" onClick={() => setSelectedCategory("todas")}>
                      Ver todas as despesas
                    </Button>
                  </>
                )}
              </div>
            ) : (
              filteredExpenses.map((expense) => (
                <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(new Date(expense.date))}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryBadgeClass(expense.category)}`}>
                      {expense.category}
                    </span>
                    <span className="font-semibold min-w-[80px] text-right">
                      {formatCurrency(expense.amount)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditModal(expense)}>
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

      {/* Modal para criar/editar */}
      <ExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        expense={editingExpense}
        onSave={handleSaveExpense}
      />

      {/* Dialog de confirmação para eliminar */}
      <DeleteConfirmDialog
        open={!!deletingExpense}
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeletingExpense(undefined)}
        title="Eliminar despesa?"
        description={`Tens a certeza que queres eliminar "${deletingExpense?.description}"? Esta ação não pode ser desfeita.`}
      />

      {/* Dialog de confirmação para limpar tudo */}
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
