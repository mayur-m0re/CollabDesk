import { useState, useEffect, createContext, useContext } from 'react'
import './App.css'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import Project from './pages/Project'
import Tasks from './pages/Tasks'
import Team from './pages/Team'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

// Components
import Layout from './components/Layout'
import Toast from './components/Toast'

// Types
interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'offline' | 'busy' | 'away'
  role: 'admin' | 'manager' | 'member'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

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

// Contexts
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true
})

export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {}
})

// Auth Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Toast Provider
function ToastProvider({ children }: { children: React.ReactNode }) {
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

// Simple router based on pathname
function Router() {
  const { user, isLoading } = useContext(AuthContext)
  const path = window.location.pathname

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  // Public routes
  if (path === '/') return <LandingPage />
  if (path === '/login') return user ? <RedirectToDashboard /> : <Login />
  if (path === '/register') return user ? <RedirectToDashboard /> : <Register />

  // Protected routes
  if (!user) return <RedirectToLogin />

  // Protected pages with layout
  if (path === '/dashboard') return <Layout><Dashboard /></Layout>
  if (path.startsWith('/workspace/')) return <Layout><Workspace /></Layout>
  if (path.startsWith('/project/')) return <Layout><Project /></Layout>
  if (path === '/tasks') return <Layout><Tasks /></Layout>
  if (path === '/team') return <Layout><Team /></Layout>
  if (path === '/settings') return <Layout><Settings /></Layout>
  if (path === '/profile') return <Layout><Profile /></Layout>

  // Default redirect
  return <RedirectToDashboard />
}

function RedirectToLogin() {
  useEffect(() => {
    window.location.href = '/login'
  }, [])
  return null
}

function RedirectToDashboard() {
  useEffect(() => {
    window.location.href = '/dashboard'
  }, [])
  return null
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
