import { useState } from 'react'
import { CheckSquare, Search, Filter, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTasks } from '../hooks/useTasks'

export default function Tasks() {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  })

  const { tasks, isLoading } = useTasks(undefined, {
    status: filters.status === 'all' ? undefined : filters.status,
    priority: filters.priority === 'all' ? undefined : filters.priority,
    search: filters.search
  })

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">My Tasks</h1>
          <p className="text-slate mt-1">Manage and track all your tasks</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <CheckSquare className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
              <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="lowest">Lowest</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="highest">Highest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{task.title}</h4>
                      <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate line-clamp-1">
                      {task.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={`capitalize ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </Badge>

                    <div className="flex items-center gap-1 text-sm text-slate">
                      <Calendar className="w-4 h-4" />
                      {formatDate(task.dueDate)}
                    </div>

                    {task.assignee ? (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {task.assignee.avatar ? (
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-primary">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                        <User className="w-4 h-4 text-slate" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-slate mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No tasks found</h3>
              <p className="text-slate">Try adjusting your filters or create a new task</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
