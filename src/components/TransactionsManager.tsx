import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Trash2, Edit3, Search } from 'lucide-react';
import { useTransactions, useCategories, useSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';

export function TransactionsManager() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactions();
  const { categories } = useCategories();
  const { settings } = useSettings();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false });
  const [editData, setEditData] = useState({
    amount: '',
    reason: '',
    categoryId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = !searchTerm || 
      (transaction.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       categories?.find(c => c.id === transaction.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || transaction.categoryId === filterCategory;
    const matchesType = filterType === 'all' || transaction.flow === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditData({
      amount: (transaction.amount / 100).toString(),
      reason: transaction.reason || '',
      categoryId: transaction.categoryId || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editData.amount) return;
    
    try {
      await updateTransaction(editingId, {
        amount: Math.round(parseFloat(editData.amount) * 100),
        reason: editData.reason,
        categoryId: editData.categoryId
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    if (deleteDialog.id) {
      try {
        await deleteTransaction(deleteDialog.id);
        setDeleteDialog({ open: false });
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Transactions</h1>
        <p className="text-muted-foreground mt-1">Edit or delete your transactions</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterType('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Description</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.map((transaction) => {
                  const category = categories?.find(c => c.id === transaction.categoryId);
                  const isIncome = transaction.flow === 'income';
                  const isEditing = editingId === transaction.id;
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(transaction.happenedAt).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <Select value={editData.categoryId} onValueChange={(value) => setEditData({...editData, categoryId: value})}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.filter(c => 
                                transaction.flow === 'income' ? 
                                (c.kind === 'income' || c.kind === 'both') : 
                                (c.kind === 'expense' || c.kind === 'both')
                              ).map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.emoji} {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {category && (
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            {category?.emoji} {category?.name || 'No category'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <Input
                            value={editData.reason}
                            onChange={(e) => setEditData({...editData, reason: e.target.value})}
                            className="w-full"
                          />
                        ) : (
                          transaction.reason || 'No description'
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editData.amount}
                            onChange={(e) => setEditData({...editData, amount: e.target.value})}
                            className="w-24 ml-auto"
                          />
                        ) : (
                          <span className={`font-medium ${isIncome ? 'text-success' : 'text-destructive'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount / 100, settings.currencySymbol)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-muted"
                                onClick={() => handleEdit(transaction)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(transaction.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredTransactions.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <p className="font-medium">No transactions found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}