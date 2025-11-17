import { getTasks, getProjects } from '@/app/actions/tasks'
import { AddTaskForm } from '@/app/components/AddTaskForm'

export default async function Home() {
  const tasks = await getTasks()
  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
          Tasks
        </h1>

        {/* Add Task Form */}
        <div className="mb-8">
          <AddTaskForm projects={projects} />
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
              <p className="text-lg">No tasks yet. Create your first task above!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.task_id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-black dark:text-zinc-50">
                      {task.task_description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span>Project: {task.projects.project_name}</span>
                      {task.priorities && (
                        <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                          {task.priorities.priority_level}
                        </span>
                      )}
                      <span>
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
