export interface ValidationError {
  field: string;
  message: string;
}

export const validateTransaction = (
  description: string,
  amount: string,
  categoryId: string,
  date: string,
  type: 'income' | 'expense'
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!description.trim()) {
    errors.push({ field: 'description', message: 'A descrição é obrigatória' });
  } else if (description.length < 3) {
    errors.push({ field: 'description', message: 'A descrição deve ter pelo menos 3 caracteres' });
  } else if (description.length > 200) {
    errors.push({ field: 'description', message: 'A descrição deve ter no máximo 200 caracteres' });
  }

  if (!amount.trim()) {
    errors.push({ field: 'amount', message: 'O valor é obrigatório' });
  } else {
    const numericAmount = parseFloat(amount.replace(/[^\d.-]/g, '').replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      errors.push({ field: 'amount', message: 'O valor deve ser maior que zero' });
    } else if (numericAmount > 999999999.99) {
      errors.push({ field: 'amount', message: 'O valor é muito alto' });
    }
  }

  if (!categoryId) {
    errors.push({ field: 'categoryId', message: 'A categoria é obrigatória' });
  }

  if (!date) {
    errors.push({ field: 'date', message: 'A data é obrigatória' });
  } else {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      errors.push({ field: 'date', message: 'A data não pode ser futura' });
    }
  }

  if (!type || !['income', 'expense'].includes(type)) {
    errors.push({ field: 'type', message: 'O tipo é obrigatório' });
  }

  return errors;
};

export const validateCategory = (
  name: string,
  type: 'income' | 'expense'
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!name.trim()) {
    errors.push({ field: 'name', message: 'O nome da categoria é obrigatório' });
  } else if (name.length < 2) {
    errors.push({ field: 'name', message: 'O nome deve ter pelo menos 2 caracteres' });
  } else if (name.length > 50) {
    errors.push({ field: 'name', message: 'O nome deve ter no máximo 50 caracteres' });
  }

  if (!type || !['income', 'expense'].includes(type)) {
    errors.push({ field: 'type', message: 'O tipo é obrigatório' });
  }

  return errors;
};

export const validateAuth = (email: string, password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!email.trim()) {
    errors.push({ field: 'email', message: 'O email é obrigatório' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Email inválido' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'A senha é obrigatória' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'A senha deve ter pelo menos 6 caracteres' });
  }

  return errors;
};
