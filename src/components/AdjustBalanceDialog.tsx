import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const adjustmentSchema = z.object({
  type: z.enum(['add', 'subtract']),
  amount: z.string().min(1, 'Amount is required'),
  reason: z.string().min(1, 'Reason is required'),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface AdjustBalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => Promise<void>;
  currencySymbol: string;
}

export function AdjustBalanceDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currencySymbol 
}: AdjustBalanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: 'add',
      amount: '',
      reason: '',
    },
  });

  const watchedType = form.watch('type');
  const watchedAmount = form.watch('amount');

  const handleSubmit = async (data: AdjustmentFormData) => {
    try {
      setIsSubmitting(true);
      const amount = parseFloat(data.amount);
      const adjustedAmount = data.type === 'add' ? amount : -amount;
      
      await onSubmit(adjustedAmount, data.reason);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to adjust balance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const previewAmount = watchedAmount ? parseFloat(watchedAmount) : 0;
  const adjustedAmount = watchedType === 'add' ? previewAmount : -previewAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Adjust Balance
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Adjustment Type</Label>
            <Select 
              value={form.watch('type')} 
              onValueChange={(value) => form.setValue('type', value as 'add' | 'subtract')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-success" />
                    <span>Add to Balance</span>
                    <Badge variant="outline" className="text-success border-success">
                      Income
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="subtract">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-destructive" />
                    <span>Subtract from Balance</span>
                    <Badge variant="outline" className="text-destructive border-destructive">
                      Expense
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {watchedType === 'add' 
                ? 'Use this to add money you received from sources not tracked as regular income' 
                : 'Use this to account for expenses or money removed from your tracked balance'
              }
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currencySymbol})</Label>
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

          {/* Preview */}
          {previewAmount > 0 && (
            <div className={`p-3 rounded-lg border ${
              watchedType === 'add' 
                ? 'bg-success/10 border-success/20' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Balance Change:</span>
                <span className={`font-bold ${
                  watchedType === 'add' ? 'text-success' : 'text-destructive'
                }`}>
                  {watchedType === 'add' ? '+' : ''}
                  {formatCurrency(adjustedAmount, currencySymbol)}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you're adjusting the balance..."
              rows={3}
              {...form.register('reason')}
            />
            {form.formState.errors.reason && (
              <p className="text-xs text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This reason will be saved with the adjustment for your records
            </p>
          </div>

          {/* Common Reasons */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Reasons:</Label>
            <div className="flex flex-wrap gap-1">
              {[
                'Cash found in wallet',
                'Bank interest credited',
                'Correction for error',
                'Cash gift received',
                'Lost cash',
                'Forgot to track expense',
              ].map((reason) => (
                <Button
                  key={reason}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => form.setValue('reason', reason)}
                >
                  {reason}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Adjusting...' : 'Adjust Balance'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}