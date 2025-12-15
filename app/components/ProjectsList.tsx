'use client'

import { useState } from 'react'
import { TaskItem } from './TaskItem'

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

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
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

          return (
            <div
              key={project.project_id}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
            >
              {/* Project Header - Clickable to expand/collapse */}
              <button
                onClick={() => toggleProject(project.project_id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
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
                  <span>
                    {uncompletedCount > 0 && (
                      <span className="font-medium text-black dark:text-zinc-50">
                        {uncompletedCount} active
                      </span>
                    )}
                    {completedCount > 0 && (
                      <span className={uncompletedCount > 0 ? 'ml-2' : ''}>
                        {completedCount} completed
                      </span>
                    )}
                    {taskCount === 0 && <span>No tasks</span>}
                  </span>
                </div>
              </button>

              {/* Tasks List - Shown when expanded */}
              {isExpanded && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
                  {project.tasks.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                      <p>No tasks in this project yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {project.tasks.map((task) => (
                        <TaskItem
                          key={task.task_id}
                          task={task}
                          onProjectClick={handleProjectClick}
                          onLocationClick={handleLocationClick}
                          showProject={false}
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
    </div>
  )
}

