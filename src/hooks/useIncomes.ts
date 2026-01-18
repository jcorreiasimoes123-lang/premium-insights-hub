import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Income } from "@/data/mockData";

export const useIncomes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch incomes from Supabase
  const fetchIncomes = useCallback(async () => {
    if (!user) {
      setIncomes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      const mappedIncomes: Income[] = (data || []).map((i) => ({
        id: i.id,
        description: i.description,
        amount: Number(i.amount),
        category: i.category,
        date: new Date(i.date),
        notes: i.notes || undefined,
      }));

      setIncomes(mappedIncomes);
    } catch (error: any) {
      console.error("Error fetching incomes:", error);
      toast({
        title: "Erro ao carregar receitas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Add income
  const addIncome = useCallback(
    async (data: Omit<Income, "id">): Promise<Income | null> => {
      if (!user) return null;

      try {
        const { data: inserted, error } = await supabase
          .from("incomes")
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

        const newIncome: Income = {
          id: inserted.id,
          description: inserted.description,
          amount: Number(inserted.amount),
          category: inserted.category,
          date: new Date(inserted.date),
          notes: inserted.notes || undefined,
        };

        setIncomes((prev) => [newIncome, ...prev]);
        return newIncome;
      } catch (error: any) {
        console.error("Error adding income:", error);
        toast({
          title: "Erro ao adicionar receita",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
    },
    [user, toast]
  );

  // Update income
  const updateIncome = useCallback(
    async (id: string, data: Omit<Income, "id">): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("incomes")
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

        setIncomes((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...data,
                  id,
                  date: data.date instanceof Date ? data.date : new Date(data.date),
                }
              : i
          )
        );
        return true;
      } catch (error: any) {
        console.error("Error updating income:", error);
        toast({
          title: "Erro ao atualizar receita",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  // Delete income
  const deleteIncome = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("incomes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setIncomes((prev) => prev.filter((i) => i.id !== id));
        return true;
      } catch (error: any) {
        console.error("Error deleting income:", error);
        toast({
          title: "Erro ao eliminar receita",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  // Bulk import incomes
  const importIncomes = useCallback(
    async (newIncomes: Omit<Income, "id">[]): Promise<number> => {
      if (!user || newIncomes.length === 0) return 0;

      try {
        const toInsert = newIncomes.map((inc) => ({
          user_id: user.id,
          description: inc.description,
          amount: inc.amount,
          category: inc.category,
          date: inc.date instanceof Date 
            ? inc.date.toISOString().split("T")[0] 
            : inc.date,
          notes: inc.notes || null,
        }));

        const { data, error } = await supabase
          .from("incomes")
          .insert(toInsert)
          .select();

        if (error) throw error;

        const insertedIncomes: Income[] = (data || []).map((i) => ({
          id: i.id,
          description: i.description,
          amount: Number(i.amount),
          category: i.category,
          date: new Date(i.date),
          notes: i.notes || undefined,
        }));

        setIncomes((prev) => [...insertedIncomes, ...prev]);
        return insertedIncomes.length;
      } catch (error: any) {
        console.error("Error importing incomes:", error);
        toast({
          title: "Erro ao importar receitas",
          description: error.message,
          variant: "destructive",
        });
        return 0;
      }
    },
    [user, toast]
  );

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return {
    incomes,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    importIncomes,
    refetch: fetchIncomes,
  };
};
