import { useState, useEffect } from "react";

const CATEGORIES_KEY = "carteira-pt-expense-categories";

// Categorias padrão
const DEFAULT_CATEGORIES = ["Alimentação", "Subscrições", "Transporte", "Saúde", "Lazer", "Outros"];

// Cores predefinidas para novas categorias
const CATEGORY_COLOR_PALETTE = [
  "#10b981", // emerald
  "#a855f7", // purple
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
  "#f97316", // orange
  "#64748b", // slate
];

export interface ExpenseCategory {
  name: string;
  color: string;
}

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  // Carregar categorias do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      // Inicializar com categorias padrão
      const defaultCats = DEFAULT_CATEGORIES.map((name, index) => ({
        name,
        color: CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length],
      }));
      setCategories(defaultCats);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCats));
    }
  }, []);

  // Guardar no localStorage sempre que mudar
  const saveCategories = (newCategories: ExpenseCategory[]) => {
    setCategories(newCategories);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
  };

  // Adicionar nova categoria
  const addCategory = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      return false; // já existe
    }
    const newCat: ExpenseCategory = {
      name: trimmed,
      color: CATEGORY_COLOR_PALETTE[categories.length % CATEGORY_COLOR_PALETTE.length],
    };
    saveCategories([...categories, newCat]);
    return true;
  };

  // Renomear categoria
  const renameCategory = (oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.name !== oldName)) {
      return false; // nome já existe
    }
    const updated = categories.map((c) =>
      c.name === oldName ? { ...c, name: trimmed } : c
    );
    saveCategories(updated);
    return true;
  };

  // Eliminar categoria (move despesas para "Outros")
  const deleteCategory = (name: string): boolean => {
    if (name === "Outros") return false; // não pode eliminar "Outros"
    const updated = categories.filter((c) => c.name !== name);
    saveCategories(updated);
    return true;
  };

  // Alterar cor da categoria
  const updateCategoryColor = (name: string, color: string) => {
    const updated = categories.map((c) =>
      c.name === name ? { ...c, color } : c
    );
    saveCategories(updated);
  };

  // Obter cor de uma categoria
  const getCategoryColor = (name: string): string => {
    return categories.find((c) => c.name === name)?.color || "#64748b";
  };

  // Obter lista de nomes
  const categoryNames = categories.map((c) => c.name);

  return {
    categories,
    categoryNames,
    addCategory,
    renameCategory,
    deleteCategory,
    updateCategoryColor,
    getCategoryColor,
  };
};

// Função utilitária para usar fora de hooks
export const getStoredCategories = (): ExpenseCategory[] => {
  const saved = localStorage.getItem(CATEGORIES_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return DEFAULT_CATEGORIES.map((name, index) => ({
    name,
    color: CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length],
  }));
};

export const getCategoryColorByName = (name: string): string => {
  const categories = getStoredCategories();
  return categories.find((c) => c.name === name)?.color || "#64748b";
};
