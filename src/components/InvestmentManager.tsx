import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useTransactions, useSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';

const INVESTMENT_TYPES = [
  { value: 'stocks', label: '📈 Stocks', emoji: '📈' },
  { value: 'gold', label: '🏆 Gold', emoji: '🏆' },
  { value: 'crypto', label: '₿ Cryptocurrency', emoji: '₿' },
  { value: 'bonds', label: '📜 Bonds', emoji: '📜' },
  { value: 'mutual_funds', label: '📊 Mutual Funds', emoji: '📊' },
  { value: 'real_estate', label: '🏠 Real Estate', emoji: '🏠' },
  { value: 'fixed_deposit', label: '🏦 Fixed Deposit', emoji: '🏦' },
  { value: 'other', label: '💼 Other', emoji: '💼' }
];

export function InvestmentManager() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { settings } = useSettings();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Filter investment transactions
  const investments = transactions?.filter(t => 
    t.reason?.includes('Investment:') || t.flow === 'adjustment'
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.type) return;

    try {
      const investmentType = INVESTMENT_TYPES.find(t => t.value === formData.type);
      await addTransaction({
        flow: 'adjustment',
        amount: Math.round(parseFloat(formData.amount) * 100),
        paymentMethod: 'other',
        reason: `Investment: ${investmentType?.label} - ${formData.description}`,
        happenedAt: new Date(formData.date)
      });

      setFormData({
        type: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this investment record?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Error deleting investment:', error);
      }
    }
  };

  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.amount / 100), 0);

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Investment Portfolio</h1>
          <p className="text-muted-foreground">Track your investments across different asset classes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Investments</p>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(totalInvestments, settings.currencySymbol)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Investment Count</p>
                <div className="text-2xl font-bold">
                  {investments.length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Badge className="text-lg">💼</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Asset Classes</p>
                <div className="text-2xl font-bold">
                  {new Set(investments.map(inv => {
                    const reason = inv.reason || '';
                    const match = reason.match(/Investment: ([^-]+)/);
                    return match ? match[1].trim() : 'Other';
                  })).size}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Badge className="text-lg">📊</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Investment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  step="0.01"
                  placeholder="Investment amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Description (e.g., Tesla stocks, 10g gold)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />

                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Investment</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Investments List */}
      <Card>
        <CardHeader>
          <CardTitle>Investment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {investments.map((investment) => {
                  const reason = investment.reason || '';
                  const typeMatch = reason.match(/Investment: ([^-]+)/);
                  const type = typeMatch ? typeMatch[1].trim() : 'Other';
                  const description = reason.includes(' - ') ? reason.split(' - ').slice(1).join(' - ') : reason;
                  
                  return (
                    <tr key={investment.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(investment.happenedAt).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {description || 'No description'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-primary">
                          {formatCurrency(investment.amount / 100, settings.currencySymbol)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(investment.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {investments.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No Investments Yet</h3>
                <p>Start building your portfolio by adding your first investment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}