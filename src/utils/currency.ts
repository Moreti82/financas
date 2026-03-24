export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  const cleanedValue = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const validateAmount = (amount: string): boolean => {
  const parsed = parseCurrency(amount);
  return parsed > 0 && parsed <= 999999999.99;
};
