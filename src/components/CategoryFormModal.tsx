import { useState } from 'react';
import { Plus, Home, Car, Heart, Gamepad2, Utensils, ShoppingCart, Briefcase, Laptop, TrendingUp, Gift, Wallet } from 'lucide-react';
import type { Category } from '../types/database';
import { supabase } from '../lib/supabase';

interface CategoryFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editingCategory?: Category;
  currentCount: number;
}

const ICON_OPTIONS = [
  { name: 'home', icon: Home, label: 'Casa' },
  { name: 'car', icon: Car, label: 'Carro' },
  { name: 'heart', icon: Heart, label: 'Saúde' },
  { name: 'gamepad-2', icon: Gamepad2, label: 'Lazer' },
  { name: 'utensils', icon: Utensils, label: 'Alimentação' },
  { name: 'shopping-cart', icon: ShoppingCart, label: 'Compras' },
  { name: 'briefcase', icon: Briefcase, label: 'Trabalho' },
  { name: 'laptop', icon: Laptop, label: 'Tecnologia' },
  { name: 'trending-up', icon: TrendingUp, label: 'Investimentos' },
  { name: 'gift', icon: Gift, label: 'Presentes' },
  { name: 'wallet', icon: Wallet, label: 'Outros' }
];

import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '../hooks/useToast';

export function CategoryFormModal({ 
  onClose, 
  onSuccess, 
  editingCategory,
  currentCount
}: CategoryFormModalProps) {
  const { canAddCategory, limits } = useSubscription();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: editingCategory?.name || '',
    type: editingCategory?.type || 'expense',
    icon: editingCategory?.icon || 'wallet'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        // Update existing category
        await supabase
          .from('categories')
          .update({
            name: formData.name,
            type: formData.type,
            icon: formData.icon
          })
          .eq('id', editingCategory.id);
      } else {
        // Check limits
        if (!canAddCategory(currentCount)) {
          toast.error(`Limite de categorias atingido!`, `Seu plano atual permite apenas ${limits.categories} categorias. Faça um upgrade para o Pro para criar categorias ilimitadas!`);
          setLoading(false);
          return;
        }

        // Create new category
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              name: formData.name,
              type: formData.type,
              icon: formData.icon
            });
        }
      }

      toast.success(
        editingCategory ? 'Categoria atualizada!' : 'Categoria criada!', 
        `A categoria "${formData.name}" foi salva com sucesso.`
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tipo de Categoria
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.type === 'expense'
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
            }`}
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.type === 'income'
                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
            }`}
          >
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Receita</span>
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome da Categoria
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Ex: Supermercado, Transporte, etc."
          required
        />
      </div>

      {/* Icon Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Ícone
        </label>
        <div className="grid grid-cols-6 gap-2">
          {ICON_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.name}
                type="button"
                onClick={() => setFormData({ ...formData, icon: option.name })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.icon === option.name
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                }`}
                title={option.label}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Preview
        </label>
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
            {(() => {
              const iconOption = ICON_OPTIONS.find(opt => opt.name === formData.icon);
              const Icon = iconOption?.icon || Wallet;
              return <Icon className="w-5 h-5" />;
            })()}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {formData.name || 'Nome da categoria'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formData.type === 'income' ? 'Receita' : 'Despesa'}
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Salvando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {editingCategory ? 'Atualizar' : 'Criar'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
