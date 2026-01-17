import { useEffect, useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@/data/mockData";

const createExpenseSchema = (categoryNames: string[]) =>
  z.object({
    description: z
      .string()
      .trim()
      .min(1, "Descrição é obrigatória")
      .max(100, "Descrição deve ter no máximo 100 caracteres"),
    amount: z
      .string()
      .min(1, "Valor é obrigatório")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Valor deve ser maior que 0",
      }),
    category: z.string().min(1, "Seleciona uma categoria"),
    date: z.date({
      required_error: "Data é obrigatória",
    }),
  });

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  onSave: (expense: Omit<Expense, "id">) => void;
}

const ExpenseModal = ({ open, onOpenChange, expense, onSave }: ExpenseModalProps) => {
  const isEditing = !!expense;
  const { categoryNames, addCategory } = useExpenseCategories();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const expenseSchema = createExpenseSchema(categoryNames);
  type ExpenseFormData = z.infer<typeof expenseSchema>;

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date(),
    },
  });

  // Reset form when modal opens with expense data
  useEffect(() => {
    if (open) {
      if (expense) {
        form.reset({
          description: expense.description,
          amount: expense.amount.toString(),
          category: expense.category,
          date: new Date(expense.date),
        });
      } else {
        form.reset({
          description: "",
          amount: "",
          category: undefined,
          date: new Date(),
        });
      }
    }
  }, [open, expense, form]);

  const onSubmit = (data: ExpenseFormData) => {
    const newExpense: Omit<Expense, "id"> = {
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: data.date,
    };

    onSave(newExpense);
    onOpenChange(false);
  };

  const handleAddCategory = () => {
    if (addCategory(newCategoryName)) {
      toast({
        title: "Categoria criada",
        description: `"${newCategoryName}" foi adicionada às categorias.`,
      });
      form.setValue("category", newCategoryName);
      setNewCategoryName("");
      setShowAddCategory(false);
    } else {
      toast({
        title: "Erro",
        description: "Categoria já existe ou nome inválido.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Despesa" : "Nova Despesa"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supermercado Continente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <div className="space-y-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleciona uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryNames.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {!showAddCategory ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setShowAddCategory(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Nova categoria
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nome da categoria"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-8"
                          onClick={handleAddCategory}
                          disabled={!newCategoryName.trim()}
                        >
                          Adicionar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategoryName("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: pt })
                          ) : (
                            <span>Escolhe uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2020-01-01")
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="hero" className="flex-1">
                {isEditing ? "Guardar" : "Adicionar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;
