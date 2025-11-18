import { getUserAutoLocationFilter } from '@/app/actions/tasks'
import { SettingsForm } from '@/app/components/SettingsForm'

export default async function SettingsPage() {
  const autoLocationFilter = await getUserAutoLocationFilter()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
          Settings
        </h1>

        <SettingsForm initialAutoLocationFilter={autoLocationFilter} />
      </div>
    </div>
  )
}

