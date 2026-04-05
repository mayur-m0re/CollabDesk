import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import type { Workspace } from '../types'

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await api.getWorkspaces()
      setWorkspaces(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const createWorkspace = async (data: { name: string; description?: string }) => {
    const result = await api.createWorkspace(data)
    setWorkspaces(prev => [...prev, result.workspace])
    return result.workspace
  }

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    const result = await api.updateWorkspace(id, data)
    setWorkspaces(prev => prev.map(w => w._id === id ? result.workspace : w))
    return result.workspace
  }

  const deleteWorkspace = async (id: string) => {
    await api.deleteWorkspace(id)
    setWorkspaces(prev => prev.filter(w => w._id !== id))
  }

  return {
    workspaces,
    isLoading,
    error,
    refetch: fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  }
}
