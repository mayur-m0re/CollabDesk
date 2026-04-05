export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'offline' | 'busy' | 'away'
  role: 'admin' | 'manager' | 'member'
  lastActive?: string
  preferences?: {
    notifications: {
      email: boolean
      push: boolean
      taskUpdates: boolean
    }
    theme: 'light' | 'dark' | 'system'
  }
}

export interface Workspace {
  _id: string
  name: string
  description: string
  slug: string
  owner: User
  members: WorkspaceMember[]
  settings: {
    isPublic: boolean
    allowGuests: boolean
    defaultProjectVisibility: 'private' | 'team' | 'public'
  }
  logo?: string
  plan: 'free' | 'pro' | 'business'
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  user: User
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

export interface Project {
  _id: string
  name: string
  description: string
  workspace: string | Workspace
  owner: User
  members: ProjectMember[]
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: string
  dueDate?: string
  completedAt?: string
  progress: number
  tags: string[]
  color: string
  icon: string
  createdAt: string
  updatedAt: string
  tasks?: Task[]
}

export interface ProjectMember {
  user: User
  role: 'lead' | 'member' | 'viewer'
}

export interface Task {
  _id: string
  title: string
  description: string
  project: string | Project
  workspace: string | Workspace
  assignee?: User
  reporter: User
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'completed' | 'cancelled'
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest'
  type: 'task' | 'bug' | 'feature' | 'improvement' | 'epic'
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  labels: string[]
  attachments: Attachment[]
  comments: Comment[]
  subtasks: Subtask[]
  dependencies: string[]
  watchers: User[]
  completedAt?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export interface Comment {
  _id: string
  author: User
  content: string
  createdAt: string
}

export interface Subtask {
  _id: string
  title: string
  completed: boolean
}

export interface Notification {
  _id: string
  recipient: string
  sender?: User
  type: 'task_assigned' | 'task_updated' | 'task_completed' | 'comment_added' | 'mention' | 'project_invite' | 'workspace_invite' | 'due_date_reminder'
  title: string
  message: string
  data: {
    project?: string | Project
    task?: string | Task
    workspace?: string | Workspace
  }
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface Activity {
  _id: string
  actor: User
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'completed' | 'commented' | 'joined' | 'left'
  entityType: 'task' | 'project' | 'workspace' | 'comment'
  entityId: string
  workspace: string
  project?: string
  metadata: Record<string, any>
  createdAt: string
}

export interface KanbanColumn {
  id: string
  title: string
  tasks: Task[]
}

export interface Stats {
  projects: number
  tasks: number
  completedTasks: number
  members: number
}
