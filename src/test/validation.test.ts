import { describe, it, expect } from 'vitest';
import { validateTransaction, validateAuth } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateTransaction', () => {
    it('deve validar transação corretamente', () => {
      const result = validateTransaction(
        'Salário',
        '1000',
        'category-id',
        '2024-01-01',
        'income'
      );
      expect(result).toHaveLength(0);
    });

    it('deve retornar erros para campos inválidos', () => {
      const result = validateTransaction('', '', '', '', 'income' as any);
      expect(result).toHaveLength(4);
      expect(result.map(e => e.field)).toContain('description');
      expect(result.map(e => e.field)).toContain('amount');
      expect(result.map(e => e.field)).toContain('categoryId');
      expect(result.map(e => e.field)).toContain('date');
    });

    it('deve validar descrição', () => {
      const result = validateTransaction('ab', '100', 'cat', '2024-01-01', 'income');
      expect(result.some(e => e.field === 'description')).toBe(true);
    });

    it('deve validar valor', () => {
      const result = validateTransaction('Test', '0', 'cat', '2024-01-01', 'income');
      expect(result.some(e => e.field === 'amount')).toBe(true);
    });

    it('deve validar data futura', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const result = validateTransaction(
        'Test',
        '100',
        'cat',
        futureDate.toISOString().split('T')[0],
        'income'
      );
      expect(result.some(e => e.field === 'date')).toBe(true);
    });
  });

  describe('validateAuth', () => {
    it('deve validar autenticação corretamente', () => {
      const result = validateAuth('test@example.com', 'password123');
      expect(result).toHaveLength(0);
    });

    it('deve retornar erros para campos inválidos', () => {
      const result = validateAuth('', '');
      expect(result).toHaveLength(2);
      expect(result.map(e => e.field)).toContain('email');
      expect(result.map(e => e.field)).toContain('password');
    });

    it('deve validar formato de email', () => {
      const result = validateAuth('invalid-email', 'password123');
      expect(result.some(e => e.field === 'email')).toBe(true);
    });

    it('deve validar tamanho da senha', () => {
      const result = validateAuth('test@example.com', '123');
      expect(result.some(e => e.field === 'password')).toBe(true);
    });
  });
});
