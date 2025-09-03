import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { useDatabase, useTransactions, useCategories, useAnalytics, useSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';

export function SimpleExpenseApp() {
  const { isInitialized } = useDatabase();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  const { calculateBalance } = useAnalytics();
  const { settings } = useSettings();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const balance = useMemo(() => calculateBalance(), [calculateBalance]);
  const expenseCategories = categories.filter(c => c.kind === 'expense' || c.kind === 'both');
  const incomeCategories = categories.filter(c => c.kind === 'income' || c.kind === 'both');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) return;

    await addTransaction({
      flow: formData.type as 'expense' | 'income',
      categoryId: formData.category,
      amount: Math.round(parseFloat(formData.amount) * 100),
      paymentMethod: 'upi',
      reason: formData.description,
      happenedAt: new Date(formData.date)
    });

    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  if (!isInitialized || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
      {/* Header with Balance */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-4">My Expenses</h1>
        
        <Card className="mb-4">
          <CardContent className="p-4 text-center">
            <h2 className="text-lg text-muted-foreground mb-2">Current Balance</h2>
            <div className="text-3xl font-bold text-primary mb-4">
              {formatCurrency(balance.currentBalance, settings.currencySymbol)}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Income</p>
                <p className="font-semibold text-success">
                  {formatCurrency(balance.thisMonth.income, settings.currencySymbol)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Expense</p>
                <p className="font-semibold text-destructive">
                  {formatCurrency(balance.thisMonth.expense, settings.currencySymbol)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Net</p>
                <p className={`font-semibold ${balance.thisMonth.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(Math.abs(balance.thisMonth.net), settings.currencySymbol)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="w-full mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({...formData, type: value, category: ''})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">💸 Expense</SelectItem>
                    <SelectItem value="income">💰 Income</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />

                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <Input
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((transaction) => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  const isIncome = transaction.flow === 'income';
                  
                  return (
                    <tr key={transaction.id}>
                      <td className="text-muted-foreground">
                        {new Date(transaction.happenedAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {category && (
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          {category?.emoji} {category?.name || 'No category'}
                        </div>
                      </td>
                      <td>{transaction.reason || 'No description'}</td>
                      <td className={`text-right font-medium ${isIncome ? 'text-success' : 'text-destructive'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount / 100, settings.currencySymbol)}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {transactions.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm">Add your first transaction above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}