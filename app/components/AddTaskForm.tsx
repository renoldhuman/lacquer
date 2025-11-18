'use client'

import { useState, useTransition } from 'react'
import { createTask } from '@/app/actions/tasks'
import type { LocationData } from './Map'

interface Project {
  project_id: string
  project_name: string
}

interface AddTaskFormProps {
  projects: Project[]
  location: LocationData | null
  onLocationClear: () => void
}

export function AddTaskForm({ projects, location, onLocationClear }: AddTaskFormProps) {
  const [taskDescription, setTaskDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!taskDescription.trim()) {
      setError('Task description cannot be empty')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        // If no project selected (empty string), pass undefined to use Miscellaneous
        await createTask(
          taskDescription.trim(), 
          selectedProjectId || undefined,
          location || undefined
        )
        setTaskDescription('')
        setSelectedProjectId('') // Reset to default
        onLocationClear() // Clear location
      } catch (err) {
        setError('Failed to create task. Please try again.')
        console.error(err)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="space-y-4">
        {/* Location Display */}
        {location && (
          <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Location:</p>
              <p className="text-sm font-medium text-black dark:text-zinc-50">{location.address}</p>
            </div>
            <button
              type="button"
              onClick={onLocationClear}
              className="ml-4 px-3 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          </div>
        )}

        {/* Task Input Row */}
        <div className="flex gap-4">
          <input
            type="text"
            value={taskDescription}
            onChange={(e) => {
              setTaskDescription(e.target.value)
              setError(null)
            }}
            placeholder="Enter task name..."
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
            disabled={isPending}
          />
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value)
              setError(null)
            }}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
            disabled={isPending}
          >
            <option value="">Miscellaneous (default)</option>
            {projects
              .filter((project) => project.project_name !== 'Miscellaneous')
              .map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={isPending || !taskDescription.trim()}
            className="px-6 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  )
}

