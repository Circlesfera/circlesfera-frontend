/**
 * Modal Component - Shared
 * Componente de modal reutilizable usando el patrón Compound Component
 */

'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button/Button'

// Context para el modal
interface ModalContextType {
  isOpen: boolean
  onClose: () => void
}

const ModalContext = createContext<ModalContextType | null>(null)

const useModalContext = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('Modal components must be used within Modal')
  }
  return context
}

// Props del modal principal
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

/**
 * Modal principal
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closable = true,
  closeOnOverlayClick = true,
  className
}) => {
  // Prevenir scroll del body cuando el modal está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Manejar tecla Escape
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closable) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closable, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  const contextValue: ModalContextType = {
    isOpen,
    onClose
  }

  return createPortal(
    <ModalContext.Provider value={contextValue}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Modal */}
        <div
          className={cn(
            'relative bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  )
}

/**
 * Header del modal
 */
interface ModalHeaderProps {
  children: ReactNode
  showCloseButton?: boolean
  className?: string
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  showCloseButton = true,
  className
}) => {
  const { onClose } = useModalContext()

  return (
    <div className={cn(
      'flex items-center justify-between p-6 border-b border-gray-200',
      className
    )}>
      <div className="flex-1">
        {children}
      </div>
      {showCloseButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="ml-4"
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}

/**
 * Body del modal
 */
interface ModalBodyProps {
  children: ReactNode
  className?: string
  scrollable?: boolean
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  scrollable = true
}) => {
  return (
    <div className={cn(
      'p-6',
      scrollable && 'max-h-[60vh] overflow-y-auto',
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Footer del modal
 */
interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      'flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50',
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Título del modal
 */
interface ModalTitleProps {
  children: ReactNode
  className?: string
}

export const ModalTitle: React.FC<ModalTitleProps> = ({
  children,
  className
}) => {
  return (
    <h2 className={cn(
      'text-lg font-semibold text-gray-900',
      className
    )}>
      {children}
    </h2>
  )
}

/**
 * Descripción del modal
 */
interface ModalDescriptionProps {
  children: ReactNode
  className?: string
}

export const ModalDescription: React.FC<ModalDescriptionProps> = ({
  children,
  className
}) => {
  return (
    <p className={cn(
      'text-sm text-gray-600 mt-1',
      className
    )}>
      {children}
    </p>
  )
}

/**
 * Hook para usar el modal
 */
interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = React.useState(initialState)

  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

/**
 * Modal de confirmación
 */
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        {description && (
          <ModalDescription>{description}</ModalDescription>
        )}
      </ModalHeader>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

/**
 * Modal de alerta
 */
interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  buttonText?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText = 'Entendido',
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <ModalHeader>
        <ModalTitle className={variantClasses[variant]}>
          {title}
        </ModalTitle>
        {description && (
          <ModalDescription>{description}</ModalDescription>
        )}
      </ModalHeader>

      <ModalFooter>
        <Button
          variant={variant === 'error' ? 'destructive' : 'default'}
          onClick={onClose}
          className="w-full"
        >
          {buttonText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

// Los componentes ya están exportados individualmente arriba
