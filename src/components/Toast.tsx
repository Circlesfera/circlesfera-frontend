import React, { createContext, useContext, useCallback, ReactNode } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface ToastContextType {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
  loading: (message: string) => string
  dismiss: (id?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const success = useCallback((message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    })
  }, [])

  const error = useCallback((message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    })
  }, [])

  const info = useCallback((message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
    })
  }, [])

  const warning = useCallback((message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
    })
  }, [])

  const loading = useCallback((message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    })
  }, [])

  const dismiss = useCallback((id?: string) => {
    if (id) {
      toast.dismiss(id)
    } else {
      toast.dismiss()
    }
  }, [])

  return (
    <ToastContext.Provider
      value={{
        success,
        error,
        info,
        warning,
        loading,
        dismiss,
      }}
    >
      {children}
      <Toaster
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default useToast
