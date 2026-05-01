import { useState } from 'react';
import { Plus, Home, Car, Heart, Gamepad2, Utensils, ShoppingCart, Briefcase, Laptop, TrendingUp, Gift, Wallet, TrendingDown } from 'lucide-react';
import type { Category } from '../types/database';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '../hooks/useToast';

interface CategoryFormModalProps {
  onClose: () => void;
  onSave: () => void;
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

export function CategoryFormModal({ 
  onClose, 
  onSave, 
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
    e.stopPropagation();
    
    setLoading(true);

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            type: formData.type,
            icon: formData.icon
          })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        if (!canAddCategory(currentCount)) {
          toast.error(`Limite atingido!`, `Upgrade para Pro para categorias ilimitadas.`);
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              name: formData.name,
              type: formData.type,
              icon: formData.icon
            });
          if (error) throw error;
        }
      }

      toast.success(
        editingCategory ? 'Categoria atualizada!' : 'Categoria criada!', 
        `"${formData.name}" foi salva.`
      );
      onSave();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao salvar', error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-3">Tipo</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense' })}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${
              formData.type === 'expense'
                ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                : 'border-slate-100 bg-white text-slate-400 dark:bg-gray-800 dark:border-gray-700'
            }`}
          >
            <TrendingDown className="w-6 h-6 mb-1" />
            <span className="text-xs font-black uppercase">Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income' })}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${
              formData.type === 'income'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'border-slate-100 bg-white text-slate-400 dark:bg-gray-800 dark:border-gray-700'
            }`}
          >
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-xs font-black uppercase">Receita</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Nome</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-bold"
          placeholder="Ex: Supermercado"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-3">Ícone</label>
        <div className="grid grid-cols-6 gap-2">
          {ICON_OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.name}
                type="button"
                onClick={() => setFormData({ ...formData, icon: o.name })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.icon === o.name
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                    : 'border-slate-100 bg-white text-slate-400 dark:bg-gray-800 dark:border-gray-700'
                }`}
                title={o.label}
              >
                <Icon className="w-4 h-4 mx-auto" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-gray-800">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-4 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-800 font-bold transition-all">Cancelar</button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 font-black transition-all flex items-center justify-center gap-2">{loading ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}</button>
      </div>
    </form>
  );
}
