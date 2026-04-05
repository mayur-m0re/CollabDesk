import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import type { Task } from '../types'

type TaskFilters = {
  status?: string
  priority?: string
  search?: string
}

export function useTasks(projectId?: string, filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      let data: Task[]
      if (projectId) {
        const result = await api.getProjectTasks(projectId)
        data = result.tasks
      } else {
        data = await api.getTasks(filters)
      }
      setTasks(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [projectId,
    filters?.status,
    filters?.priority,
    filters?.search])

  useEffect(() => {
    fetchTasks()
  }, [projectId, filters?.status, filters?.priority, filters?.search])

  const createTask = async (data: Partial<Task>) => {
    const result = await api.createTask(data)
    setTasks(prev => [...prev, result.task])
    return result.task
  }

  const updateTask = async (id: string, data: Partial<Task>) => {
    const result = await api.updateTask(id, data)
    setTasks(prev => prev.map(t => t._id === id ? result.task : t))
    return result.task
  }

  const deleteTask = async (id: string) => {
    await api.deleteTask(id)
    setTasks(prev => prev.filter(t => t._id !== id))
  }

  const addComment = async (taskId: string, content: string) => {
    const result = await api.addComment(taskId, content)
    setTasks(prev => prev.map(t => t._id === taskId ? result.task : t))
    return result.task
  }

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    addComment
  }
}
