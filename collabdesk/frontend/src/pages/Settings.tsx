import { useState } from 'react'
import { Settings, Bell, Moon, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '../hooks/useToast'

export default function SettingsPage() {
  const { addToast } = useToast()
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskUpdates: true,
    mentions: true,
    projectInvites: true
  })
  
  const [preferences, setPreferences] = useState({
    darkMode: false,
    compactView: false,
    autoSave: true
  })

  const handleSave = () => {
    addToast('Settings saved successfully', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl">Settings</h1>
        <p className="text-slate mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Choose how you want to be notified about activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-slate">Receive updates via email</p>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-slate">Receive push notifications in browser</p>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, push: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Updates</Label>
                  <p className="text-sm text-slate">Get notified when tasks are updated</p>
                </div>
                <Switch 
                  checked={notifications.taskUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, taskUpdates: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mentions</Label>
                  <p className="text-sm text-slate">Get notified when you're mentioned</p>
                </div>
                <Switch 
                  checked={notifications.mentions}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, mentions: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Project Invites</Label>
                  <p className="text-sm text-slate">Get notified about project invitations</p>
                </div>
                <Switch 
                  checked={notifications.projectInvites}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, projectInvites: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your workspace experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </Label>
                  <p className="text-sm text-slate">Use dark theme across the app</p>
                </div>
                <Switch 
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, darkMode: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-slate">Show more content with less spacing</p>
                </div>
                <Switch 
                  checked={preferences.compactView}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, compactView: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save</Label>
                  <p className="text-sm text-slate">Automatically save changes</p>
                </div>
                <Switch 
                  checked={preferences.autoSave}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, autoSave: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-slate">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Change Password</Label>
                  <p className="text-sm text-slate">Update your password regularly</p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Sessions</Label>
                  <p className="text-sm text-slate">Manage your active login sessions</p>
                </div>
                <Button variant="outline">View</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90"
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}
