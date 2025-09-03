import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { CategorySpend, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface MonthlyChartProps {
  data: CategorySpend[];
  categories: Category[];
  currencySymbol: string;
}

type ChartType = 'bar' | 'pie';

export function MonthlyChart({ data, categories, currencySymbol }: MonthlyChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const chartData = data.slice(0, 10); // Top 10 categories

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No data to display</p>
          <p className="text-sm">Add some transactions to see insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <div className="flex gap-2">
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('bar')}
          className="gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Bar Chart
        </Button>
        <Button
          variant={chartType === 'pie' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('pie')}
          className="gap-2"
        >
          <PieChartIcon className="w-4 h-4" />
          Pie Chart
        </Button>
      </div>

      {/* Chart Container */}
      <div className="h-64 w-full">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="categoryName"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value, currencySymbol), 'Amount']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.categoryColor}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value, currencySymbol), 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
        {chartData.slice(0, 8).map((item, index) => (
          <div key={item.categoryId} className="flex items-center gap-2 min-w-0">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.categoryColor }}
            />
            <span className="truncate" title={item.categoryName}>
              {item.categoryEmoji} {item.categoryName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}