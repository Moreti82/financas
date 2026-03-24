import { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types/database';
import { CategoryForm } from './CategoryForm';
import { ConfirmDialog } from './ConfirmDialog';

interface CategoryListProps {
  categories: Category[];
  onCategoryUpdated: () => void;
}

export function CategoryList({ categories, onCategoryUpdated }: CategoryListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deleteDialog, setDeleteDialog] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) throw new Error(error.message);
      
      onCategoryUpdated();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Categorias</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-green-700 mb-3">Receitas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog(category)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {incomeCategories.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2">
                  Nenhuma categoria de receita cadastrada
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-red-700 mb-3">Despesas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog(category)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2">
                  Nenhuma categoria de despesa cadastrada
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <CategoryForm
        category={editingCategory}
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={onCategoryUpdated}
      />

      <ConfirmDialog
        isOpen={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteDialog && handleDelete(deleteDialog)}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${deleteDialog?.name}"? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir"
        type="danger"
      />
    </>
  );
}
