import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import type { Category, TransactionWithCategory } from '../types/database';
import { supabase } from '../lib/supabase';

interface TransactionFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  editingTransaction?: TransactionWithCategory;
  currentCount: number;
}

import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '../hooks/useToast';

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
    setLoading(true);

    try {
      if (editingTransaction) {
        // Update existing transaction
        await supabase
          .from('transactions')
          .update({
            ...formData,
            amount: Number(formData.amount)
          })
          .eq('id', editingTransaction.id);
      } else {
        // Check limits
        if (!canAddTransaction(currentCount)) {
          toast.error(`Limite do plano atingido!`, `Seu plano atual permite apenas ${limits.transactions} transações. Faça um upgrade para o Pro para ter acesso ilimitado!`);
          setLoading(false);
          return;
        }

        // Create new transaction
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              ...formData,
              amount: Number(formData.amount)
            });
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tipo de Transação
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.type === 'expense'
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
            }`}
          >
            <TrendingDown className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.type === 'income'
                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
            }`}
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Receita</span>
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Valor (R$)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400">R$</span>
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="0,00"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descrição
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Ex: Supermercado, Salário, etc."
            required
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categoria
        </label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          required
        >
          <option value="">Selecione uma categoria</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {filteredCategories.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Nenhuma categoria disponível para este tipo de transação
          </p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
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
              <DollarSign className="w-4 h-4" />
              {editingTransaction ? 'Atualizar' : 'Adicionar'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
