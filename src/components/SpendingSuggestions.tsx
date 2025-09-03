import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, Target, Trophy } from 'lucide-react';
import { CategorySpend, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SpendingSuggestionsProps {
  categorySpending: CategorySpend[];
  categories: Category[];
  currencySymbol: string;
}

export function SpendingSuggestions({ categorySpending, categories, currencySymbol }: SpendingSuggestionsProps) {
  // Filter only expense categories and get top 10
  const expenseSpending = categorySpending
    .filter(spend => {
      const category = categories.find(c => c.id === spend.categoryId);
      return category?.kind === 'expense' || category?.kind === 'both';
    })
    .slice(0, 10);

  const totalExpense = expenseSpending.reduce((sum, item) => sum + item.amount, 0);

  if (expenseSpending.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No expense data available</p>
            <p className="text-sm">Add some expense transactions to see insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Top Spending Categories
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Where your money is going this month
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenseSpending.map((item, index) => {
            const isTopSpender = index < 3;
            const isHighSpender = item.percentage > 20;
            
            return (
              <div 
                key={item.categoryId} 
                className="space-y-2 p-3 rounded-lg border border-border/50 hover:border-border transition-smooth"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Ranking Badge */}
                    {isTopSpender && (
                      <Badge 
                        variant={index === 0 ? 'default' : 'secondary'} 
                        className="flex-shrink-0"
                      >
                        {index === 0 && <Trophy className="w-3 h-3 mr-1" />}
                        #{index + 1}
                      </Badge>
                    )}
                    
                    {/* Category Info */}
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.categoryColor }}
                    />
                    <span className="font-medium truncate">
                      {item.categoryEmoji} {item.categoryName}
                    </span>
                    
                    {/* High Spending Warning */}
                    {isHighSpender && (
                      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold">
                      {formatCurrency(item.amount, currencySymbol)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}% of expenses
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <Progress 
                    value={item.percentage} 
                    className="h-2"
                    style={{
                      '--progress-background': item.categoryColor,
                    } as any}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.transactionCount} transaction{item.transactionCount !== 1 ? 's' : ''}</span>
                    <span>{formatCurrency(item.amount / item.transactionCount, currencySymbol)} avg</span>
                  </div>
                </div>

                {/* Insights */}
                {isHighSpender && (
                  <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 rounded px-2 py-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>High spending alert - Consider reviewing this category</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary */}
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Monthly Expenses:</span>
              <span className="font-semibold text-lg">
                {formatCurrency(totalExpense, currencySymbol)}
              </span>
            </div>
            {expenseSpending.length > 5 && (
              <p className="text-xs text-muted-foreground mt-1">
                Showing top {Math.min(10, expenseSpending.length)} categories
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}