'use client'

import { useState } from 'react'
import { Map, type LocationData } from './Map'
import { AddTaskForm } from './AddTaskForm'

interface Project {
  project_id: string
  project_name: string
}

interface TaskMapFormProps {
  projects: Project[]
}

export function TaskMapForm({ projects }: TaskMapFormProps) {
  const [location, setLocation] = useState<LocationData | null>(null)

  return (
    <>
      {/* Interactive Map */}
      <div className="mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <Map height="400px" onLocationSelect={setLocation} selectedLocation={location} />
        </div>
      </div>

      {/* Add Task Form */}
      <div className="mb-8">
        <AddTaskForm projects={projects} location={location} onLocationClear={() => setLocation(null)} />
      </div>
    </>
  )
}

