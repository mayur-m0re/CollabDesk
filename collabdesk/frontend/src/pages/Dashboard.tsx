import { useEffect, useState } from 'react'
import { 
  FolderKanban, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Plus, 
  Clock,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const { workspaces, isLoading: workspacesLoading } = useWorkspaces()
  const { projects, isLoading: projectsLoading } = useProjects()
  const { tasks, isLoading: tasksLoading } = useTasks()
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0
  })

  useEffect(() => {
    if (tasks.length > 0) {
      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length
      })
    }
  }, [tasks, projects])

  const recentTasks = tasks.slice(0, 5)
  const recentProjects = projects.slice(0, 4)

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      lowest: 'bg-slate/20 text-slate',
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-warning/20 text-warning',
      high: 'bg-orange-100 text-orange-700',
      highest: 'bg-red-100 text-red-700'
    }
    return colors[priority] || colors.medium
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      backlog: 'bg-slate/20 text-slate',
      todo: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-warning/20 text-warning',
      in_review: 'bg-purple-100 text-purple-700',
      completed: 'bg-success/20 text-success'
    }
    return colors[status] || colors.backlog
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Dashboard</h1>
          <p className="text-slate mt-1">
            Welcome back, {user?.name?.split(' ')[0]}! Here's what's happening.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate">Total Projects</CardTitle>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-slate mt-1">
              Across {workspaces.length} workspaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate">Total Tasks</CardTitle>
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-slate mt-1">
              {stats.inProgressTasks} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate">Completed</CardTitle>
            <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-slate mt-1">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate">Team Members</CardTitle>
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaces.reduce((acc, w) => acc + (w.members?.length || 0) + 1, 0)}
            </div>
            <p className="text-xs text-slate mt-1">
              Active collaborators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigateTo('/projects')}>
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div 
                      key={project._id} 
                      onClick={() => navigateTo(`/project/${project._id}`)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface transition-colors group cursor-pointer"
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: project.color || '#6B46F8' }}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-slate truncate">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{project.progress}%</div>
                          <div className="text-xs text-slate">Complete</div>
                        </div>
                        <div className="w-24">
                          <div className="h-2 bg-surface rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderKanban className="w-12 h-12 text-slate mx-auto mb-4" />
                  <p className="text-slate">No projects yet</p>
                  <Button className="mt-4 bg-primary hover:bg-primary/90">
                    Create your first project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Tasks</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigateTo('/tasks')}>
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div 
                      key={task._id}
                      className="p-3 rounded-xl bg-surface hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                        <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate">
                          <Clock className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckSquare className="w-12 h-12 text-slate mx-auto mb-4" />
                  <p className="text-slate">No tasks assigned to you</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workspaces */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Workspaces</CardTitle>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            New Workspace
          </Button>
        </CardHeader>
        <CardContent>
          {workspacesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : workspaces.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workspaces.map((workspace) => (
                <div
                  key={workspace._id}
                  onClick={() => navigateTo(`/workspace/${workspace._id}`)}
                  className="p-4 rounded-2xl bg-surface hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: workspace.logo || '#6B46F8' }}
                    >
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {workspace.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate line-clamp-2 mb-3">
                    {workspace.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate">
                    <span>{workspace.members?.length || 0} members</span>
                    <Badge variant="secondary" className="capitalize">
                      {workspace.plan}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate mx-auto mb-4" />
              <p className="text-slate">No workspaces yet</p>
              <Button className="mt-4 bg-primary hover:bg-primary/90">
                Create your first workspace
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
