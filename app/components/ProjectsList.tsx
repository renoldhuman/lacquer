'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TaskItem } from './TaskItem'
import { DeleteProjectModal } from './DeleteProjectModal'
import { deleteProject } from '@/app/actions/tasks'

interface Project {
  project_id: string
  project_name: string
  project_description: string | null
  tasks: Array<{
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
  }>
}

interface ProjectsListProps {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [showCompleted, setShowCompleted] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const toggleCompletedVisibility = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent expanding/collapsing the project
    const newShowCompleted = new Set(showCompleted)
    if (newShowCompleted.has(projectId)) {
      newShowCompleted.delete(projectId)
    } else {
      newShowCompleted.add(projectId)
    }
    setShowCompleted(newShowCompleted)
  }

  const handleProjectClick = (projectId: string) => {
    // This is just for consistency with TaskItem, but we don't need to filter here
    // since we're already showing tasks grouped by project
  }

  const handleLocationClick = (locationId: string) => {
    // This is just for consistency with TaskItem, but we don't need to filter here
    // since we're already showing tasks grouped by project
  }

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
          <p className="text-lg">No projects yet. Create your first project!</p>
        </div>
      ) : (
        projects.map((project) => {
          const isExpanded = expandedProjects.has(project.project_id)
          const taskCount = project.tasks.length
          const completedCount = project.tasks.filter(t => t.is_completed).length
          const uncompletedCount = taskCount - completedCount
          const showCompletedTasks = showCompleted.has(project.project_id)
          const visibleTasks = showCompletedTasks 
            ? project.tasks 
            : project.tasks.filter(t => !t.is_completed)
          const isMiscellaneous = project.project_name === 'Miscellaneous'

          return (
            <div
              key={project.project_id}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
            >
              {/* Project Header - Clickable to expand/collapse */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleProject(project.project_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleProject(project.project_id)
                  }
                }}
                className="group w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                      {project.project_name}
                    </h2>
                    {project.project_description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {project.project_description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-2">
                    {uncompletedCount > 0 && (
                      <span className="font-medium text-black dark:text-zinc-50">
                        {uncompletedCount} active
                      </span>
                    )}
                    {completedCount > 0 && (
                      <span className={`flex items-center gap-1.5 ${uncompletedCount > 0 ? 'ml-2' : ''}`}>
                        <span>{completedCount} completed</span>
                        <button
                          onClick={(e) => toggleCompletedVisibility(project.project_id, e)}
                          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                          title={showCompletedTasks ? 'Hide completed tasks' : 'Show completed tasks'}
                        >
                          {showCompletedTasks ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </span>
                    )}
                    {taskCount === 0 && <span>No tasks</span>}
                  </span>

                  {/* Delete Project (shows on hover). Miscellaneous is not deletable. */}
                  {!isMiscellaneous && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteError(null)
                        setDeleteTarget({ id: project.project_id, name: project.project_name })
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      title="Delete project"
                      aria-label="Delete project"
                    >
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m3-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks List - Shown when expanded */}
              {isExpanded && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
                  {visibleTasks.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                      <p>{showCompletedTasks ? 'No tasks in this project yet.' : 'No active tasks in this project.'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visibleTasks.map((task) => (
                        <TaskItem
                          key={task.task_id}
                          task={task}
                          onProjectClick={handleProjectClick}
                          onLocationClick={handleLocationClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}

      <DeleteProjectModal
        isOpen={!!deleteTarget}
        projectName={deleteTarget?.name || ''}
        isLoading={isDeleting}
        error={deleteError}
        onCancel={() => {
          if (isDeleting) return
          setDeleteTarget(null)
          setDeleteError(null)
        }}
        onConfirm={async () => {
          if (!deleteTarget) return
          setIsDeleting(true)
          setDeleteError(null)
          try {
            await deleteProject(deleteTarget.id)
            // Close modal and refresh data
            setDeleteTarget(null)
            // Remove from expanded state locally to avoid stale UI while refresh happens
            setExpandedProjects((prev) => {
              const next = new Set(prev)
              next.delete(deleteTarget.id)
              return next
            })
            router.refresh()
          } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete project')
          } finally {
            setIsDeleting(false)
          }
        }}
      />
    </div>
  )
}

