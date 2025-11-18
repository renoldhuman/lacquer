'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Map, type LocationData } from './Map'
import { AddTaskForm } from './AddTaskForm'

interface Project {
  project_id: string
  project_name: string
}

interface Location {
  location_id: string
  location_name: string
  latitude: number
  longitude: number
}

interface TaskMapFormProps {
  projects: Project[]
  locations: Location[]
}

export function TaskMapForm({ projects, locations }: TaskMapFormProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const router = useRouter()

  const handleProjectCreated = () => {
    // Refresh the page to get updated projects list
    router.refresh()
  }

  return (
    <>
      {/* Interactive Map */}
      <div className="mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <Map height="400px" onLocationSelect={setLocation} selectedLocation={location} locations={locations} />
        </div>
      </div>

      {/* Add Task Form */}
      <div className="mb-8">
        <AddTaskForm 
          projects={projects} 
          location={location} 
          onLocationSelect={setLocation}
          onLocationClear={() => setLocation(null)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </>
  )
}

