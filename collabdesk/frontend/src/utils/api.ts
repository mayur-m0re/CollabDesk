import type { User, Workspace, Project, Task, Notification, Stats } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }

    return data
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    })
  }

  async getMe(): Promise<User> {
    return this.request('/auth/me')
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', { method: 'POST' })
  }

  async updateStatus(status: string): Promise<void> {
    return this.request('/auth/status', {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  // Users
  async getUsers(search?: string, workspace?: string): Promise<User[]> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (workspace) params.append('workspace', workspace)
    return this.request(`/users?${params.toString()}`)
  }

  async getUser(id: string): Promise<User> {
    return this.request(`/users/${id}`)
  }

  async updateProfile(data: { name?: string; avatar?: string; preferences?: any }): Promise<{ user: User }> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return this.request('/workspaces')
  }

  async getWorkspace(id: string): Promise<Workspace> {
    return this.request(`/workspaces/${id}`)
  }

  async createWorkspace(data: { name: string; description?: string }): Promise<{ workspace: Workspace }> {
    return this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<{ workspace: Workspace }> {
    return this.request(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteWorkspace(id: string): Promise<void> {
    return this.request(`/workspaces/${id}`, { method: 'DELETE' })
  }

  async getWorkspaceStats(id: string): Promise<Stats> {
    return this.request(`/workspaces/${id}/stats`)
  }

  // Projects
  async getProjects(workspace?: string, status?: string): Promise<Project[]> {
    const params = new URLSearchParams()
    if (workspace) params.append('workspace', workspace)
    if (status) params.append('status', status)
    return this.request(`/projects?${params.toString()}`)
  }

  async getProject(id: string): Promise<Project & { tasks: Task[] }> {
    return this.request(`/projects/${id}`)
  }

  async createProject(data: Partial<Project>): Promise<{ project: Project }> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateProject(id: string, data: Partial<Project>): Promise<{ project: Project }> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteProject(id: string): Promise<void> {
    return this.request(`/projects/${id}`, { method: 'DELETE' })
  }

  async getProjectTasks(id: string): Promise<{ tasks: Task[]; groupedTasks: Record<string, Task[]> }> {
    return this.request(`/projects/${id}/tasks`)
  }

  // Tasks
  async getTasks(filters?: Record<string, string>): Promise<Task[]> {
    const params = new URLSearchParams(filters)
    return this.request(`/tasks?${params.toString()}`)
  }

  async getTask(id: string): Promise<Task> {
    return this.request(`/tasks/${id}`)
  }

  async createTask(data: Partial<Task>): Promise<{ task: Task }> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTask(id: string, data: Partial<Task>): Promise<{ task: Task }> {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/tasks/${id}`, { method: 'DELETE' })
  }

  async addComment(taskId: string, content: string): Promise<{ task: Task }> {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  }

  async toggleWatchTask(id: string): Promise<{ watching: boolean }> {
    return this.request(`/tasks/${id}/watch`, { method: 'POST' })
  }

  async bulkUpdateTasks(updates: { taskId: string; status: string; order: number }[]): Promise<void> {
    return this.request('/tasks/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ updates })
    })
  }

  // Notifications
  async getNotifications(unreadOnly?: boolean): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const params = new URLSearchParams()
    if (unreadOnly) params.append('unreadOnly', 'true')
    return this.request(`/notifications?${params.toString()}`)
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' })
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.request('/notifications/read-all', { method: 'PUT' })
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request(`/notifications/${id}`, { method: 'DELETE' })
  }

  // Team
  async getTeamMembers(workspace: string): Promise<any[]> {
    return this.request(`/teams/members?workspace=${workspace}`)
  }

  async getOnlineMembers(workspace: string): Promise<User[]> {
    return this.request(`/teams/online?workspace=${workspace}`)
  }

  async updatePresence(status: string, workspace?: string): Promise<void> {
    return this.request('/teams/presence', {
      method: 'PUT',
      body: JSON.stringify({ status, workspace })
    })
  }
}

export const api = new ApiClient()
