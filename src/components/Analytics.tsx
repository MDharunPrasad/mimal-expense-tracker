import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CalendarIcon, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import { useTransactions, useCategories, useSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';
import { useState, useMemo } from 'react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

export function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { settings } = useSettings();

  const months = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  const availableYears = useMemo(() => {
    if (!transactions) return [new Date().getFullYear()];
    const years = [...new Set(transactions.map(t => new Date(t.happenedAt).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [transactions]);

  // Current month data
  const currentMonthData = useMemo(() => {
    if (!transactions || !categories) return [];
    
    const currentMonth = transactions.filter(t => {
      const date = new Date(t.happenedAt);
      return date.getMonth() === selectedMonth && 
             date.getFullYear() === selectedYear && 
             t.flow === 'expense';
    });

    const categoryTotals = currentMonth.reduce((acc, transaction) => {
      const category = categories.find(c => c.id === transaction.categoryId);
      const categoryName = category ? `${category.emoji} ${category.name}` : 'Other';
      acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount / 100);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [transactions, categories, selectedMonth, selectedYear]);

  // Last 6 months comparison
  const monthlyComparison = useMemo(() => {
    if (!transactions) return [];
    
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.happenedAt);
        return tDate.getMonth() === date.getMonth() && 
               tDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.flow === 'income')
        .reduce((sum, t) => sum + (t.amount / 100), 0);
      
      const expenses = monthTransactions
        .filter(t => t.flow === 'expense')
        .reduce((sum, t) => sum + (t.amount / 100), 0);

      last6Months.push({
        month: months[date.getMonth()].substr(0, 3),
        income,
        expenses,
        net: income - expenses
      });
    }

    return last6Months;
  }, [transactions, months]);

  const totalExpenses = currentMonthData.reduce((sum, item) => sum + item.value, 0);

  if (!settings) return null;

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep insights into your spending patterns</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalExpenses, settings.currencySymbol)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Categories Used</p>
                <div className="text-2xl font-bold">
                  {currentMonthData.length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PieChartIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Selected Period</p>
                <div className="text-2xl font-bold">
                  {months[selectedMonth].substr(0, 3)} {selectedYear}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expenses by Category Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {currentMonthData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentMonthData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {currentMonthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value), settings.currencySymbol)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChartIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No expense data for selected period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend Bar Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), settings.currencySymbol)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      {currentMonthData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentMonthData
                    .sort((a, b) => b.value - a.value)
                    .map((item, index) => (
                      <tr key={item.name} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium">
                          {formatCurrency(item.value, settings.currencySymbol)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-muted-foreground">
                          {((item.value / totalExpenses) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}