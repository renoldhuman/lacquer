'use client'

import { useState, useTransition } from 'react'
import { updateUserAutoLocationFilter } from '@/app/actions/tasks'

interface SettingsFormProps {
  initialAutoLocationFilter: boolean
}

export function SettingsForm({ initialAutoLocationFilter }: SettingsFormProps) {
  const [autoLocationFilter, setAutoLocationFilter] = useState(initialAutoLocationFilter)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (enabled: boolean) => {
    setAutoLocationFilter(enabled)
    startTransition(async () => {
      try {
        await updateUserAutoLocationFilter(enabled)
      } catch (error) {
        // Revert on error
        setAutoLocationFilter(!enabled)
        console.error('Failed to update setting:', error)
      }
    })
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-1">
            Auto Location Filter
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Automatically filter tasks to show only those within 100m of your current location on page load
          </p>
        </div>
        <div className="ml-6">
          <button
            type="button"
            onClick={() => handleToggle(!autoLocationFilter)}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              autoLocationFilter ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            role="switch"
            aria-checked={autoLocationFilter}
            aria-label="Toggle auto location filter"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                autoLocationFilter ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
      {isPending && (
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">Saving...</p>
      )}
    </div>
  )
}

