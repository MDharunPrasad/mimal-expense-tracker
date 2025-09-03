import { useState } from 'react';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { TransactionsList } from './TransactionsList';
import { CategoriesManager } from './CategoriesManager';
import { Analytics } from './Analytics';
import { Settings } from './Settings';
import { useDatabase } from '@/hooks/useDatabase';
import { Loader2 } from 'lucide-react';

export function ExpenseApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isInitialized, isLoading } = useDatabase();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Initializing ExpenseTracker</h2>
            <p className="text-sm text-muted-foreground">Setting up your personal finance manager...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive">
            <h2 className="text-lg font-semibold">Initialization Failed</h2>
            <p className="text-sm text-muted-foreground">
              Unable to initialize the local database. Please refresh the page and try again.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'transactions':
        return <TransactionsList />;
      case 'categories':
        return <CategoriesManager />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}