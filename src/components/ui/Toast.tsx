'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: string) => void
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Hook
export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// Provider
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newToast: Toast = { id, message, type, duration }

        setToasts(prev => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

// Individual Toast Component
function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
    }

    const backgrounds = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-amber-50 border-amber-200',
        info: 'bg-blue-50 border-blue-200',
    }

    return (
        <div
            className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
                ${backgrounds[toast.type]}
                animate-slide-in-right
            `}
            role="alert"
        >
            {icons[toast.type]}
            <p className="text-sm font-medium text-gray-800 max-w-xs">{toast.message}</p>
            <button
                onClick={onClose}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

// Shortcut hooks for common toast types
export function useSuccessToast() {
    const { addToast } = useToast()
    return useCallback((message: string) => addToast(message, 'success'), [addToast])
}

export function useErrorToast() {
    const { addToast } = useToast()
    return useCallback((message: string) => addToast(message, 'error'), [addToast])
}
