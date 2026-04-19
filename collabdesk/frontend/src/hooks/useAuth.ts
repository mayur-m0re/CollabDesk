import { useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { api } from '../utils/api'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  useEffect(() => {
    if (context.token) {
      api.setToken(context.token)
    }
  }, [context.token])

  return context
}