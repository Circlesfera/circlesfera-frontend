'use client';

import { type ReactElement, type ReactNode } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

import { modalVariants, overlayVariants } from '@/lib/motion-config';

export interface DialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly children: ReactNode;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4'
};

/**
 * Componente Dialog/Modal con diseño profesional.
 * Componente base para modales y diálogos.
 */
export function Dialog({ open, onOpenChange, children, size = 'md' }: DialogProps): ReactElement | null {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overlay backdrop-blur-md"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          
          {/* Dialog Container */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={twMerge(
              'relative z-50 w-full',
              sizeClasses[size]
            )}
            role="dialog"
            aria-modal="true"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export interface DialogContentProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly onClose?: () => void;
}

export function DialogContent({ children, className, onClose }: DialogContentProps): ReactElement {
  return (
    <div
      className={twMerge(
        'glass-modal rounded-2xl p-6 md:p-8 shadow-elegant-xl',
        className
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 focus-ring z-10 hover:scale-105 active:scale-95"
          aria-label="Cerrar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {children}
    </div>
  );
}

export interface DialogHeaderProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps): ReactElement {
  return (
    <div className={twMerge('mb-6 pr-8', className)}>
      {children}
    </div>
  );
}

export interface DialogTitleProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps): ReactElement {
  return (
    <h2 className={twMerge('text-2xl font-bold text-white mb-2', className)}>
      {children}
    </h2>
  );
}

export interface DialogDescriptionProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps): ReactElement {
  return (
    <p className={twMerge('text-sm text-slate-400', className)}>
      {children}
    </p>
  );
}

export interface DialogFooterProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps): ReactElement {
  return (
    <div className={twMerge('flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/5', className)}>
      {children}
    </div>
  );
}

