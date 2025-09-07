import { useState, useMemo } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useDatabase, useTransactions, useCategories, useAnalytics, useSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';

export function FinanceDashboard() {
  const { isInitialized, isLoading } = useDatabase();
  const { addTransaction } = useTransactions();
  const { categories } = useCategories();
  const { calculateBalance, getCategorySpending } = useAnalytics();
  const { settings } = useSettings();
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    type: 'expense' as 'expense' | 'income',
    category: '',
    amount: '',
    description: ''
  });

  const balance = useMemo(() => {
    try {
      return calculateBalance();
    } catch (error) {
      console.error('Error calculating balance:', error);
      return {
        currentBalance: 0,
        thisMonth: { income: 0, expense: 0, net: 0 }
      };
    }
  }, [calculateBalance]);

  const expenseData = useMemo(() => {
    const spending = getCategorySpending();
    return spending.map(item => ({
      name: item.categoryName,
      value: item.amount,
      color: item.categoryColor,
      emoji: item.categoryEmoji
    })).slice(0, 8); // Show top 8 categories
  }, [getCategorySpending]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddData.amount || !quickAddData.category) return;

    try {
      await addTransaction({
        flow: quickAddData.type,
        categoryId: quickAddData.category,
        amount: Math.round(parseFloat(quickAddData.amount) * 100),
        paymentMethod: 'upi',
        reason: quickAddData.description,
        happenedAt: new Date()
      });

      setQuickAddData({
        type: 'expense',
        category: '',
        amount: '',
        description: ''
      });
      setShowQuickAdd(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  if (isLoading || !isInitialized || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const expenseCategories = categories?.filter(c => c.kind === 'expense' || c.kind === 'both') || [];
  const incomeCategories = categories?.filter(c => c.kind === 'income' || c.kind === 'both') || [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-lg font-semibold">Finance Dashboard</h1>
              </div>
              <Button onClick={() => setShowQuickAdd(!showQuickAdd)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </header>

          <div className="p-4 lg:p-6 space-y-6">
            {/* Quick Add Form */}
            {showQuickAdd && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Add Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleQuickAdd} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={quickAddData.type}
                        onChange={(e) => setQuickAddData({...quickAddData, type: e.target.value as 'expense' | 'income', category: ''})}
                      >
                        <option value="expense">💸 Expense</option>
                        <option value="income">💰 Income</option>
                      </select>
                      
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={quickAddData.category}
                        onChange={(e) => setQuickAddData({...quickAddData, category: e.target.value})}
                        required
                      >
                        <option value="">Select category</option>
                        {(quickAddData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.name}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={quickAddData.amount}
                        onChange={(e) => setQuickAddData({...quickAddData, amount: e.target.value})}
                        required
                      />
                      
                      <input
                        placeholder="Description (optional)"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={quickAddData.description}
                        onChange={(e) => setQuickAddData({...quickAddData, description: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Save</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickAdd(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Hero Balance Section */}
            <div className="grid gap-6">
              <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Current Balance</p>
                    <div className="text-4xl md:text-5xl font-bold text-primary">
                      {formatCurrency(balance.currentBalance, settings.currencySymbol)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Income & Expenses Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">This Month Income</p>
                        <div className="text-2xl font-bold text-success">
                          {formatCurrency(balance.thisMonth.income, settings.currencySymbol)}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">This Month Expenses</p>
                        <div className="text-2xl font-bold text-destructive">
                          {formatCurrency(balance.thisMonth.expense, settings.currencySymbol)}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-destructive" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Expense Breakdown Chart */}
            {expenseData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {expenseData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={expenseData[index].color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value, settings.currencySymbol), 'Amount']}
                          labelFormatter={(label) => {
                            const item = expenseData.find(d => d.name === label);
                            return `${item?.emoji || ''} ${label}`;
                          }}
                        />
                        <Legend 
                          formatter={(value) => {
                            const item = expenseData.find(d => d.name === value);
                            return `${item?.emoji || ''} ${value}`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}