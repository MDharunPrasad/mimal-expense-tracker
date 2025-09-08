import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryForm } from './CategoryForm';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useCategories } from '@/hooks/useDatabase';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Category } from '@/types';

export function CategoriesManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category?: Category }>({ open: false });
  
  const { categories, deleteCategory, isLoading } = useCategories();

  const expenseCategories = categories.filter(c => c.kind === 'expense' || c.kind === 'both');
  const incomeCategories = categories.filter(c => c.kind === 'income' || c.kind === 'both');

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (category: Category) => {
    setDeleteDialog({ open: true, category });
  };

  const confirmDelete = async () => {
    if (deleteDialog.category) {
      await deleteCategory(deleteDialog.category.id);
      setDeleteDialog({ open: false });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card className="hover:shadow-sm transition-smooth border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-lg">{category.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">
                  {category.name}
                </span>
                <Badge 
                  variant={category.kind === 'expense' ? 'destructive' : category.kind === 'income' ? 'default' : 'secondary'}
                  className="text-xs px-2 py-0.5"
                >
                  {category.kind}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={() => handleEdit(category)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(category)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your transactions with custom categories
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense Categories */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-4 h-4 bg-destructive rounded-full" />
                Expense Categories
                <Badge variant="outline" className="ml-auto">{expenseCategories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenseCategories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">No expense categories</p>
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-4 h-4 bg-success rounded-full" />
                Income Categories
                <Badge variant="outline" className="ml-auto">{incomeCategories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incomeCategories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">No income categories</p>
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

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCancel}
          existingCategories={categories}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteDialog.category?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}