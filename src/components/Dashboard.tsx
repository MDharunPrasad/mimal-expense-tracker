import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BalanceCard } from './BalanceCard';
import { MonthlyChart } from './MonthlyChart';
import { SpendingSuggestions } from './SpendingSuggestions';
import { AdjustBalanceDialog } from './AdjustBalanceDialog';
import { TransactionForm } from './TransactionForm';
import { useCategories, useTransactions, useAnalytics, useSettings } from '@/hooks/useDatabase';
import { Plus, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, getMonthName } from '@/lib/utils';

export function Dashboard() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAdjustBalance, setShowAdjustBalance] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { categories } = useCategories();
  const { addTransaction } = useTransactions();
  const { settings } = useSettings();
  const { calculateBalance, getCategorySpending } = useAnalytics();

  const balanceInfo = useMemo(() => calculateBalance(), [calculateBalance]);
  const categorySpending = useMemo(() => getCategorySpending(selectedMonth), [getCategorySpending, selectedMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleAddTransaction = async (transactionData: any) => {
    await addTransaction(transactionData);
    setShowTransactionForm(false);
  };

  const handleAdjustBalance = async (amount: number, reason: string) => {
    await addTransaction({
      flow: 'adjustment',
      amount: Math.round(amount * 100), // Convert to paise
      paymentMethod: 'other',
      reason: `Balance adjustment: ${reason}`,
      happenedAt: new Date(),
    });
    setShowAdjustBalance(false);
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your financial health at a glance</p>
        </div>
        <Button
          onClick={() => setShowTransactionForm(true)}
          className="gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </div>

      {/* Balance Card */}
      <BalanceCard
        balanceInfo={balanceInfo}
        currencySymbol={settings.currencySymbol}
        onAdjustBalance={() => setShowAdjustBalance(true)}
      />

      {/* Month Navigation */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium min-w-[140px] text-center">
                {getMonthName(selectedMonth)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
                disabled={selectedMonth >= new Date()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-muted-foreground mb-1">Total Income</p>
              <p className="text-lg font-semibold text-success">
                {formatCurrency(
                  categorySpending.reduce((sum, cat) => 
                    categories.find(c => c.id === cat.categoryId)?.kind === 'income' ? sum + cat.amount : sum, 0
                  ),
                  settings.currencySymbol
                )}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-muted-foreground mb-1">Total Expense</p>
              <p className="text-lg font-semibold text-destructive">
                {formatCurrency(
                  categorySpending.reduce((sum, cat) => 
                    categories.find(c => c.id === cat.categoryId)?.kind !== 'income' ? sum + cat.amount : sum, 0
                  ),
                  settings.currencySymbol
                )}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Transactions</p>
              <p className="text-lg font-semibold">
                {categorySpending.reduce((sum, cat) => sum + cat.transactionCount, 0)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <MonthlyChart
            data={categorySpending}
            categories={categories}
            currencySymbol={settings.currencySymbol}
          />
        </CardContent>
      </Card>

      {/* Spending Insights */}
      <SpendingSuggestions
        categorySpending={categorySpending}
        categories={categories}
        currencySymbol={settings.currencySymbol}
      />

      {/* Dialogs */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <TransactionForm
            categories={categories}
            onSubmit={handleAddTransaction}
            onCancel={() => setShowTransactionForm(false)}
            defaultPaymentMethod={settings.defaultPaymentMethod}
          />
        </div>
      )}

      {showAdjustBalance && (
        <AdjustBalanceDialog
          isOpen={showAdjustBalance}
          onClose={() => setShowAdjustBalance(false)}
          onSubmit={handleAdjustBalance}
          currencySymbol={settings.currencySymbol}
        />
      )}
    </div>
  );
}