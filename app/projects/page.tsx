import { getProjectsWithTasks } from '@/app/actions/tasks'
import { ProjectsList } from '@/app/components/ProjectsList'
import { ProjectsHeader } from '@/app/components/ProjectsHeader'

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await getProjectsWithTasks()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProjectsHeader />

        <ProjectsList projects={projects} />
      </div>
    </div>
  )
}

