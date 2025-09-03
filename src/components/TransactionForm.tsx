import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Save, Plus } from 'lucide-react';
import { Transaction, Category, PaymentMethod, TransactionFlow } from '@/types';
import { getCategoryClassName } from '@/lib/utils';

const transactionSchema = z.object({
  flow: z.enum(['income', 'expense', 'adjustment']),
  categoryId: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'other']),
  reason: z.string().optional(),
  happenedAt: z.string().min(1, 'Date is required'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  categories: Category[];
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  defaultPaymentMethod: PaymentMethod;
}

const paymentMethodOptions = [
  { value: 'cash', label: '💵 Cash' },
  { value: 'upi', label: '📱 UPI' },
  { value: 'card', label: '💳 Card' },
  { value: 'other', label: '🔄 Other' },
] as const;

const flowOptions = [
  { value: 'expense', label: '📤 Expense', color: 'destructive' },
  { value: 'income', label: '📥 Income', color: 'success' },
  { value: 'adjustment', label: '⚖️ Adjustment', color: 'secondary' },
] as const;

export function TransactionForm({ 
  transaction, 
  categories, 
  onSubmit, 
  onCancel, 
  defaultPaymentMethod 
}: TransactionFormProps) {
  const isEditing = !!transaction;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      flow: transaction?.flow || 'expense',
      categoryId: transaction?.categoryId || '',
      amount: transaction ? (transaction.amount / 100).toString() : '',
      paymentMethod: transaction?.paymentMethod || defaultPaymentMethod,
      reason: transaction?.reason || '',
      happenedAt: transaction 
        ? new Date(transaction.happenedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
  });

  const watchedFlow = form.watch('flow');
  const watchedCategoryId = form.watch('categoryId');

  // Filter categories based on selected flow
  const availableCategories = categories.filter(category => {
    if (watchedFlow === 'adjustment') return false;
    return category.kind === watchedFlow || category.kind === 'both';
  });

  const selectedCategory = watchedCategoryId 
    ? categories.find(c => c.id === watchedCategoryId)
    : null;

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      const transactionData = {
        flow: data.flow as TransactionFlow,
        categoryId: data.flow === 'adjustment' ? undefined : data.categoryId,
        amount: Math.round(parseFloat(data.amount) * 100), // Convert to paise
        paymentMethod: data.paymentMethod as PaymentMethod,
        reason: data.reason,
        happenedAt: new Date(data.happenedAt),
      };

      await onSubmit(transactionData);
      form.reset();
    } catch (error) {
      console.error('Failed to submit transaction:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="flow">Type</Label>
            <Select value={form.watch('flow')} onValueChange={(value) => {
              form.setValue('flow', value as TransactionFlow);
              if (value === 'adjustment') {
                form.setValue('categoryId', '');
              }
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flowOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <Badge variant={option.color as any} className="text-xs">
                        {option.value}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          {watchedFlow !== 'adjustment' && (
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select 
                value={form.watch('categoryId')} 
                onValueChange={(value) => form.setValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.emoji} {category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span>Selected: {selectedCategory.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register('amount')}
              className="text-lg font-medium"
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select 
              value={form.watch('paymentMethod')} 
              onValueChange={(value) => form.setValue('paymentMethod', value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="happenedAt">Date</Label>
            <Input
              id="happenedAt"
              type="date"
              {...form.register('happenedAt')}
            />
            {form.formState.errors.happenedAt && (
              <p className="text-xs text-destructive">
                {form.formState.errors.happenedAt.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Notes (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Add a note about this transaction..."
              rows={2}
              {...form.register('reason')}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={form.formState.isSubmitting}
            >
              <Save className="w-4 h-4" />
              {form.formState.isSubmitting 
                ? 'Saving...' 
                : isEditing 
                  ? 'Update Transaction' 
                  : 'Add Transaction'
              }
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}