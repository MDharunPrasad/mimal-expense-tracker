import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TransactionForm } from './TransactionForm';
import { useTransactions, useCategories, useSettings } from '@/hooks/useDatabase';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ArrowUpDown,
  Calendar,
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatDate, getCategoryClassName } from '@/lib/utils';
import { Transaction } from '@/types';

export function TransactionsList() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFlow, setSelectedFlow] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const { categories } = useCategories();
  const { settings } = useSettings();
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    isLoading 
  } = useTransactions();

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      // Search in reason/notes
      if (searchQuery && !transaction.reason?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'all' && transaction.categoryId !== selectedCategory) {
        return false;
      }

      // Filter by flow type
      if (selectedFlow !== 'all' && transaction.flow !== selectedFlow) {
        return false;
      }

      // Filter by payment method
      if (selectedPaymentMethod !== 'all' && transaction.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      return true;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

    return filtered;
  }, [transactions, searchQuery, selectedCategory, selectedFlow, selectedPaymentMethod, sortBy]);

  const handleSubmit = async (transactionData: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(transaction.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage all your financial transactions
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.emoji} {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Flow Filter */}
            <Select value={selectedFlow} onValueChange={setSelectedFlow}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">📥 Income</SelectItem>
                <SelectItem value="expense">📤 Expense</SelectItem>
                <SelectItem value="adjustment">⚖️ Adjustment</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="upi">📱 UPI</SelectItem>
                <SelectItem value="card">💳 Card</SelectItem>
                <SelectItem value="other">🔄 Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: 'date' | 'amount') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Sort by Date
                  </div>
                </SelectItem>
                <SelectItem value="amount">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Sort by Amount
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <span>Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions</span>
            {(searchQuery || selectedCategory !== 'all' || selectedFlow !== 'all' || selectedPaymentMethod !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedFlow('all');
                  setSelectedPaymentMethod('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading transactions...</p>
            </div>
          ) : filteredAndSortedTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No transactions found</p>
              <p className="text-sm">
                {transactions.length === 0 
                  ? "Add your first transaction to get started" 
                  : "Try adjusting your filters"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAndSortedTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const isIncome = transaction.flow === 'income';
                const isAdjustment = transaction.flow === 'adjustment';
                
                return (
                  <div 
                    key={transaction.id} 
                    className={`p-4 hover:bg-accent/50 transition-smooth ${
                      category ? getCategoryClassName(category.name, 'border') : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Category Color & Icon */}
                        {category ? (
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-muted flex-shrink-0" />
                        )}

                        {/* Transaction Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">
                              {transaction.reason || 'No description'}
                            </p>
                            <Badge 
                              variant={isIncome ? 'default' : isAdjustment ? 'secondary' : 'destructive'}
                              className="flex-shrink-0 text-xs"
                            >
                              {transaction.flow}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {category ? `${category.emoji} ${category.name}` : 'No category'}
                            </span>
                            <span>{formatDate(transaction.happenedAt, 'relative')}</span>
                            <span>
                              {{
                                cash: '💵 Cash',
                                upi: '📱 UPI',
                                card: '💳 Card',
                                other: '🔄 Other'
                              }[transaction.paymentMethod]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className={`font-semibold ${
                            isIncome ? 'text-success' : isAdjustment ? 'text-muted-foreground' : 'text-destructive'
                          }`}>
                            {isIncome ? '+' : isAdjustment ? '±' : '-'}
                            {formatCurrency(transaction.amount / 100, settings.currencySymbol)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.happenedAt)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(transaction)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <TransactionForm
            transaction={editingTransaction}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            defaultPaymentMethod={settings.defaultPaymentMethod}
          />
        </div>
      )}
    </div>
  );
}