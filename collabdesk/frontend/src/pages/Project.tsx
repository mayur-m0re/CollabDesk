import { useState, useEffect } from 'react'
import { useParams } from '../utils/router'
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Plus, 
  Calendar,
  Users,
  CheckSquare,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'
import type { Project as ProjectType, Task } from '../types'
import KanbanBoard from '../components/KanbanBoard'

export default function Project() {
  const { id } = useParams()
  const { addToast } = useToast()
  
  const [project, setProject] = useState<ProjectType | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'backlog' as const,
    priority: 'medium' as const,
    type: 'task' as const,
    dueDate: ''
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProjectData()
    }
  }, [id])

  const fetchProjectData = async () => {
    try {
      setIsLoading(true)
      const projectData = await api.getProject(id!)
      setProject(projectData)
      setTasks(projectData.tasks || [])
    } catch (error: any) {
      addToast(error.message || 'Failed to load project', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return

    try {
      setIsCreating(true)
      const result = await api.createTask({
        ...newTask,
        project: id
      })
      setTasks(prev => [...prev, result.task])
      setNewTask({
        title: '',
        description: '',
        status: 'backlog',
        priority: 'medium',
        type: 'task',
        dueDate: ''
      })
      setIsTaskDialogOpen(false)
      addToast('Task created successfully', 'success')
    } catch (error: any) {
      addToast(error.message || 'Failed to create task', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const task = tasks.find(t => t._id === taskId)
      if (!task || task.status === newStatus) return

      // Optimistic update
      setTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, status: newStatus as Task['status'] } : t
      ))

      await api.updateTask(taskId, { status: newStatus as Task['status'] })
      addToast('Task moved successfully', 'success')
    } catch (error: any) {
      addToast(error.message || 'Failed to move task', 'error')
      // Revert on error
      fetchProjectData()
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate">Project not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigateTo(`/workspace/${typeof project.workspace === 'string' ? project.workspace : project.workspace._id}`)}
          className="flex items-center gap-2 text-slate hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to workspace
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: project.color || '#6B46F8' }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">{project.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="capitalize">
                  {project.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-slate">
                  {project.progress}% complete
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Share
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setIsTaskDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${project.progress}%` }}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board" className="gap-2">
            <CheckSquare className="w-4 h-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Calendar className="w-4 h-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <MoreHorizontal className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <KanbanBoard 
            tasks={tasks}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div 
                      key={task._id}
                      onClick={() => handleTaskClick(task)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-surface hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-slate line-clamp-1">
                          {task.description || 'No description'}
                        </p>
                      </div>
                      <Badge className="capitalize">{task.status.replace('_', ' ')}</Badge>
                      <Badge variant="secondary" className="capitalize">
                        {task.priority}
                      </Badge>
                      <span className="text-sm text-slate">
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckSquare className="w-12 h-12 text-slate mx-auto mb-4" />
                  <p className="text-slate">No tasks yet</p>
                  <Button 
                    className="mt-4 bg-primary hover:bg-primary/90"
                    onClick={() => setIsTaskDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate">Description</Label>
                  <p className="mt-1">{project.description || 'No description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate">Start Date</Label>
                    <p className="mt-1">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <Label className="text-slate">Due Date</Label>
                    <p className="mt-1">{formatDate(project.dueDate)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-slate">Priority</Label>
                  <Badge className="mt-1 capitalize">{project.priority}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.members?.map((member) => (
                    <div 
                      key={member.user._id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.user.avatar ? (
                          <img 
                            src={member.user.avatar} 
                            alt={member.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="font-medium text-primary">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-slate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to {project.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description (optional)</Label>
              <Textarea
                id="taskDescription"
                placeholder="Add more details..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={newTask.status} 
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, status: value as typeof prev.status }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as typeof prev.priority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lowest">Lowest</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="highest">Highest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={newTask.type} 
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, type: value as typeof prev.type }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date (optional)</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask}
              disabled={!newTask.title.trim() || isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="capitalize">{selectedTask.type}</Badge>
                  <Badge variant="secondary" className="capitalize">
                    {selectedTask.priority}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate">Description</Label>
                  <p className="mt-1">{selectedTask.description || 'No description'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate">Status</Label>
                    <p className="mt-1 capitalize">{selectedTask.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-slate">Due Date</Label>
                    <p className="mt-1">{formatDate(selectedTask.dueDate)}</p>
                  </div>
                  <div>
                    <Label className="text-slate">Assignee</Label>
                    <p className="mt-1">{selectedTask.assignee?.name || 'Unassigned'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
