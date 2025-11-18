import { getTasks, getProjects, getLocations } from '@/app/actions/tasks'
import { TaskMapForm } from '@/app/components/TaskMapForm'
import { TaskList } from '@/app/components/TaskList'

export default async function Home() {
  const tasks = await getTasks()
  const projects = await getProjects()
  const locations = await getLocations()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
          Tasks
        </h1>

        {/* Interactive Map and Task Form */}
        <TaskMapForm projects={projects} locations={locations} />

        {/* Tasks List */}
        <TaskList tasks={tasks} />
      </div>
    </div>
  )
}
