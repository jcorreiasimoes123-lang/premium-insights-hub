import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@/data/mockData";

export const useExpenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch expenses from Supabase
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      const mappedExpenses: Expense[] = (data || []).map((e) => ({
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        category: e.category,
        date: new Date(e.date),
        notes: e.notes || undefined,
      }));

      setExpenses(mappedExpenses);
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Erro ao carregar despesas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Add expense
  const addExpense = useCallback(
    async (data: Omit<Expense, "id">): Promise<Expense | null> => {
      if (!user) return null;

      try {
        const { data: inserted, error } = await supabase
          .from("expenses")
          .insert({
            user_id: user.id,
            description: data.description,
            amount: data.amount,
            category: data.category,
            date: data.date instanceof Date 
              ? data.date.toISOString().split("T")[0] 
              : data.date,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        const newExpense: Expense = {
          id: inserted.id,
          description: inserted.description,
          amount: Number(inserted.amount),
          category: inserted.category,
          date: new Date(inserted.date),
          notes: inserted.notes || undefined,
        };

        setExpenses((prev) => [newExpense, ...prev]);
        return newExpense;
      } catch (error: any) {
        console.error("Error adding expense:", error);
        toast({
          title: "Erro ao adicionar despesa",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
    },
    [user, toast]
  );

  // Update expense
  const updateExpense = useCallback(
    async (id: string, data: Omit<Expense, "id">): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("expenses")
          .update({
            description: data.description,
            amount: data.amount,
            category: data.category,
            date: data.date instanceof Date 
              ? data.date.toISOString().split("T")[0] 
              : data.date,
            notes: data.notes || null,
          })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setExpenses((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...data,
                  id,
                  date: data.date instanceof Date ? data.date : new Date(data.date),
                }
              : e
          )
        );
        return true;
      } catch (error: any) {
        console.error("Error updating expense:", error);
        toast({
          title: "Erro ao atualizar despesa",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  // Delete expense
  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setExpenses((prev) => prev.filter((e) => e.id !== id));
        return true;
      } catch (error: any) {
        console.error("Error deleting expense:", error);
        toast({
          title: "Erro ao eliminar despesa",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  // Clear all expenses
  const clearAllExpenses = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setExpenses([]);
      return true;
    } catch (error: any) {
      console.error("Error clearing expenses:", error);
      toast({
        title: "Erro ao limpar despesas",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Bulk import expenses
  const importExpenses = useCallback(
    async (newExpenses: Omit<Expense, "id">[]): Promise<number> => {
      if (!user || newExpenses.length === 0) return 0;

      try {
        const toInsert = newExpenses.map((exp) => ({
          user_id: user.id,
          description: exp.description,
          amount: exp.amount,
          category: exp.category,
          date: exp.date instanceof Date 
            ? exp.date.toISOString().split("T")[0] 
            : exp.date,
          notes: exp.notes || null,
        }));

        const { data, error } = await supabase
          .from("expenses")
          .insert(toInsert)
          .select();

        if (error) throw error;

        const insertedExpenses: Expense[] = (data || []).map((e) => ({
          id: e.id,
          description: e.description,
          amount: Number(e.amount),
          category: e.category,
          date: new Date(e.date),
          notes: e.notes || undefined,
        }));

        setExpenses((prev) => [...insertedExpenses, ...prev]);
        return insertedExpenses.length;
      } catch (error: any) {
        console.error("Error importing expenses:", error);
        toast({
          title: "Erro ao importar despesas",
          description: error.message,
          variant: "destructive",
        });
        return 0;
      }
    },
    [user, toast]
  );

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses,
    importExpenses,
    refetch: fetchExpenses,
  };
};
