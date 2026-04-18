import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'

export default function CreateProject() {
    const { addToast } = useToast()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const handleCreate = async () => {
        if (!name.trim()) return

        try {
            setIsCreating(true)

            const result = await api.createProject({
                name,
                description
            })

            window.location.href = `/project/${result.project._id}`

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

            <Button
                onClick={handleCreate}
                disabled={!name.trim() || isCreating}
                className="bg-primary"
            >
                {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
        </div>
    )
}