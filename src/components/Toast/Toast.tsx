'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast as ToastType } from './ToastContext';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-green-500',
    border: 'border-green-600',
    text: 'text-white',
    icon: 'text-white',
  },
  error: {
    bg: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-white',
    icon: 'text-white',
  },
  warning: {
    bg: 'bg-orange-500',
    border: 'border-orange-600',
    text: 'text-white',
    icon: 'text-white',
  },
  info: {
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    text: 'text-white',
    icon: 'text-white',
  },
};

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-xl
        ${colors.bg} ${colors.border} ${colors.text}
        max-w-md w-full pointer-events-auto backdrop-blur-sm
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />

      <p className="flex-1 text-sm font-medium">{toast.message}</p>

      <button
        onClick={() => onClose(toast.id)}
        className={`flex-shrink-0 ${colors.text} hover:bg-white dark:bg-gray-900/20 rounded-full p-1 -m-1 transition-colors`}
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}


