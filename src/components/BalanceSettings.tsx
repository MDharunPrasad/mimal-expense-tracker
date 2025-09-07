import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Minus, AlertCircle } from 'lucide-react';
import { useAnalytics, useTransactions, useSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';

export function BalanceSettings() {
  const { calculateBalance } = useAnalytics();
  const { addTransaction } = useTransactions();
  const { settings } = useSettings();
  
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const balance = calculateBalance();

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !reason) return;

    try {
      const adjustmentAmount = parseFloat(amount) * 100; // Convert to paise
      const finalAmount = adjustmentType === 'add' ? adjustmentAmount : -adjustmentAmount;
      
      await addTransaction({
        flow: 'adjustment',
        amount: Math.abs(finalAmount),
        paymentMethod: 'other',
        reason: `Balance ${adjustmentType === 'add' ? 'increase' : 'decrease'}: ${reason}`,
        happenedAt: new Date()
      });

      setAmount('');
      setReason('');
    } catch (error) {
      console.error('Error adjusting balance:', error);
    }
  };

  const quickAdjustments = [
    { label: 'Initial Balance Setup', amount: 10000, reason: 'Setting up initial balance' },
    { label: 'Cash Found', amount: 500, reason: 'Found cash in wallet' },
    { label: 'Bank Interest', amount: 250, reason: 'Monthly bank interest' },
    { label: 'Correction', amount: 100, reason: 'Balance correction' },
  ];

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Balance Settings</h1>
        <p className="text-muted-foreground">Adjust your current balance and manage corrections</p>
      </div>

      {/* Current Balance Display */}
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

      {/* Balance Adjustment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Adjust Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdjustment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={adjustmentType} onValueChange={(value: 'add' | 'subtract') => setAdjustmentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-success" />
                      Add Money
                    </div>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-destructive" />
                      Subtract Money
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <Input
                placeholder="Reason for adjustment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              {adjustmentType === 'add' ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add {amount ? formatCurrency(parseFloat(amount), settings.currencySymbol) : 'Amount'}
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 mr-2" />
                  Subtract {amount ? formatCurrency(parseFloat(amount), settings.currencySymbol) : 'Amount'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Adjustments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickAdjustments.map((adjustment, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => {
                  setAmount(adjustment.amount.toString());
                  setReason(adjustment.reason);
                  setAdjustmentType('add');
                }}
              >
                <div className="text-left">
                  <div className="font-medium">{adjustment.label}</div>
                  <div className="text-sm text-muted-foreground">
                    +{formatCurrency(adjustment.amount, settings.currencySymbol)}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Balance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">When to Adjust Balance:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Setting up your initial balance</li>
                <li>• Found untracked cash or money</li>
                <li>• Bank interest or dividends</li>
                <li>• Correcting calculation errors</li>
                <li>• Gifts or unexpected income</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Current Month Summary:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Income:</span>
                  <span className="text-success font-medium">
                    +{formatCurrency(balance.thisMonth.income, settings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expenses:</span>
                  <span className="text-destructive font-medium">
                    -{formatCurrency(balance.thisMonth.expense, settings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Net This Month:</span>
                  <span className={`font-medium ${balance.thisMonth.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {balance.thisMonth.net >= 0 ? '+' : ''}
                    {formatCurrency(balance.thisMonth.net, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}