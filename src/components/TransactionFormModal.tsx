import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import type { Category, TransactionWithCategory } from '../types/database';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '../hooks/useToast';

interface TransactionFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  editingTransaction?: TransactionWithCategory;
  currentCount: number;
}

export function TransactionFormModal({ 
  onClose, 
  onSuccess, 
  categories, 
  editingTransaction,
  currentCount
}: TransactionFormModalProps) {
  const { canAddTransaction, limits } = useSubscription();
  const toast = useToast();
  const [formData, setFormData] = useState({
    type: editingTransaction?.type || 'expense',
    amount: editingTransaction?.amount || '',
    description: editingTransaction?.description || '',
    category_id: editingTransaction?.category_id || '',
    date: editingTransaction?.date || new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evita borbulhamento
    
    setLoading(true);

    try {
      if (editingTransaction) {
        const { error } = await supabase
          .from('transactions')
          .update({
            ...formData,
            amount: Number(formData.amount),
            category_id: formData.category_id || null
          })
          .eq('id', editingTransaction.id);
          
        if (error) throw error;
      } else {
        if (!canAddTransaction(currentCount)) {
          toast.error(`Limite atingido!`, `Upgrade para Pro para transações ilimitadas.`);
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              ...formData,
              amount: Number(formData.amount),
              category_id: formData.category_id || null
            });
          if (error) throw error;
        }
      }

      toast.success(
        editingTransaction ? 'Atualizado!' : 'Lançamento realizado!', 
        `Valor: R$ ${Number(formData.amount).toFixed(2)}`
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao salvar', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-3">Tipo</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
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
            onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-bold"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Data</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-bold"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Descrição</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
          placeholder="Opcional"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">Categoria</label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white font-bold"
          required
        >
          <option value="">Selecione...</option>
          {filteredCategories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-4 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-800 font-bold transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 font-black transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Salvando...' : editingTransaction ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
