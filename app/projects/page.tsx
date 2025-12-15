import { getProjectsWithTasks } from '@/app/actions/tasks'
import { ProjectsList } from '@/app/components/ProjectsList'

export default async function ProjectsPage() {
  const projects = await getProjectsWithTasks()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
          Projects
        </h1>

        <ProjectsList projects={projects} />
      </div>
    </div>
  )
}

