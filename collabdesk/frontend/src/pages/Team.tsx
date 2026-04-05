import { useState, useEffect } from 'react'
import { Users, Search, Mail, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { api } from '../utils/api'
import type { User } from '../types'

interface TeamMember extends Omit<User, 'role'> {
  role: string
  joinedAt: string
}

export default function Team() {
  const { workspaces } = useWorkspaces()
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | undefined>(undefined)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    if (!selectedWorkspace) return
    fetchTeamMembers()
  }, [selectedWorkspace])

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]._id)
    }
  }, [workspaces])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const data = await api.getTeamMembers(selectedWorkspace!)
      setMembers(data)
    } catch (error) {
      console.error('Failed to fetch team members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlineMembers = members.filter(m => m.status === 'online' || m.status === 'busy')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl">Team</h1>
          <p className="text-slate mt-1">Manage your team members and their roles</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Users className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate">Total Members</p>
                <p className="text-3xl font-bold">{members.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate">Online Now</p>
                <p className="text-3xl font-bold text-success">{onlineMembers.length}</p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate">Workspaces</p>
                <p className="text-3xl font-bold">{workspaces.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Team Members</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member._id}
                  onClick={() => setSelectedMember(member)}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <span className="font-medium text-primary text-lg">
                            {member.name.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-success' :
                        member.status === 'busy' ? 'bg-accent' :
                          member.status === 'away' ? 'bg-warning' : 'bg-slate'
                        }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-slate">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className="capitalize">{member.role}</Badge>
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No members found</h3>
              <p className="text-slate">Try adjusting your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent>
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Team Member</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {selectedMember.avatar ? (
                    <img
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <span className="font-medium text-primary text-2xl">
                      {selectedMember.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedMember.name}</h3>
                  <p className="text-slate">{selectedMember.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="capitalize">{selectedMember.role}</Badge>
                    <Badge variant="secondary" className="capitalize">
                      {selectedMember.status}
                    </Badge>
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
