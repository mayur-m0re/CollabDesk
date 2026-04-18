import { useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { api } from '../utils/api'

export function useAuth() {
  const context = useContext(AuthContext)

  useEffect(() => {
    if (context.token) {
      api.setToken(context.token)
    }
  }, [context.token])

  return context
}
