'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { createTask, createProject } from '@/app/actions/tasks'
import type { LocationData } from './Map'

interface Project {
  project_id: string
  project_name: string
}

interface AddTaskFormProps {
  projects: Project[]
  location: LocationData | null
  onLocationSelect: (location: LocationData) => void
  onLocationClear: () => void
  onProjectCreated?: () => void
}

export function AddTaskForm({ projects, location, onLocationSelect, onLocationClear, onProjectCreated }: AddTaskFormProps) {
  const [taskDescription, setTaskDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [addressInputValue, setAddressInputValue] = useState<string>('')
  const [showNewProjectInput, setShowNewProjectInput] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const newProjectInputRef = useRef<HTMLInputElement>(null)

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places && addressInputRef.current && !autocomplete) {
        const autocompleteInstance = new google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          fields: ['formatted_address', 'geometry'],
        })

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace()
          
          if (!place.geometry || !place.geometry.location) return

          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = place.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

          setAddressInputValue(address)
          onLocationSelect({ address, lat, lng })
        })

        setAutocomplete(autocompleteInstance)
      }
    }

    // Try to initialize immediately
    initAutocomplete()

    // If not ready, wait a bit and try again (Google Maps might still be loading)
    if (!autocomplete && typeof window !== 'undefined' && (!window.google || !window.google.maps || !window.google.maps.places)) {
      const timer = setTimeout(initAutocomplete, 500)
      return () => clearTimeout(timer)
    }
  }, [autocomplete, onLocationSelect])

  // Update address input value when location changes externally (e.g., from map click)
  useEffect(() => {
    if (location) {
      setAddressInputValue(location.address)
    }
  }, [location])

  // Focus new project input when it appears
  useEffect(() => {
    if (showNewProjectInput && newProjectInputRef.current) {
      newProjectInputRef.current.focus()
    }
  }, [showNewProjectInput])

  const handleCreateProject = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!newProjectName.trim()) {
      setShowNewProjectInput(false)
      return
    }

    setIsCreatingProject(true)
    setError(null)

    try {
      const newProject = await createProject(newProjectName.trim())
      setSelectedProjectId(newProject.project_id)
      setNewProjectName('')
      setShowNewProjectInput(false)
      if (onProjectCreated) {
        onProjectCreated()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project. Please try again.')
      console.error(err)
    } finally {
      setIsCreatingProject(false)
    }
  }

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
          location || undefined,
          dueDate || undefined
        )
        setTaskDescription('')
        setSelectedProjectId('') // Reset to default
        setDueDate('') // Reset due date
        setAddressInputValue('') // Clear address input
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
        {/* Row 1: Task Name and Address Search */}
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
          <div className="flex-1 relative">
            <input
              ref={addressInputRef}
              type="text"
              placeholder="Search for an address..."
              value={addressInputValue}
              onChange={(e) => {
                setAddressInputValue(e.target.value)
                if (!e.target.value && location) {
                  onLocationClear()
                }
                setError(null)
              }}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
              disabled={isPending}
            />
            {location && (
              <button
                type="button"
                onClick={() => {
                  setAddressInputValue('')
                  onLocationClear()
                  if (addressInputRef.current) {
                    addressInputRef.current.value = ''
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Project, Due Date, and Add Button */}
        <div className="flex gap-4">
          <div className="flex gap-2 items-center">
            {showNewProjectInput ? (
              <div className="flex gap-2">
                <input
                  ref={newProjectInputRef}
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleCreateProject(e as any)
                    }
                  }}
                  onBlur={() => {
                    if (!newProjectName.trim()) {
                      setShowNewProjectInput(false)
                    }
                  }}
                  placeholder="Project name..."
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                  disabled={isCreatingProject || isPending}
                />
                <button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={isCreatingProject || !newProjectName.trim()}
                  className="px-3 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {isCreatingProject ? '...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProjectInput(false)
                    setNewProjectName('')
                  }}
                  className="px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-sm"
                  disabled={isCreatingProject}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
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
                  type="button"
                  onClick={() => setShowNewProjectInput(true)}
                  className="px-2 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  title="Add new project"
                  disabled={isPending}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              setError(null)
            }}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
            disabled={isPending}
            title="Due date (optional)"
          />
          <div className="flex-1"></div>
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

