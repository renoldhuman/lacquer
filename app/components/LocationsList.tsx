'use client'

import { useState } from 'react'
import { TaskItem } from './TaskItem'

interface Location {
  location_id: string
  location_name: string
  latitude: number | null
  longitude: number | null
  radius: number
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

interface LocationsListProps {
  locations: Location[]
}

export function LocationsList({ locations }: LocationsListProps) {
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())
  const [showCompleted, setShowCompleted] = useState<Set<string>>(new Set())

  const toggleLocation = (locationId: string) => {
    const newExpanded = new Set(expandedLocations)
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId)
    } else {
      newExpanded.add(locationId)
    }
    setExpandedLocations(newExpanded)
  }

  const toggleCompletedVisibility = (locationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent expanding/collapsing the location
    const newShowCompleted = new Set(showCompleted)
    if (newShowCompleted.has(locationId)) {
      newShowCompleted.delete(locationId)
    } else {
      newShowCompleted.add(locationId)
    }
    setShowCompleted(newShowCompleted)
  }

  const handleProjectClick = (projectId: string) => {
    // This is just for consistency with TaskItem, but we don't need to filter here
    // since we're already showing tasks grouped by location
  }

  const handleLocationClick = (locationId: string) => {
    // This is just for consistency with TaskItem, but we don't need to filter here
    // since we're already showing tasks grouped by location
  }

  return (
    <div className="space-y-4">
      {locations.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
          <p className="text-lg">No locations yet. Create your first task with a location!</p>
        </div>
      ) : (
        locations.map((location) => {
          const isExpanded = expandedLocations.has(location.location_id)
          const taskCount = location.tasks.length
          const completedCount = location.tasks.filter(t => t.is_completed).length
          const uncompletedCount = taskCount - completedCount
          const showCompletedTasks = showCompleted.has(location.location_id)
          const visibleTasks = showCompletedTasks 
            ? location.tasks 
            : location.tasks.filter(t => !t.is_completed)

          return (
            <div
              key={location.location_id}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
            >
              {/* Location Header - Clickable to expand/collapse */}
              <button
                onClick={() => toggleLocation(location.location_id)}
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
                      {location.location_name}
                    </h2>
                    {location.location_id !== 'anywhere' && location.latitude !== null && location.longitude !== null && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    )}
                    {location.location_id === 'anywhere' && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Tasks without a specific location
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
                          onClick={(e) => toggleCompletedVisibility(location.location_id, e)}
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
                </div>
              </button>

              {/* Tasks List - Shown when expanded */}
              {isExpanded && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
                  {visibleTasks.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                      <p>{showCompletedTasks ? 'No tasks at this location yet.' : 'No active tasks at this location.'}</p>
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
    </div>
  )
}

