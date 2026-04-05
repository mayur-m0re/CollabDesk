import { useState, useEffect } from 'react'
import { useParams } from '../utils/router'
import { 
  FolderKanban, 
  Users, 
  Settings, 
  Plus, 
  MoreHorizontal,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'
import type { Workspace as WorkspaceType, Project, Stats } from '../types'

export default function Workspace() {
  const { id } = useParams()
  const { addToast } = useToast()
  
  const [workspace, setWorkspace] = useState<WorkspaceType | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#6B46F8'
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchWorkspaceData()
    }
  }, [id])

  const fetchWorkspaceData = async () => {
    try {
      setIsLoading(true)
      const [workspaceData, projectsData, statsData] = await Promise.all([
        api.getWorkspace(id!),
        api.getProjects(id),
        api.getWorkspaceStats(id!)
      ])
      setWorkspace(workspaceData)
      setProjects(projectsData)
      setStats(statsData)
    } catch (error: any) {
      addToast(error.message || 'Failed to load workspace', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return

    try {
      setIsCreating(true)
      const result = await api.createProject({
        ...newProject,
        workspace: id
      })
      setProjects(prev => [...prev, result.project])
      setNewProject({ name: '', description: '', color: '#6B46F8' })
      setIsProjectDialogOpen(false)
      addToast('Project created successfully', 'success')
    } catch (error: any) {
      addToast(error.message || 'Failed to create project', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const colors = [
    '#6B46F8', '#FF2D8F', '#17D05C', '#FFAA00', '#3B82F6', '#EF4444', '#8B5CF6', '#10B981'
  ]

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

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-slate">Workspace not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: workspace.logo || '#6B46F8' }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl">{workspace.name}</h1>
            <p className="text-slate mt-1">
              {workspace.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => setIsProjectDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate">Projects</CardTitle>
            <FolderKanban className="w-4 h-4 text-slate" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.projects || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate">Tasks</CardTitle>
            <div className="w-4 h-4 rounded-full bg-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tasks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate">Completed</CardTitle>
            <div className="w-4 h-4 rounded-full bg-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate">Members</CardTitle>
            <Users className="w-4 h-4 text-slate" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.members || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <FolderKanban className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => navigateTo(`/project/${project._id}`)}
                  className="group cursor-pointer"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: project.color || '#6B46F8' }}
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-slate line-clamp-2 mb-4">
                        {project.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize">
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-slate">
                          <span>{project.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* Add Project Card */}
              <button
                onClick={() => setIsProjectDialogOpen(true)}
                className="h-full"
              >
                <Card className="h-full border-dashed hover:border-primary hover:bg-primary/5 transition-colors">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4">
                      <Plus className="w-6 h-6 text-slate" />
                    </div>
                    <p className="font-medium text-slate">Create new project</p>
                  </CardContent>
                </Card>
              </button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderKanban className="w-12 h-12 text-slate mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
                <p className="text-slate mb-4">Create your first project to get started</p>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsProjectDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workspace.members?.map((member) => (
                  <div 
                    key={member.user._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-surface"
                  >
                    <div className="flex items-center gap-3">
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
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-slate">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="capitalize">{member.role}</Badge>
                      <div className={`w-2 h-2 rounded-full ${
                        member.user.status === 'online' ? 'bg-success' : 
                        member.user.status === 'busy' ? 'bg-accent' : 'bg-slate'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project in {workspace.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Project"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description (optional)</Label>
              <Textarea
                id="projectDescription"
                placeholder="What is this project about?"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewProject(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-lg transition-transform ${
                      newProject.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={!newProject.name.trim() || isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
