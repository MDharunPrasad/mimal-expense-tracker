import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Deep insights into your spending patterns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
            <p>Detailed spending analysis, trends, and forecasting features are coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}