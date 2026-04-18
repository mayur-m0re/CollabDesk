import { createContext, useState } from 'react'
import Toast from '../components/Toast'

interface ToastType {
    id: string
    message: string
    type: 'success' | 'error' | 'info'
}

interface ToastContextType {
    toasts: ToastType[]
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void
    removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastType[]>([])

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts(prev => [...prev, { id, message, type }])

        setTimeout(() => {
            removeToast(id)
        }, 5000)
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}