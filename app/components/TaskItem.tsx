'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { deleteTask, updateTaskDueDate, updateTaskCompletion } from '@/app/actions/tasks'
import { Capsule } from './Capsule'
import { TaskNoteModal } from './TaskNoteModal'

interface TaskItemProps {
  task: {
    task_id: string
    task_description: string
    created_at: Date | string
    due_date: Date | string | null
    is_completed: boolean
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
    task_notes: {
      task_note_id: string
      task_note_content: string
    } | null
  }
  onProjectClick?: (projectId: string) => void
  onLocationClick?: (locationId: string) => void
  activeProjectFilter?: string | null
  activeLocationFilter?: string | null
}

export function TaskItem({ task, onProjectClick, onLocationClick, activeProjectFilter, activeLocationFilter }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()
  const [isCompleting, setIsCompleting] = useState(false)
  const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
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

  const handleComplete = async () => {
    setIsCompleting(true)
    setError(null)

    try {
      await updateTaskCompletion(task.task_id, !task.is_completed)
    } catch (err) {
      setError('Failed to update task completion. Please try again.')
      console.error(err)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleOpenNoteModal = () => {
    setShowNoteModal(true)
  }

  const handleCloseNoteModal = () => {
    setShowNoteModal(false)
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
            {task.is_completed ? (
              <>
                <Capsule variant="completed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </Capsule>
                <Capsule
                  variant={task.task_notes?.task_note_content ? 'note' : 'note-empty'}
                  as="button"
                  onClick={handleOpenNoteModal}
                  title={task.task_notes?.task_note_content ? "Edit note" : "Add note"}
                >
                  ✏️ Note
                </Capsule>
              </>
            ) : task.due_date ? (
              <>
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
                    <Capsule
                      variant="due-date"
                      as="button"
                      onClick={() => setShowDatePicker(true)}
                      title="Edit due date"
                    >
                      📅 Due: {new Date(task.due_date).toLocaleDateString()}
                    </Capsule>
                  )}
                </div>
                <Capsule
                  variant={task.task_notes?.task_note_content ? 'note' : 'note-empty'}
                  as="button"
                  onClick={handleOpenNoteModal}
                  title={task.task_notes?.task_note_content ? "Edit note" : "Add note"}
                >
                  ✏️ Note
                </Capsule>
              </>
            ) : (
              <>
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
                    <Capsule
                      variant="due-date-empty"
                      as="button"
                      onClick={() => setShowDatePicker(true)}
                      title="Add due date"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Due Date
                    </Capsule>
                  )}
                </div>
                <Capsule
                  variant={task.task_notes?.task_note_content ? 'note' : 'note-empty'}
                  as="button"
                  onClick={handleOpenNoteModal}
                  title={task.task_notes?.task_note_content ? "Edit note" : "Add note"}
                >
                  ✏️ Note
                </Capsule>
              </>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
            <Capsule
              variant="project"
              as="button"
              onClick={() => onProjectClick?.(task.projects.project_id)}
              active={activeProjectFilter === task.projects.project_id}
              title="Filter by project"
            >
              📁 {task.projects.project_name}
            </Capsule>
            {task.locations && task.location_id && (
              <Capsule
                variant="location"
                as="button"
                onClick={() => onLocationClick?.(task.location_id!)}
                active={activeLocationFilter === task.location_id}
                title="Filter by location"
              >
                📍 {task.locations.location_name.split(',')[0].trim()}
              </Capsule>
            )}
            {task.priorities && (
              <Capsule variant="priority" as="span">
                {task.priorities.priority_level}
              </Capsule>
            )}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="ml-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex flex-col items-center gap-1 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="flex flex-col items-center gap-1 px-3 py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title={task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs">Updating...</span>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-xs font-medium">Finish</span>
              </>
            )}
          </button>
        </div>
      </div>

      <TaskNoteModal
        isOpen={showNoteModal}
        onClose={handleCloseNoteModal}
        taskId={task.task_id}
        taskDescription={task.task_description}
        isCompleted={task.is_completed}
        initialNoteContent={task.task_notes?.task_note_content || null}
      />
    </div>
  )
}

