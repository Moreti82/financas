import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-white" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-white" />;
      case 'info':
        return <Info className="w-5 h-5 text-white" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500 shadow-green-500/40';
      case 'error':
        return 'bg-red-600 border-red-500 shadow-red-500/40';
      case 'warning':
        return 'bg-amber-600 border-amber-500 shadow-amber-500/40';
      case 'info':
        return 'bg-blue-600 border-blue-500 shadow-blue-500/40';
    }
  };

  return (
    <div
      className={`
        relative max-w-sm w-full pointer-events-auto
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-4 opacity-0 scale-95'}
      `}
    >
      <div className={`
        flex items-start gap-4 p-4 rounded-xl border shadow-2xl
        ${getColors()} text-white
      `}>
        <div className="flex-shrink-0 bg-white/20 p-1.5 rounded-lg shadow-inner">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm leading-tight">
            {title}
          </h4>
          {message && (
            <p className="text-xs mt-1 text-white/95 leading-relaxed font-semibold">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
