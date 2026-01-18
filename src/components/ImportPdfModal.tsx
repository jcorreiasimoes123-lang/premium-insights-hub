import { useState, useRef } from "react";
import { Upload, FileText, Loader2, Check, X, AlertCircle, Bug, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, incomeCategories } from "@/data/mockData";
import { getStoredCategories } from "@/hooks/useExpenseCategories";
import { useAuth } from "@/contexts/AuthContext";
import type { Expense, Income } from "@/data/mockData";

interface ParsedTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: "expense" | "income";
  selected: boolean;
}

interface ImportPdfModalProps {
  onImport: (expenses: Omit<Expense, "id">[], incomes: Omit<Income, "id">[]) => void;
}

interface DiagnosticInfo {
  status?: number;
  message?: string;
  transactionCount?: number;
  responsePreview?: string;
  processingTimeMs?: number;
}

const ImportPdfModal = ({ onImport }: ImportPdfModalProps) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated
    if (!session?.access_token) {
      setError("Sessão expirada. Por favor, inicia sessão novamente.");
      return;
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setError("Formato não suportado. Usa PDF, CSV ou TXT.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ficheiro demasiado grande. Máximo 5MB.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    setTransactions([]);
    setDiagnostics(null);

    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-pdf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const processingTimeMs = Date.now() - startTime;
      const data = await response.json();

      // Store diagnostics
      setDiagnostics({
        status: response.status,
        message: data.message || data.error || "Sem mensagem",
        transactionCount: data.transactions?.length || 0,
        responsePreview: JSON.stringify(data).substring(0, 300),
        processingTimeMs,
      });

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
      }

      if (data.transactions && data.transactions.length > 0) {
        setTransactions(data.transactions);
        toast({
          title: "Ficheiro processado",
          description: data.message,
        });
      } else {
        setError(data.message || "Não foram encontradas transações.");
      }
    } catch (err) {
      console.error("Erro:", err);
      const errorMsg = err instanceof Error ? err.message : "Erro ao processar ficheiro";
      setError(errorMsg);
      if (!diagnostics) {
        setDiagnostics({
          status: 0,
          message: errorMsg,
          transactionCount: 0,
          processingTimeMs: Date.now() - startTime,
        });
      }
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toggleTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const toggleAll = () => {
    const allSelected = transactions.every((t) => t.selected);
    setTransactions((prev) =>
      prev.map((t) => ({ ...t, selected: !allSelected }))
    );
  };

  const updateCategory = (id: string, category: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category } : t))
    );
  };

  const storedCategories = getStoredCategories();
  
  // Separar transações por tipo
  const expenseTransactions = transactions.filter(t => t.type === "expense");
  const incomeTransactions = transactions.filter(t => t.type === "income");

  const handleImport = () => {
    const selectedExpenses = transactions.filter((t) => t.selected && t.type === "expense");
    const selectedIncomes = transactions.filter((t) => t.selected && t.type === "income");
    
    if (selectedExpenses.length === 0 && selectedIncomes.length === 0) {
      toast({
        title: "Nenhuma transação selecionada",
        description: "Seleciona pelo menos uma transação para importar.",
        variant: "destructive",
      });
      return;
    }

    const expenses: Omit<Expense, "id">[] = selectedExpenses.map((t) => ({
      description: t.description,
      amount: t.amount,
      category: t.category,
      date: new Date(t.date),
    }));
    
    const incomes: Omit<Income, "id">[] = selectedIncomes.map((t) => ({
      description: t.description,
      amount: t.amount,
      category: t.category,
      date: new Date(t.date),
    }));

    onImport(expenses, incomes);
    
    const parts = [];
    if (selectedExpenses.length > 0) parts.push(`${selectedExpenses.length} despesa(s)`);
    if (selectedIncomes.length > 0) parts.push(`${selectedIncomes.length} receita(s)`);
    
    toast({
      title: "Transações importadas",
      description: `${parts.join(" e ")} adicionada(s) com sucesso.`,
    });

    // Reset and close
    setOpen(false);
    setTransactions([]);
    setFileName(null);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTransactions([]);
    setFileName(null);
    setError(null);
    setIsLoading(false);
    setShowDiagnostics(false);
    setDiagnostics(null);
  };

  const selectedExpenseCount = expenseTransactions.filter((t) => t.selected).length;
  const selectedIncomeCount = incomeTransactions.filter((t) => t.selected).length;
  const selectedCount = selectedExpenseCount + selectedIncomeCount;
  const selectedExpenseTotal = expenseTransactions
    .filter((t) => t.selected)
    .reduce((sum, t) => sum + t.amount, 0);
  const selectedIncomeTotal = incomeTransactions
    .filter((t) => t.selected)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Importar Extrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* File Upload Area */}
          {transactions.length === 0 && !isLoading && (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Clica para selecionar um ficheiro
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, CSV ou TXT (máx. 5MB)
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                A processar {fileName}...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs"
                      onClick={() => {
                        setError(null);
                        setFileName(null);
                        setDiagnostics(null);
                      }}
                    >
                      Tentar outro ficheiro
                    </Button>
                    <span className="text-muted-foreground">•</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs flex items-center gap-1"
                      onClick={() => setShowDiagnostics(!showDiagnostics)}
                    >
                      <Bug className="w-3 h-3" />
                      {showDiagnostics ? "Ocultar diagnóstico" : "Ver diagnóstico"}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Diagnostics Panel */}
              {showDiagnostics && diagnostics && (
                <div className="p-3 bg-muted/50 rounded-lg border text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status HTTP:</span>
                    <span className={diagnostics.status === 200 ? "text-green-600" : "text-destructive"}>
                      {diagnostics.status || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transações:</span>
                    <span>{diagnostics.transactionCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo:</span>
                    <span>{diagnostics.processingTimeMs ? `${(diagnostics.processingTimeMs / 1000).toFixed(1)}s` : "N/A"}</span>
                  </div>
                  <div className="pt-2 border-t border-border mt-2">
                    <span className="text-muted-foreground block mb-1">Mensagem:</span>
                    <p className="text-foreground break-words">{diagnostics.message}</p>
                  </div>
                  {diagnostics.responsePreview && (
                    <div className="pt-2 border-t border-border mt-2">
                      <span className="text-muted-foreground block mb-1">Resposta (preview):</span>
                      <p className="text-foreground break-all text-[10px] opacity-70">
                        {diagnostics.responsePreview}...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Transactions Preview with Tabs */}
          {transactions.length > 0 && (
            <Tabs defaultValue={expenseTransactions.length > 0 ? "expenses" : "incomes"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="expenses" className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  Despesas ({expenseTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="incomes" className="flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  Receitas ({incomeTransactions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses">
                {expenseTransactions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>Nenhuma despesa encontrada no extrato.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={expenseTransactions.every((t) => t.selected)}
                          onCheckedChange={() => {
                            const allSelected = expenseTransactions.every((t) => t.selected);
                            setTransactions((prev) =>
                              prev.map((t) => t.type === "expense" ? { ...t, selected: !allSelected } : t)
                            );
                          }}
                          id="select-all-expenses"
                        />
                        <label htmlFor="select-all-expenses" className="text-sm cursor-pointer">
                          Selecionar todas ({expenseTransactions.length})
                        </label>
                      </div>
                    </div>
                    <div className="border rounded-lg divide-y divide-border max-h-[250px] overflow-y-auto">
                      {expenseTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className={`p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                            !transaction.selected ? "opacity-50" : ""
                          }`}
                        >
                          <Checkbox
                            checked={transaction.selected}
                            onCheckedChange={() => toggleTransaction(transaction.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString("pt-PT")}
                            </p>
                          </div>
                          <Select
                            value={transaction.category}
                            onValueChange={(value) =>
                              updateCategory(transaction.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {storedCategories.map((cat) => (
                                <SelectItem key={cat.name} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="font-semibold text-sm min-w-[70px] text-right text-red-600">
                            -{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 flex items-center justify-between mt-2">
                      <span className="text-sm">
                        <span className="font-medium">{selectedExpenseCount}</span> de{" "}
                        {expenseTransactions.length} selecionadas
                      </span>
                      <span className="font-bold text-red-600">-{formatCurrency(selectedExpenseTotal)}</span>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="incomes">
                {incomeTransactions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>Nenhuma receita encontrada no extrato.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={incomeTransactions.every((t) => t.selected)}
                          onCheckedChange={() => {
                            const allSelected = incomeTransactions.every((t) => t.selected);
                            setTransactions((prev) =>
                              prev.map((t) => t.type === "income" ? { ...t, selected: !allSelected } : t)
                            );
                          }}
                          id="select-all-incomes"
                        />
                        <label htmlFor="select-all-incomes" className="text-sm cursor-pointer">
                          Selecionar todas ({incomeTransactions.length})
                        </label>
                      </div>
                    </div>
                    <div className="border rounded-lg divide-y divide-border max-h-[250px] overflow-y-auto">
                      {incomeTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className={`p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                            !transaction.selected ? "opacity-50" : ""
                          }`}
                        >
                          <Checkbox
                            checked={transaction.selected}
                            onCheckedChange={() => toggleTransaction(transaction.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString("pt-PT")}
                            </p>
                          </div>
                          <Select
                            value={transaction.category}
                            onValueChange={(value) =>
                              updateCategory(transaction.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {incomeCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="font-semibold text-sm min-w-[70px] text-right text-green-600">
                            +{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 flex items-center justify-between mt-2">
                      <span className="text-sm">
                        <span className="font-medium">{selectedIncomeCount}</span> de{" "}
                        {incomeTransactions.length} selecionadas
                      </span>
                      <span className="font-bold text-green-600">+{formatCurrency(selectedIncomeTotal)}</span>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        {transactions.length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="hero"
              onClick={handleImport}
              disabled={selectedCount === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Importar {selectedCount > 0 && `(${selectedCount})`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportPdfModal;
