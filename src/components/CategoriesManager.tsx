import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryForm } from './CategoryForm';
import { useCategories } from '@/hooks/useDatabase';
import { Plus, Edit, Trash2, FolderOpen, Palette } from 'lucide-react';
import { Category } from '@/types';
import { getCategoryClassName } from '@/lib/utils';

export function CategoriesManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  
  const { categories, deleteCategory, isLoading } = useCategories();

  const expenseCategories = categories.filter(c => c.kind === 'expense' || c.kind === 'both');
  const incomeCategories = categories.filter(c => c.kind === 'income' || c.kind === 'both');

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      await deleteCategory(category.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card className="hover:shadow-md transition-smooth">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {category.emoji} {category.name}
                </span>
                <Badge variant={category.kind === 'expense' ? 'destructive' : category.kind === 'income' ? 'default' : 'secondary'}>
                  {category.kind}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Color: {category.color.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEdit(category)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(category)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your transactions with custom categories
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full" />
                Expense Categories
                <Badge variant="outline">{expenseCategories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenseCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No expense categories</p>
                  <p className="text-sm">Add some to organize your expenses</p>
                </div>
              ) : (
                expenseCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Income Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full" />
                Income Categories
                <Badge variant="outline">{incomeCategories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incomeCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No income categories</p>
                  <p className="text-sm">Add some to organize your income sources</p>
                </div>
              ) : (
                incomeCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Category Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Keep categories broad but meaningful</li>
                <li>• Use distinct colors for easy recognition</li>
                <li>• Add emojis to make categories more visual</li>
                <li>• Create "both" type categories for flexible use</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Examples:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 🍔 Food & Dining</li>
                <li>• 🚗 Transportation</li>
                <li>• 💡 Utilities & Bills</li>
                <li>• 💼 Salary & Income</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCancel}
          existingCategories={categories}
        />
      )}
    </div>
  );
}