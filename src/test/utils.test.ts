import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency, validateAmount } from '../utils/currency';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores corretamente', () => {
      expect(formatCurrency(100)).toBe('R$ 100,00');
      expect(formatCurrency(100.5)).toBe('R$ 100,50');
      expect(formatCurrency(1000.99)).toBe('R$ 1.000,99');
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });
  });

  describe('parseCurrency', () => {
    it('deve converter string para número', () => {
      expect(parseCurrency('R$ 100,00')).toBe(100);
      expect(parseCurrency('100,50')).toBe(100.5);
      expect(parseCurrency('1.000,99')).toBe(1000.99);
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency('abc')).toBe(0);
    });
  });

  describe('validateAmount', () => {
    it('deve validar valores corretamente', () => {
      expect(validateAmount('100')).toBe(true);
      expect(validateAmount('100,50')).toBe(true);
      expect(validateAmount('R$ 1.000,00')).toBe(true);
      expect(validateAmount('0')).toBe(false);
      expect(validateAmount('-100')).toBe(false);
      expect(validateAmount('')).toBe(false);
      expect(validateAmount('abc')).toBe(false);
      expect(validateAmount('1000000000')).toBe(false);
    });
  });
});
