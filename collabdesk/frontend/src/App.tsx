import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'

import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { api } from './utils/api'
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
import CreateProject from './pages/CreateProject'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import { useAuth } from './hooks/useAuth'





// Simple router based on pathname
function Router() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected */}
      <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/workspace/:id" element={user ? <Layout><Workspace /></Layout> : <Navigate to="/login" />} />
      <Route path="/project/:id" element={user ? <Layout><Project /></Layout> : <Navigate to="/login" />} />
      <Route path="/tasks" element={user ? <Layout><Tasks /></Layout> : <Navigate to="/login" />} />
      <Route path="/team" element={user ? <Layout><Team /></Layout> : <Navigate to="/login" />} />
      <Route path="/settings" element={user ? <Layout><Settings /></Layout> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <Layout><Profile /></Layout> : <Navigate to="/login" />} />
      <Route path="/project/new" element={user ? <Layout><CreateProject /></Layout> : <Navigate to="/login" />} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
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
