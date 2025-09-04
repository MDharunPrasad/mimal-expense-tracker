// Custom hooks for database operations
import { useEffect, useState, useCallback } from 'react';
import { database } from '@/lib/database';
import { Category, Transaction, Settings, BalanceInfo, CategorySpend, MonthlyStats } from '@/types';
import { toast } from '@/hooks/use-toast';

// Database initialization hook
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDB = async () => {
      try {
        await database.init();
        await database.seedData();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to initialize local database.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  return { isInitialized, isLoading };
}

// Categories hook
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized } = useDatabase();

  const refreshCategories = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      const data = await database.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory = await database.addCategory(category);
      await refreshCategories();
      toast({
        title: 'Success',
        description: `Category "${newCategory.name}" created successfully.`,
      });
      return newCategory;
    } catch (error) {
      console.error('Failed to add category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create category.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [refreshCategories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    try {
      const updatedCategory = await database.updateCategory(id, updates);
      await refreshCategories();
      toast({
        title: 'Success',
        description: `Category "${updatedCategory.name}" updated successfully.`,
      });
      return updatedCategory;
    } catch (error) {
      console.error('Failed to update category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [refreshCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await database.deleteCategory(id);
      await refreshCategories();
      toast({
        title: 'Success',
        description: 'Category deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [refreshCategories]);

  useEffect(() => {
    if (isInitialized) {
      refreshCategories();
    }
  }, [refreshCategories, isInitialized]);

  return {
    categories,
    isLoading,
    refreshCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}

// Transactions hook
export function useTransactions(filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  flow?: string;
  paymentMethod?: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized } = useDatabase();

  const refreshTransactions = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      const data = await database.getTransactions(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, isInitialized]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction = await database.addTransaction(transaction);
      await refreshTransactions();
      toast({
        title: 'Success',
        description: 'Transaction added successfully.',
      });
      return newTransaction;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add transaction.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [refreshTransactions]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    try {
      const updatedTransaction = await database.updateTransaction(id, updates);
      await refreshTransactions();
      toast({
        title: 'Success',
        description: 'Transaction updated successfully.',
      });
      return updatedTransaction;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to update transaction.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [refreshTransactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await database.deleteTransaction(id);
      await refreshTransactions();
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [refreshTransactions]);

  useEffect(() => {
    if (isInitialized) {
      refreshTransactions();
    }
  }, [refreshTransactions, isInitialized]);

  return {
    transactions,
    isLoading,
    refreshTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

// Settings hook
export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized } = useDatabase();

  const refreshSettings = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      const data = await database.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    try {
      if (!settings) return;
      const updatedSettings = await database.updateSettings({ ...settings, ...updates });
      setSettings(updatedSettings);
      toast({
        title: 'Success',
        description: 'Settings updated successfully.',
      });
      return updatedSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [settings]);

  useEffect(() => {
    if (isInitialized) {
      refreshSettings();
    }
  }, [refreshSettings, isInitialized]);

  return {
    settings,
    isLoading,
    updateSettings,
  };
}

// Balance and analytics hook
export function useAnalytics() {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { settings } = useSettings();

  const calculateBalance = useCallback((): BalanceInfo => {
    let totalBalance = 0;
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), settings?.monthStartDay || 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, settings?.monthStartDay || 1);

    transactions.forEach(transaction => {
      const amount = transaction.amount / 100; // Convert from paise to rupees
      
      if (transaction.flow === 'income' || transaction.flow === 'adjustment') {
        totalBalance += amount;
      } else if (transaction.flow === 'expense') {
        totalBalance -= amount;
      }

      // Check if transaction is in current month
      const transactionDate = new Date(transaction.happenedAt);
      if (transactionDate >= thisMonthStart && transactionDate < nextMonthStart) {
        if (transaction.flow === 'income') {
          thisMonthIncome += amount;
        } else if (transaction.flow === 'expense') {
          thisMonthExpense += amount;
        }
      }
    });

    return {
      currentBalance: totalBalance,
      thisMonth: {
        income: thisMonthIncome,
        expense: thisMonthExpense,
        net: thisMonthIncome - thisMonthExpense,
      },
    };
  }, [transactions, settings]);

  const getCategorySpending = useCallback((month?: Date): CategorySpend[] => {
    const targetMonth = month || new Date();
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), settings?.monthStartDay || 1);
    const nextMonthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, settings?.monthStartDay || 1);

    const categoryTotals: Record<string, { amount: number; count: number }> = {};
    let totalExpense = 0;

    // Calculate category totals for the month
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.happenedAt);
      if (transactionDate >= monthStart && transactionDate < nextMonthStart && 
          transaction.flow === 'expense' && transaction.categoryId) {
        const amount = transaction.amount / 100;
        
        if (!categoryTotals[transaction.categoryId]) {
          categoryTotals[transaction.categoryId] = { amount: 0, count: 0 };
        }
        
        categoryTotals[transaction.categoryId].amount += amount;
        categoryTotals[transaction.categoryId].count += 1;
        totalExpense += amount;
      }
    });

    // Convert to CategorySpend array with category details
    return Object.entries(categoryTotals)
      .map(([categoryId, { amount, count }]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: category?.name || 'Unknown',
          categoryColor: category?.color || '#6B7280',
          categoryEmoji: category?.emoji,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          transactionCount: count,
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }, [transactions, categories, settings]);

  const getMonthlyComparison = useCallback((months: Date[]): MonthlyStats[] => {
    return months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), settings?.monthStartDay || 1);
      const nextMonthStart = new Date(month.getFullYear(), month.getMonth() + 1, settings?.monthStartDay || 1);
      
      let totalIncome = 0;
      let totalExpense = 0;
      const categoryTotals: Record<string, number> = {};

      transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.happenedAt);
        if (transactionDate >= monthStart && transactionDate < nextMonthStart) {
          const amount = transaction.amount / 100;
          
          if (transaction.flow === 'income') {
            totalIncome += amount;
          } else if (transaction.flow === 'expense') {
            totalExpense += amount;
            
            if (transaction.categoryId) {
              categoryTotals[transaction.categoryId] = (categoryTotals[transaction.categoryId] || 0) + amount;
            }
          }
        }
      });

      return {
        month: `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        categoryTotals,
      };
    });
  }, [transactions, settings]);

  return {
    calculateBalance,
    getCategorySpending,
    getMonthlyComparison,
  };
}