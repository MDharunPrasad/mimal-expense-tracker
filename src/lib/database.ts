// IndexedDB abstraction for expense tracker
import { Category, Transaction, Settings, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/types';

const DB_NAME = 'ExpenseTracker';
const DB_VERSION = 1;

class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoryStore.createIndex('name', 'name', { unique: true });
          categoryStore.createIndex('kind', 'kind');
        }

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('flow', 'flow');
          transactionStore.createIndex('categoryId', 'categoryId');
          transactionStore.createIndex('happenedAt', 'happenedAt');
          transactionStore.createIndex('paymentMethod', 'paymentMethod');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    if (!this.db) throw new Error('Database not initialized');

    const newCategory: Category = {
      ...category,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.add(newCategory);

      request.onsuccess = () => resolve(newCategory);
      request.onerror = () => reject(request.error);
    });
  }

  async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const category = getRequest.result;
        if (!category) {
          reject(new Error('Category not found'));
          return;
        }

        const updatedCategory: Category = {
          ...category,
          ...updates,
          updatedAt: new Date(),
        };

        const putRequest = store.put(updatedCategory);
        putRequest.onsuccess = () => resolve(updatedCategory);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Transactions
  async getTransactions(filters?: {
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
    flow?: string;
    paymentMethod?: string;
  }): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;

        // Apply filters
        if (filters) {
          if (filters.startDate) {
            results = results.filter(t => new Date(t.happenedAt) >= filters.startDate!);
          }
          if (filters.endDate) {
            results = results.filter(t => new Date(t.happenedAt) <= filters.endDate!);
          }
          if (filters.categoryId) {
            results = results.filter(t => t.categoryId === filters.categoryId);
          }
          if (filters.flow) {
            results = results.filter(t => t.flow === filters.flow);
          }
          if (filters.paymentMethod) {
            results = results.filter(t => t.paymentMethod === filters.paymentMethod);
          }
        }

        // Sort by date (newest first)
        results.sort((a, b) => new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime());
        
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    if (!this.db) throw new Error('Database not initialized');

    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const dbTransaction = this.db!.transaction(['transactions'], 'readwrite');
      const store = dbTransaction.objectStore('transactions');
      const request = store.add(newTransaction);

      request.onsuccess = () => resolve(newTransaction);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existingTransaction = getRequest.result;
        if (!existingTransaction) {
          reject(new Error('Transaction not found'));
          return;
        }

        const updatedTransaction: Transaction = {
          ...existingTransaction,
          ...updates,
          updatedAt: new Date(),
        };

        const putRequest = store.put(updatedTransaction);
        putRequest.onsuccess = () => resolve(updatedTransaction);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Settings
  async getSettings(): Promise<Settings> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('default');

      request.onsuccess = () => {
        const settings = request.result;
        if (settings) {
          resolve(settings);
        } else {
          // Create default settings
          const defaultSettings: Settings = {
            ...DEFAULT_SETTINGS,
            id: 'default',
          };
          this.updateSettings(defaultSettings).then(resolve).catch(reject);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put(settings);

      request.onsuccess = () => resolve(settings);
      request.onerror = () => reject(request.error);
    });
  }

  // Seed data
  async seedData(): Promise<void> {
    const categories = await this.getCategories();
    if (categories.length === 0) {
      // Seed default categories
      for (const category of DEFAULT_CATEGORIES) {
        await this.addCategory(category);
      }

      // Add some sample transactions
      const seededCategories = await this.getCategories();
      const foodCategory = seededCategories.find(c => c.name === 'Food');
      const salaryCategory = seededCategories.find(c => c.name === 'Salary');
      const transportCategory = seededCategories.find(c => c.name === 'Transport');

      if (foodCategory && salaryCategory && transportCategory) {
        const sampleTransactions = [
          {
            flow: 'income' as const,
            categoryId: salaryCategory.id,
            amount: 4500000, // ₹45,000 in paise
            paymentMethod: 'upi' as const,
            reason: 'Monthly salary',
            happenedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          },
          {
            flow: 'expense' as const,
            categoryId: foodCategory.id,
            amount: 25000, // ₹250 in paise
            paymentMethod: 'upi' as const,
            reason: 'Lunch with friends',
            happenedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
          {
            flow: 'expense' as const,
            categoryId: transportCategory.id,
            amount: 6000, // ₹60 in paise
            paymentMethod: 'cash' as const,
            reason: 'Auto to market',
            happenedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          },
        ];

        for (const transaction of sampleTransactions) {
          await this.addTransaction(transaction);
        }
      }
    }
  }
}

export const database = new Database();