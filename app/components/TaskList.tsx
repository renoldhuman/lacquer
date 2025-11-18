'use client'

import { useState } from 'react'
import { TaskItem } from './TaskItem'

interface Task {
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

interface TaskListProps {
  tasks: Task[]
}

type FilterType = 'project' | 'location' | null
type FilterValue = string | null

export function TaskList({ tasks }: TaskListProps) {
  const [filterType, setFilterType] = useState<FilterType>(null)
  const [filterValue, setFilterValue] = useState<FilterValue>(null)

  const handleProjectFilter = (projectId: string) => {
    if (filterType === 'project' && filterValue === projectId) {
      // Clear filter if clicking the same project
      setFilterType(null)
      setFilterValue(null)
    } else {
      setFilterType('project')
      setFilterValue(projectId)
    }
  }

  const handleLocationFilter = (locationId: string) => {
    if (filterType === 'location' && filterValue === locationId) {
      // Clear filter if clicking the same location
      setFilterType(null)
      setFilterValue(null)
    } else {
      setFilterType('location')
      setFilterValue(locationId)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (!filterType || !filterValue) return true
    
    if (filterType === 'project') {
      return task.project_id === filterValue
    }
    
    if (filterType === 'location') {
      // Compare using task.location_id (the foreign key on the task)
      // This should match the location_id passed from the click handler
      return task.location_id === filterValue
    }
    
    return true
  })

  return (
    <>
      {filterType && filterValue && (
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => {
              setFilterType(null)
              setFilterValue(null)
            }}
            className="px-3 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Clear filter
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>
      )}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
            <p className="text-lg">
              {filterType ? 'No tasks match this filter.' : 'No tasks yet. Create your first task above!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.task_id}
              task={task}
              onProjectClick={handleProjectFilter}
              onLocationClick={handleLocationFilter}
              activeProjectFilter={filterType === 'project' ? filterValue : null}
              activeLocationFilter={filterType === 'location' ? filterValue : null}
            />
          ))
        )}
      </div>
    </>
  )
}

