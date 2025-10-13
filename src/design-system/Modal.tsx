"use client"

/**
 * 🪟 MODAL COMPONENT
 * ==================
 * Modal base del design system
 *
 * ✅ WCAG 2.1 AA Compliant
 * ✅ Focus trap automático
 * ✅ Esc para cerrar
 * ✅ Click outside para cerrar
 * ✅ ARIA dialog completo
 * ✅ Animaciones consistentes
 *
 * @see src/design-system/tokens/index.ts
 */

import React, { useEffect, useRef, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { CloseIcon } from '@/components/icons/NavigationIcons'
import { TOUCH_TARGET_CLASSES } from '@/utils/accessibilityHelpers'

const modalVariants = cva(
  // Base styles
  "relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700",
  {
    variants: {
      size: {
        sm: "w-full max-w-sm",
        md: "w-full max-w-md",
        lg: "w-full max-w-2xl",
        xl: "w-full max-w-4xl",
        full: "w-full max-w-7xl",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      size: "md",
      padding: "md",
    },
  }
)

export interface ModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'>,
  VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  showCloseButton?: boolean
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
  children: React.ReactNode
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    className,
    isOpen,
    onClose,
    title,
    description,
    showCloseButton = true,
    closeOnClickOutside = true,
    closeOnEsc = true,
    size,
    padding,
    children,
    ...props
  }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null)
    const modalRef = (ref as React.RefObject<HTMLDivElement>) || internalRef
    const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
    const descId = `modal-desc-${Math.random().toString(36).substr(2, 9)}`

    // Focus trap
    useEffect(() => {
      if (!isOpen) return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements?.[0] as HTMLElement
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement

      // Focus al primer elemento
      firstElement?.focus()

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTab)
      return () => document.removeEventListener('keydown', handleTab)
    }, [isOpen, modalRef])

    // Close on Esc
    useEffect(() => {
      if (!isOpen || !closeOnEsc) return

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }, [isOpen, closeOnEsc, onClose])

    // Prevenir scroll del body
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    if (!isOpen) return null

    return (
      // Overlay
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeOnClickOutside ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal content */}
        <div
          ref={modalRef}
          className={cn(modalVariants({ size, padding }), className, "animate-scale z-10")}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={cn(
              "flex items-center justify-between",
              padding !== 'none' && "mb-4"
            )}>
              <div>
                {title && (
                  <h2
                    id={titleId}
                    className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descId}
                    className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`${TOUCH_TARGET_CLASSES.min} p-2 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                  aria-label="Cerrar modal"
                >
                  <CloseIcon aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = "Modal"

export { Modal, modalVariants }

