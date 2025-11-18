'use client'

import { ReactNode, useEffect, useState } from 'react'
import { LoadScript } from '@react-google-maps/api'

interface GoogleMapsProviderProps {
  children: ReactNode
}

// Check if Google Maps script is already in the DOM
function isGoogleMapsScriptLoaded(): boolean {
  if (typeof window === 'undefined') return false
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
  return scripts.length > 0 || !!(window.google?.maps?.Map)
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [scriptAlreadyLoaded, setScriptAlreadyLoaded] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    // Check if script is already loaded
    if (isGoogleMapsScriptLoaded()) {
      setScriptAlreadyLoaded(true)
    }
  }, [])

  // If no API key, render children without LoadScript
  if (!apiKey) {
    return <>{children}</>
  }

  // If script is already loaded, we still need LoadScript for context
  // but we'll suppress the duplicate loading error
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={['places']}
      loadingElement={<div>Loading...</div>}
      onError={(error: Error | string) => {
        // Suppress "google api is already presented" error
        const errorMessage = typeof error === 'string' ? error : error?.message || ''
        if (errorMessage.includes('already presented')) {
          // Script is already loaded, which is fine
          return
        }
        console.error('Error loading Google Maps API:', error)
      }}
    >
      {children}
    </LoadScript>
  )
}

