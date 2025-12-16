import { getTasks, getProjects, getLocations, getUserAutoLocationFilter } from '@/app/actions/tasks'
import { TaskMapForm } from '@/app/components/TaskMapForm'
import { TaskList } from '@/app/components/TaskList'
import { GoogleMapsProvider } from '@/app/providers/GoogleMapsProvider'

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic'

export default async function Home() {
  const tasks = await getTasks()
  const projects = await getProjects()
  const locations = await getLocations()
  const autoLocationFilter = await getUserAutoLocationFilter()

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
            Lacquer
          </h1>

          {/* Interactive Map and Task Form */}
          <TaskMapForm projects={projects} locations={locations} tasks={tasks} />

          {/* Tasks List */}
          <TaskList tasks={tasks} autoLocationFilter={autoLocationFilter} />
        </div>
      </div>
    </GoogleMapsProvider>
  )
}
