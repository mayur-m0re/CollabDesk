import { useState } from 'react'
import { User, Camera, Mail, Briefcase, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'

export default function Profile() {
  const { user, login } = useAuth()
  const { addToast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  })

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const result = await api.updateProfile({
        name: formData.name,
        avatar: formData.avatar
      })
      
      // Update local storage with new user data
      const token = localStorage.getItem('token')
      if (token) {
        login(token, result.user)
      }
      
      setIsEditing(false)
      addToast('Profile updated successfully', 'success')
    } catch (error: any) {
      addToast(error.message || 'Failed to update profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl">Profile</h1>
        <p className="text-slate mt-1">Manage your personal information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <h2 className="font-semibold text-xl">{user?.name}</h2>
            <p className="text-slate">{user?.email}</p>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${
                user?.status === 'online' ? 'bg-success' : 
                user?.status === 'busy' ? 'bg-accent' : 'bg-slate'
              }`} />
              <span className="text-sm text-slate capitalize">{user?.status}</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{user?.role === 'admin' ? 'Admin' : 'Member'}</p>
                  <p className="text-sm text-slate">Role</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">Active</p>
                  <p className="text-sm text-slate">Status</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </div>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-surface' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-surface"
                />
                <p className="text-xs text-slate">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Role
                </Label>
                <Input
                  id="role"
                  value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                  disabled
                  className="bg-surface capitalize"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="joined" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <Input
                  id="joined"
                  value={new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                  disabled
                  className="bg-surface"
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      avatar: user?.avatar || ''
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions across workspaces</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate mx-auto mb-4" />
            <p className="text-slate">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
