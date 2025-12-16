'use client'

import { ReactNode, useEffect } from 'react'
import { LoadScript } from '@react-google-maps/api'

interface GoogleMapsProviderProps {
  children: ReactNode
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Suppress the "google api is already presented" console error
  useEffect(() => {
    const originalError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      // Filter out the "google api is already presented" error
      if (message.includes('google api is already presented')) {
        return // Don't log this error
      }
      // Log all other errors normally
      originalError.apply(console, args)
    }

    return () => {
      // Restore original console.error on unmount
      console.error = originalError
    }
  }, [])

  // If no API key, render children without LoadScript
  if (!apiKey) {
    return <>{children}</>
  }

  // Always use LoadScript to provide context
  // It will handle the case where script is already loaded
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={['places']}
      loadingElement={<div>Loading...</div>}
      onError={(error: Error | string) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || ''
        // Suppress "google api is already presented" error - this is expected
        // when the script is already loaded (e.g., during hot reload)
        if (
          errorMessage.includes('already presented') ||
          errorMessage.includes('already loaded')
        ) {
          // Silently ignore - script is already loaded, which is fine
          return
        }
        // Only log actual errors
        console.error('Error loading Google Maps API:', error)
      }}
    >
      {children}
    </LoadScript>
  )
}

