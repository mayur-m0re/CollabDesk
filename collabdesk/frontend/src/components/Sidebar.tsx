import { useState } from 'react'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings, 
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Briefcase
} from 'lucide-react'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '../hooks/useToast'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: Users, label: 'Team', path: '/team' },
]

const bottomNavItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: UserCircle, label: 'Profile', path: '/profile' },
]

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const { user } = useAuth()
  const { workspaces, createWorkspace } = useWorkspaces()
  const { addToast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' })
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) return
    
    try {
      setIsCreating(true)
      await createWorkspace(newWorkspace)
      setNewWorkspace({ name: '', description: '' })
      setIsDialogOpen(false)
      addToast('Workspace created successfully', 'success')
    } catch (error: any) {
      addToast(error.message || 'Failed to create workspace', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  if (!open) {
    return (
      <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-border flex flex-col items-center py-4 z-40">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-surface mb-6"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={`p-3 rounded-xl transition-colors ${
                window.location.pathname === item.path ? 'bg-primary text-white' : 'hover:bg-surface'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>
      </div>
    )
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg">CollabDesk</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-surface"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Workspaces */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate uppercase tracking-wider">Workspaces</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="p-1 rounded hover:bg-surface">
                <Plus className="w-4 h-4 text-slate" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Create a new workspace for your team to collaborate.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    placeholder="My Workspace"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this workspace for?"
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspace.name.trim() || isCreating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isCreating ? 'Creating...' : 'Create Workspace'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-1">
          {workspaces.slice(0, 5).map((workspace) => (
            <button
              key={workspace._id}
              onClick={() => navigateTo(`/workspace/${workspace._id}`)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                window.location.pathname.includes(workspace._id) ? 'bg-primary/10 text-primary' : 'hover:bg-surface'
              }`}
            >
              <div 
                className="w-5 h-5 rounded-md flex items-center justify-center text-xs text-white font-medium"
                style={{ backgroundColor: workspace.logo || '#6B46F8' }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{workspace.name}</span>
            </button>
          ))}
          {workspaces.length > 5 && (
            <div className="px-3 py-1 text-xs text-slate">
              +{workspaces.length - 5} more
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigateTo(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              window.location.pathname === item.path ? 'bg-primary text-white' : 'hover:bg-surface text-ink'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigateTo(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              window.location.pathname === item.path ? 'bg-primary text-white' : 'hover:bg-surface text-ink'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
        
        {/* User */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <span className="text-sm font-medium text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate truncate">{user?.email}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            user?.status === 'online' ? 'bg-success' : 
            user?.status === 'busy' ? 'bg-accent' : 'bg-slate'
          }`} />
        </div>
      </div>
    </div>
  )
}
