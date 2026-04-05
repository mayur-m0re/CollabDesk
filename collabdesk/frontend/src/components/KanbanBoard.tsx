import { useState } from 'react'
import type { Task } from '../types'
import { MoreHorizontal, Plus, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: string) => void
  onTaskClick: (task: Task) => void
}

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-warning' },
  { id: 'in_review', title: 'In Review', color: 'bg-purple-500' },
  { id: 'completed', title: 'Completed', color: 'bg-success' },
]

const priorityColors: Record<string, string> = {
  lowest: 'bg-slate/20 text-slate',
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-orange-100 text-orange-700',
  highest: 'bg-red-100 text-red-700'
}

const typeIcons: Record<string, string> = {
  task: '📋',
  bug: '🐛',
  feature: '✨',
  improvement: '⚡',
  epic: '🚀'
}

export default function KanbanBoard({ tasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (draggedTask) {
      onTaskMove(draggedTask, status)
      setDraggedTask(null)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status).sort((a, b) => a.order - b.order)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 bg-surface rounded-2xl p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold">{column.title}</h3>
              <span className="text-sm text-slate bg-white px-2 py-0.5 rounded-full">
                {getTasksByStatus(column.id).length}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-white/50">
                  <MoreHorizontal className="w-4 h-4 text-slate" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Add task</DropdownMenuItem>
                <DropdownMenuItem>Sort by priority</DropdownMenuItem>
                <DropdownMenuItem>Sort by date</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task._id}
                draggable
                onDragStart={() => handleDragStart(task._id)}
                onClick={() => onTaskClick(task)}
                className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[task.type] || '📋'}</span>
                    <span className="text-xs text-slate">{task._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-surface"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Task Title */}
                <h4 className="font-medium mb-3 line-clamp-2">{task.title}</h4>

                {/* Task Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority] || priorityColors.medium}`}>
                      {task.priority}
                    </Badge>
                    {task.labels.slice(0, 1).map((label) => (
                      <span key={label} className="text-xs bg-surface px-2 py-0.5 rounded-full">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Task Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface">
                  <div className="flex items-center gap-3">
                    {task.dueDate && (
                      <div className={`flex items-center gap-1 text-xs ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-slate'}`}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </div>
                    )}
                    {task.comments.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate">
                        <span>💬</span>
                        {task.comments.length}
                      </div>
                    )}
                  </div>
                  
                  {task.assignee ? (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      {task.assignee.avatar ? (
                        <img 
                          src={task.assignee.avatar} 
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-medium text-primary">
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center">
                      <User className="w-3 h-3 text-slate" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Task Button */}
          <Button 
            variant="ghost" 
            className="w-full mt-3 justify-start gap-2 text-slate hover:text-ink"
          >
            <Plus className="w-4 h-4" />
            Add task
          </Button>
        </div>
      ))}

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{typeIcons[selectedTask.type] || '📋'}</span>
                  {selectedTask.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-slate">{selectedTask.description || 'No description'}</p>
                {/* Add more task details here */}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
