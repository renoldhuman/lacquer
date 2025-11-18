'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

export interface LocationData {
  address: string
  lat: number
  lng: number
}

interface LocationPin {
  location_id: string
  location_name: string
  latitude: number
  longitude: number
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
  locations?: LocationPin[]
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
  selectedLocation,
  locations = []
}: MapProps) {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

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

  // Update map center when location is selected from form
  useEffect(() => {
    if (selectedLocation && map) {
      const position = { lat: selectedLocation.lat, lng: selectedLocation.lng }
      map.setCenter(position)
      map.setZoom(15)
      setMarkerPosition(position)
    }
  }, [selectedLocation, map])

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
          {/* Permanent location pins */}
          {locations.map((location) => {
            const isSelected = selectedLocation && 
              Math.abs(location.latitude - selectedLocation.lat) < 0.0001 &&
              Math.abs(location.longitude - selectedLocation.lng) < 0.0001
            
            // Use default marker for selected location, custom icon for others
            if (isSelected) {
              return (
                <Marker
                  key={location.location_id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  title={location.location_name}
                />
              )
            }
            
            return (
              <Marker
                key={location.location_id}
                position={{ lat: location.latitude, lng: location.longitude }}
                title={location.location_name}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
            )
          })}
          
          {/* Selected location marker (if different from permanent pins) */}
          {currentMarkerPosition && !locations.some(loc => 
            Math.abs(loc.latitude - currentMarkerPosition.lat) < 0.0001 &&
            Math.abs(loc.longitude - currentMarkerPosition.lng) < 0.0001
          ) && (
            <Marker position={currentMarkerPosition} />
          )}
        </GoogleMap>
    </LoadScript>
  )
}

