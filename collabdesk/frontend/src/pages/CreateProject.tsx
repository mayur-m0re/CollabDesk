import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

export default function CreateProject() {
    const { addToast } = useToast()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [workspaceId, setWorkspaceId] = useState('')

    const { workspaces } = useWorkspaces()


    const handleCreate = async () => {
        if (!name.trim() || !workspaceId) {
            alert("Project name and workspace required")
            return
        }

        try {
            setIsCreating(true)

            const result = await api.createProject({
                name,
                description,
                workspace: workspaceId
            })

            navigate(`/project/${result.project._id}`)

        } catch (err: any) {
            addToast(err.message || 'Failed to create project', 'error')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-12 space-y-4">
            <h1 className="text-2xl font-bold">Create New Project</h1>

            <Input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <select
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="w-full border rounded p-2"
            >
                <option value="">Select Workspace</option>
                {workspaces?.map((w) => (
                    <option key={w._id} value={w._id}>
                        {w.name}
                    </option>
                ))}
            </select>

            <Button
                onClick={handleCreate}
                disabled={!name.trim() || !workspaceId || isCreating}
                className="bg-primary"
            >
                {isCreating ? 'Creating...' : 'Create Project'}
            </Button>

        </div>
    )
}
