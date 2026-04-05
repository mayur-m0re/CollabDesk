import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import type { Project } from '../types'

export function useProjects(workspaceId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await api.getProjects(workspaceId)
      setProjects(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = async (data: Partial<Project>) => {
    const result = await api.createProject(data)
    setProjects(prev => [...prev, result.project])
    return result.project
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    const result = await api.updateProject(id, data)
    setProjects(prev => prev.map(p => p._id === id ? result.project : p))
    return result.project
  }

  const deleteProject = async (id: string) => {
    await api.deleteProject(id)
    setProjects(prev => prev.filter(p => p._id !== id))
  }

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}
