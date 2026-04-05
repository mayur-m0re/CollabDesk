import { useContext } from 'react'
import { ToastContext } from '../App'

export function useToast() {
  return useContext(ToastContext)
}
