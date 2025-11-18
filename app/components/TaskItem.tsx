'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { deleteTask, updateTaskDueDate } from '@/app/actions/tasks'

interface TaskItemProps {
  task: {
    task_id: string
    task_description: string
    created_at: Date | string
    due_date: Date | string | null
    project_id: string | null
    location_id: string | null
    projects: {
      project_id: string
      project_name: string
    }
    locations: {
      location_id: string
      location_name: string
      latitude: number | null
      longitude: number | null
    } | null
    priorities: {
      priority_level: string
    } | null
  }
  onProjectClick?: (projectId: string) => void
  onLocationClick?: (locationId: string) => void
  activeProjectFilter?: string | null
  activeLocationFilter?: string | null
}

export function TaskItem({ task, onProjectClick, onLocationClick, activeProjectFilter, activeLocationFilter }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()
  const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Focus date input when it appears
  useEffect(() => {
    if (showDatePicker && dateInputRef.current) {
      dateInputRef.current.focus()
      dateInputRef.current.showPicker?.()
    }
  }, [showDatePicker])

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateInputRef.current && !dateInputRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDueDate = e.target.value || null
    
    setIsUpdatingDueDate(true)
    setError(null)

    try {
      await updateTaskDueDate(task.task_id, newDueDate)
      setShowDatePicker(false)
    } catch (err) {
      setError('Failed to update due date. Please try again.')
      console.error(err)
    } finally {
      setIsUpdatingDueDate(false)
    }
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await deleteTask(task.task_id)
      } catch (err) {
        setError('Failed to delete task. Please try again.')
        console.error(err)
      }
    })
  }

  return (
    <div className="group bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-lg font-medium text-black dark:text-zinc-50">
              {task.task_description}
            </p>
            {task.due_date ? (
              <div className="relative">
                {showDatePicker ? (
                  <input
                    ref={dateInputRef}
                    type="date"
                    defaultValue={(() => {
                      const date = new Date(task.due_date)
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      return `${year}-${month}-${day}`
                    })()}
                    onChange={handleDueDateChange}
                    onBlur={() => {
                      if (!isUpdatingDueDate) {
                        setShowDatePicker(false)
                      }
                    }}
                    className="px-2 py-1 rounded-full border-2 border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 h-6 text-sm"
                    disabled={isUpdatingDueDate}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(true)}
                    className="px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 flex items-center gap-1.5 h-6 text-sm hover:opacity-80 cursor-pointer transition-opacity"
                    title="Edit due date"
                  >
                    📅 Due: {new Date(task.due_date).toLocaleDateString()}
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                {showDatePicker ? (
                  <input
                    ref={dateInputRef}
                    type="date"
                    onChange={handleDueDateChange}
                    onBlur={() => {
                      if (!isUpdatingDueDate) {
                        setShowDatePicker(false)
                      }
                    }}
                    className="px-2 py-1 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 h-6 text-sm"
                    disabled={isUpdatingDueDate}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(true)}
                    className="px-2 py-1 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center gap-1.5 h-6 text-sm transition-colors cursor-pointer"
                    title="Add due date"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Due Date
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => onProjectClick?.(task.projects.project_id)}
              className={`px-2 py-1 rounded-full bg-black text-white flex items-center gap-1.5 h-6 transition-opacity ${
                activeProjectFilter === task.projects.project_id
                  ? 'ring-2 ring-zinc-400 dark:ring-zinc-600'
                  : 'hover:opacity-80 cursor-pointer'
              }`}
              title="Filter by project"
            >
              📁 {task.projects.project_name}
            </button>
            {task.locations && task.location_id && (
              <button
                type="button"
                onClick={() => onLocationClick?.(task.location_id!)}
                className={`px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center gap-1.5 h-6 transition-opacity ${
                  activeLocationFilter === task.location_id
                    ? 'ring-2 ring-blue-400 dark:ring-blue-600'
                    : 'hover:opacity-80 cursor-pointer'
                }`}
                title="Filter by location"
              >
                📍 {task.locations.location_name.split(',')[0].trim()}
              </button>
            )}
            {task.priorities && (
              <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center gap-1.5 h-6">
                {task.priorities.priority_level}
              </span>
            )}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete task"
        >
          {isPending ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs">Deleting...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="text-xs font-medium">Delete</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

