'use client'

import { useState } from 'react'
import { TaskItem } from './TaskItem'

interface Task {
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

interface TaskListProps {
  tasks: Task[]
}

type FilterType = 'project' | 'location' | null
type FilterValue = string | null
type SortType = 'A-Z' | 'priority' | 'due-date'

export function TaskList({ tasks }: TaskListProps) {
  const [filterType, setFilterType] = useState<FilterType>(null)
  const [filterValue, setFilterValue] = useState<FilterValue>(null)
  const [showCompleted, setShowCompleted] = useState<boolean>(false)
  const [sortType, setSortType] = useState<SortType>('A-Z')

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

  // Filter tasks based on completion status
  // Include: uncompleted tasks, or completed tasks if showCompleted is true
  const baseTasks = tasks.filter((task) => {
    if (!task.is_completed) return true
    if (showCompleted) return true
    return false
  })
  
  const filteredTasks = baseTasks.filter((task) => {
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
  
  // Sort tasks based on sortType
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortType === 'A-Z') {
      // Sort by task description ascending (A to Z)
      return a.task_description.localeCompare(b.task_description)
    } else if (sortType === 'priority') {
      // Sort by priority level descending (HIGH > MEDIUM > LOW > null)
      const priorityOrder: Record<string, number> = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      const aPriority = a.priorities?.priority_level ? priorityOrder[a.priorities.priority_level] || 0 : 0
      const bPriority = b.priorities?.priority_level ? priorityOrder[b.priorities.priority_level] || 0 : 0
      if (bPriority !== aPriority) {
        return bPriority - aPriority
      }
      // If priorities are equal, fall back to A-Z
      return a.task_description.localeCompare(b.task_description)
    } else if (sortType === 'due-date') {
      // Sort by due date ascending (closest due date first)
      // Tasks without due dates go to the end
      if (!a.due_date && !b.due_date) {
        return a.task_description.localeCompare(b.task_description)
      }
      if (!a.due_date) return 1 // a goes after b
      if (!b.due_date) return -1 // b goes after a
      const aDate = new Date(a.due_date).getTime()
      const bDate = new Date(b.due_date).getTime()
      if (aDate !== bDate) {
        return aDate - bDate // Ascending: earlier dates first
      }
      // If dates are equal, fall back to A-Z
      return a.task_description.localeCompare(b.task_description)
    }
    return 0
  })
  
  // Count uncompleted tasks for display
  const uncompletedCount = baseTasks.filter((task) => !task.is_completed).length
  const filteredUncompletedCount = filteredTasks.filter((task) => !task.is_completed).length

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
            showCompleted
              ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          {showCompleted ? 'Hide' : 'Show'} Completed
        </button>
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          className="px-3 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
        >
          <option value="A-Z">Sort: A-Z</option>
          <option value="priority">Sort: Priority</option>
          <option value="due-date">Sort: Due Date</option>
        </select>
        {filterType && filterValue && (
          <>
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
              Showing {filteredUncompletedCount} of {uncompletedCount} tasks
            </span>
          </>
        )}
      </div>
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
            <p className="text-lg">
              {filterType ? 'No tasks match this filter.' : 'No tasks yet. Create your first task above!'}
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => (
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

