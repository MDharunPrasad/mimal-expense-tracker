import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Plus, Minus, Edit3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BalanceInfo } from '@/types';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balanceInfo: BalanceInfo;
  currencySymbol: string;
  onAdjustBalance: () => void;
}

export function BalanceCard({ balanceInfo, currencySymbol, onAdjustBalance }: BalanceCardProps) {
  const { currentBalance, thisMonth } = balanceInfo;
  const isPositiveBalance = currentBalance >= 0;
  const isPositiveNet = thisMonth.net >= 0;

  return (
    <Card className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      
      <CardContent className="relative p-6">
        <div className="space-y-6">
          {/* Current Balance */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Current Balance</p>
            <div className="flex items-center justify-center gap-2">
              <h2 className={cn(
                "text-3xl md:text-4xl font-bold transition-smooth",
                isPositiveBalance ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(Math.abs(currentBalance), currencySymbol)}
              </h2>
              {!isPositiveBalance && (
                <Badge variant="destructive" className="text-xs">
                  Deficit
                </Badge>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onAdjustBalance}
              className="gap-2"
            >
              <Edit3 className="w-3 h-3" />
              Adjust Balance
            </Button>
          </div>

          {/* This Month Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            {/* Income */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <p className="text-xs text-muted-foreground">Income</p>
              </div>
              <p className="font-semibold text-success text-sm">
                {formatCurrency(thisMonth.income, currencySymbol)}
              </p>
            </div>

            {/* Expense */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className="w-3 h-3 text-destructive" />
                <p className="text-xs text-muted-foreground">Expense</p>
              </div>
              <p className="font-semibold text-destructive text-sm">
                {formatCurrency(thisMonth.expense, currencySymbol)}
              </p>
            </div>

            {/* Net */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                {isPositiveNet ? (
                  <Plus className="w-3 h-3 text-success" />
                ) : (
                  <Minus className="w-3 h-3 text-destructive" />
                )}
                <p className="text-xs text-muted-foreground">Net</p>
              </div>
              <p className={cn(
                "font-semibold text-sm",
                isPositiveNet ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(Math.abs(thisMonth.net), currencySymbol)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}