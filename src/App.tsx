import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TransactionsManager } from "@/components/TransactionsManager";
import { CategoriesManager } from "@/components/CategoriesManager";
import { InvestmentManager } from "@/components/InvestmentManager";
import { Analytics } from "@/components/Analytics";
import { Settings } from "@/components/Settings";
import { MonthlyView } from "@/components/MonthlyView";
import { BalanceSettings } from "@/components/BalanceSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/transactions" element={<TransactionsManager />} />
          <Route path="/categories" element={<CategoriesManager />} />
          <Route path="/investments" element={<InvestmentManager />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/monthly" element={<MonthlyView />} />
          <Route path="/balance" element={<BalanceSettings />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
