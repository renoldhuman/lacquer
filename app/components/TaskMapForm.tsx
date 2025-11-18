'use client'

import { useState, useEffect } from 'react'
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

interface Task {
  task_id: string
  task_description: string
  location_id: string | null
  created_at: Date | string
}

interface TaskMapFormProps {
  projects: Project[]
  locations: Location[]
  tasks: Task[]
}

export function TaskMapForm({ projects, locations, tasks }: TaskMapFormProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const router = useRouter()

  // Request location permission and get user's location on page load
  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        console.error('Error getting location:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  const handleProjectCreated = () => {
    // Refresh the page to get updated projects list
    router.refresh()
  }

  return (
    <>
      {/* Interactive Map */}
      <div className="mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <Map height="400px" onLocationSelect={setLocation} selectedLocation={location} locations={locations} tasks={tasks} userLocation={userLocation} />
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
          previousLocations={locations}
        />
      </div>
    </>
  )
}

