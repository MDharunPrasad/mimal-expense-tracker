import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Palette } from 'lucide-react';
import { Category, CategoryKind } from '@/types';
import { useCategories } from '@/hooks/useDatabase';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Color is required'),
  emoji: z.string().optional(),
  kind: z.enum(['expense', 'income', 'both']),
});

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
  existingCategories: Category[];
}

const colorPresets = [
  '#FB923C', '#22C55E', '#A855F7', '#EF4444', '#EC4899', 
  '#10B981', '#3B82F6', '#F59E0B', '#6B7280', '#16A34A'
];

export function CategoryForm({ category, onClose, existingCategories }: CategoryFormProps) {
  const { addCategory, updateCategory } = useCategories();
  const isEditing = !!category;

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      color: category?.color || colorPresets[0],
      emoji: category?.emoji || '',
      kind: category?.kind || 'expense',
    },
  });

  const handleSubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      if (isEditing) {
        await updateCategory(category.id, data);
      } else {
        await addCategory(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...form.register('name')} placeholder="Category name" />
          </div>
          
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mb-2">
              {colorPresets.map(color => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: color }}
                  onClick={() => form.setValue('color', color)}
                />
              ))}
            </div>
            <Input {...form.register('color')} type="color" />
          </div>

          <div>
            <Label>Emoji (Optional)</Label>
            <Input {...form.register('emoji')} placeholder="🍔" maxLength={2} />
          </div>

          <div>
            <Label>Type</Label>
            <Select value={form.watch('kind')} onValueChange={(value: CategoryKind) => form.setValue('kind', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense Only</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}