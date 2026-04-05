import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info
}

const styles = {
  success: 'bg-success/10 text-success border-success/20',
  error: 'bg-red-50 text-red-600 border-red-200',
  info: 'bg-blue-50 text-blue-600 border-blue-200'
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const Icon = icons[type]
  
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[300px] animate-slide-in ${styles[type]}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button 
        onClick={onClose}
        className="p-1 rounded hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
