import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Category, Transaction } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Indian Rupees
export function formatCurrency(amount: number, currencySymbol: string = '₹'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    currencyDisplay: 'symbol',
  }).format(amount).replace('₹', currencySymbol);
}

// Format large numbers with Indian numbering system
export function formatIndianNumber(num: number): string {
  const x = num.toString();
  const lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return lastThree;
}

// Get category class name for styling
export function getCategoryClassName(categoryName: string, type: 'bg' | 'border' | 'text' = 'bg'): string {
  const normalized = categoryName.toLowerCase().replace(/[^a-z]/g, '');
  const classMap: Record<string, string> = {
    food: 'food',
    transport: 'transport',
    bills: 'bills',
    entertainment: 'entertainment',
    shopping: 'shopping',
    health: 'health',
    education: 'education',
    home: 'home',
    miscellaneous: 'misc',
    salary: 'salary',
    gift: 'gift',
    refund: 'refund',
  };
  
  const categoryKey = classMap[normalized] || 'misc';
  
  switch (type) {
    case 'bg':
      return `category-${categoryKey}`;
    case 'border':
      return `category-border-${categoryKey}`;
    case 'text':
      return `text-white`; // All category colors have good contrast with white text
    default:
      return `category-${categoryKey}`;
  }
}

// Generate CSV from transactions
export function exportTransactionsCSV(transactions: Transaction[], categories: Category[]): string {
  const headers = ['flow', 'category', 'amount', 'paymentMethod', 'reason', 'happenedAt'];
  
  const rows = transactions.map(transaction => {
    const category = categories.find(c => c.id === transaction.categoryId);
    return [
      transaction.flow,
      category?.name || '',
      (transaction.amount / 100).toString(), // Convert from paise to rupees
      transaction.paymentMethod,
      transaction.reason || '',
      transaction.happenedAt.toISOString().split('T')[0], // YYYY-MM-DD format
    ];
  });
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

// Generate CSV from categories
export function exportCategoriesCSV(categories: Category[]): string {
  const headers = ['name', 'color', 'emoji', 'kind'];
  
  const rows = categories.map(category => [
    category.name,
    category.color,
    category.emoji || '',
    category.kind,
  ]);
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

// Parse CSV data
export function parseCSV(csvText: string): string[][] {
  const lines = csvText.trim().split('\n');
  return lines.map(line => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        if (line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current);
    return fields;
  });
}

// Generate a download for file content
export function downloadFile(content: string, filename: string, contentType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Format date for display
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'relative':
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    default:
      return d.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric',
        year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
  }
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Get month name
export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}