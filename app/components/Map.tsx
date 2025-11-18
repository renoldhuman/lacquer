'use client'

import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

export interface LocationData {
  address: string
  lat: number
  lng: number
}

interface MapProps {
  center?: {
    lat: number
    lng: number
  }
  zoom?: number
  height?: string
  onLocationSelect?: (location: LocationData) => void
  selectedLocation?: LocationData | null
}

const defaultCenter = {
  lat: 37.7749, // San Francisco default
  lng: -122.4194,
}

const defaultZoom = 10

export function Map({ 
  center = defaultCenter, 
  zoom = defaultZoom, 
  height = '400px',
  onLocationSelect,
  selectedLocation
}: MapProps) {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const mapContainerStyle = useMemo(
    () => ({
      width: '100%',
      height: height,
    }),
    [height]
  )

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
    setGeocoder(new google.maps.Geocoder())
  }, [])

  // Initialize autocomplete when map and input are ready
  useEffect(() => {
    if (map && searchInputRef.current && !autocomplete) {
      const autocompleteInstance = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'geometry'],
      })

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace()
        
        if (!place.geometry || !place.geometry.location || !onLocationSelect) return

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const position = { lat, lng }
        const address = place.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

        setMarkerPosition(position)
        onLocationSelect({ address, lat, lng })

        // Center map on selected location
        map.setCenter(position)
        map.setZoom(15)
      })

      setAutocomplete(autocompleteInstance)
    }
  }, [map, autocomplete, onLocationSelect])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !geocoder || !onLocationSelect) return

    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    const position = { lat, lng }
    
    setMarkerPosition(position)

    // Reverse geocode to get address
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        // Get formatted address
        const address = results[0].formatted_address
        onLocationSelect({ address, lat, lng })
      } else {
        // If geocoding fails, use coordinates
        const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        onLocationSelect({ address, lat, lng })
      }
    })
  }, [geocoder, onLocationSelect])

  // Update marker position when selectedLocation changes externally
  const currentMarkerPosition = selectedLocation 
    ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
    : markerPosition

  if (!apiKey) {
    return (
      <div
        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-8">
          <p className="text-zinc-600 dark:text-zinc-400 mb-2">
            Google Maps API key not configured
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </div>
    )
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      libraries={['places']}
    >
      <div className="relative">
        {/* Search Input */}
        <div className="absolute top-4 left-4 z-10 w-1/3 max-w-xs">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for an address..."
            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 shadow-lg"
          />
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentMarkerPosition || center}
          zoom={zoom}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            scaleControl: false,
            rotateControl: false,
            panControl: false,
          }}
        >
          {currentMarkerPosition && (
            <Marker position={currentMarkerPosition} />
          )}
        </GoogleMap>
      </div>
    </LoadScript>
  )
}

