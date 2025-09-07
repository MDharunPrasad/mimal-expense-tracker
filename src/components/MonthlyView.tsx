import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useAnalytics, useCategories, useSettings } from '@/hooks/useDatabase';
import { formatCurrency, getMonthName } from '@/lib/utils';

export function MonthlyView() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { getCategorySpending, calculateBalance } = useAnalytics();
  const { categories } = useCategories();
  const { settings } = useSettings();

  const monthlyData = useMemo(() => {
    const spending = getCategorySpending(selectedMonth);
    const balance = calculateBalance();
    
    // Get previous month data for comparison
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevSpending = getCategorySpending(prevMonth);
    
    const thisMonthTotal = spending.reduce((sum, cat) => sum + cat.amount, 0);
    const prevMonthTotal = prevSpending.reduce((sum, cat) => sum + cat.amount, 0);
    const changePercent = prevMonthTotal > 0 ? ((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;
    
    return {
      spending,
      thisMonthTotal,
      prevMonthTotal,
      changePercent,
      balance
    };
  }, [selectedMonth, getCategorySpending, calculateBalance]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monthly Analysis</h1>
          <p className="text-muted-foreground">Detailed breakdown of your spending by month</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-[180px] justify-center">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{getMonthName(selectedMonth)}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
            disabled={selectedMonth >= new Date()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(monthlyData.thisMonthTotal, settings.currencySymbol)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">vs Previous Month</p>
                <div className={`text-2xl font-bold ${monthlyData.changePercent >= 0 ? 'text-destructive' : 'text-success'}`}>
                  {monthlyData.changePercent >= 0 ? '+' : ''}{monthlyData.changePercent.toFixed(1)}%
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${monthlyData.changePercent >= 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                {monthlyData.changePercent >= 0 ? 
                  <TrendingUp className="w-6 h-6 text-destructive" /> : 
                  <TrendingDown className="w-6 h-6 text-success" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Categories Used</p>
                <div className="text-2xl font-bold">
                  {monthlyData.spending.length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.spending.length > 0 ? (
            <div className="space-y-4">
              {monthlyData.spending.map((item, index) => (
                <div key={item.categoryId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.categoryColor }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.categoryEmoji}</span>
                        <span className="font-medium">{item.categoryName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.transactionCount} transaction{item.transactionCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">
                      {formatCurrency(item.amount, settings.currencySymbol)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No Data for This Month</h3>
              <p>No expenses recorded for {getMonthName(selectedMonth)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">This Month</h4>
              <div className="text-2xl font-bold text-destructive mb-2">
                {formatCurrency(monthlyData.thisMonthTotal, settings.currencySymbol)}
              </div>
              <p className="text-sm text-muted-foreground">
                {getMonthName(selectedMonth)}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Previous Month</h4>
              <div className="text-2xl font-bold text-muted-foreground mb-2">
                {formatCurrency(monthlyData.prevMonthTotal, settings.currencySymbol)}
              </div>
              <p className="text-sm text-muted-foreground">
                {getMonthName(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}