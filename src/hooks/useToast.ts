import { useState, useCallback, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

let globalToasts: ToastMessage[] = [];
type Listener = (toasts: ToastMessage[]) => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  const currentToasts = [...globalToasts];
  listeners.forEach(listener => listener(currentToasts));
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>(globalToasts);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    globalToasts = globalToasts.filter(toast => toast.id !== id);
    notifyListeners();
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast
    };

    globalToasts = [...globalToasts, newToast];
    notifyListeners();
    return id;
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const clear = useCallback(() => {
    globalToasts = [];
    notifyListeners();
  }, []);

  return {
    toasts,
    addToast,
    success,
    error,
    warning,
    info,
    clear,
    removeToast
  };
}
