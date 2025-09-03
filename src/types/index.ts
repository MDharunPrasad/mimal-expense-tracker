export type TransactionFlow = 'expense' | 'income' | 'adjustment';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'other';
export type CategoryKind = 'expense' | 'income' | 'both';

export interface Category {
  id: string;
  name: string;
  color: string; // hex color
  emoji?: string;
  kind: CategoryKind;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  flow: TransactionFlow;
  categoryId?: string; // nullable for adjustments
  amount: number; // positive number in INR paise (multiply by 100)
  paymentMethod: PaymentMethod;
  reason?: string;
  happenedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  currencySymbol: string;
  defaultPaymentMethod: PaymentMethod;
  monthStartDay: number; // 1-28
  accentColor: string;
  requirePasscode: boolean;
  passcodeHash?: string;
  theme: 'light' | 'dark' | 'system';
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  categoryTotals: Record<string, number>;
}

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryEmoji?: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface BalanceInfo {
  currentBalance: number;
  thisMonth: {
    income: number;
    expense: number;
    net: number;
  };
}

// Default categories for seeding
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Expense categories
  { name: 'Food', color: '#FB923C', emoji: '🍔', kind: 'expense' },
  { name: 'Transport', color: '#22C55E', emoji: '🚌', kind: 'expense' },
  { name: 'Bills', color: '#A855F7', emoji: '📄', kind: 'expense' },
  { name: 'Entertainment', color: '#EF4444', emoji: '🎬', kind: 'expense' },
  { name: 'Shopping', color: '#EC4899', emoji: '🛍️', kind: 'expense' },
  { name: 'Health', color: '#10B981', emoji: '💊', kind: 'expense' },
  { name: 'Education', color: '#3B82F6', emoji: '📚', kind: 'expense' },
  { name: 'Home', color: '#F59E0B', emoji: '🏠', kind: 'expense' },
  { name: 'Miscellaneous', color: '#6B7280', emoji: '✨', kind: 'expense' },
  
  // Income categories
  { name: 'Salary', color: '#16A34A', emoji: '💼', kind: 'income' },
  { name: 'Gift', color: '#F97316', emoji: '🎁', kind: 'income' },
  { name: 'Refund', color: '#0EA5E9', emoji: '↩️', kind: 'income' },
];

// Default settings
export const DEFAULT_SETTINGS: Omit<Settings, 'id'>= {
  currencySymbol: '₹',
  defaultPaymentMethod: 'upi',
  monthStartDay: 1,
  accentColor: '#FB923C',
  requirePasscode: false,
  theme: 'dark',
};