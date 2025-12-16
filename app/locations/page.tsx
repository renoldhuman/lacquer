import { getLocationsWithTasks } from '@/app/actions/tasks'
import { LocationsList } from '@/app/components/LocationsList'

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic'

export default async function LocationsPage() {
  const locations = await getLocationsWithTasks()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
          Locations
        </h1>

        <LocationsList locations={locations} />
      </div>
    </div>
  )
}

