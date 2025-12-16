'use client'

import { ReactNode } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

interface GoogleMapsProviderProps {
  children: ReactNode
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // If no API key, render children without loading the Maps script.
  if (!apiKey) {
    return <>{children}</>
  }

  // Use the official loader with a stable `id` so it only injects the script once.
  // This avoids the “google api is already presented” issue and prevents map/marker
  // instance mismatches that can trigger `InvalidValueError: setMap: not an instance of Map`.
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  })

  if (loadError) {
    return (
      <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-300">
        Failed to load Google Maps.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-4 text-sm text-zinc-700 dark:text-zinc-300">
        Loading Google Maps…
      </div>
    )
  }

  return <>{children}</>
}

