'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { GoogleMap, Marker, Circle } from '@react-google-maps/api'

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

interface Task {
  task_id: string
  task_description: string
  location_id: string | null
  created_at: Date | string
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
  tasks?: Task[]
  userLocation?: {
    latitude: number
    longitude: number
  } | null
}

const defaultCenter = {
  lat: 37.7749, // San Francisco default
  lng: -122.4194,
}

const defaultZoom = 10

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function Map({ 
  center = defaultCenter, 
  zoom = defaultZoom, 
  height = '400px',
  onLocationSelect,
  selectedLocation,
  locations = [],
  tasks = [],
  userLocation = null
}: MapProps) {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)
  const [userLocationIcon, setUserLocationIcon] = useState<google.maps.Icon | undefined>(undefined)
  const infoWindowsRef = useRef<{ [key: string]: google.maps.InfoWindow }>({})
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({})

  // Calculate which locations are within 100m of user
  const nearbyLocations = useMemo(() => {
    if (!userLocation) return []
    
    return locations.filter(location => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude,
        location.longitude
      )
      return distance <= 100 // Within 100 meters
    })
  }, [userLocation, locations])

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
    
    if (typeof window !== 'undefined' && window.google?.maps) {
      setGeocoder(new window.google.maps.Geocoder())
      
      // Create user location icon now that Google Maps API is loaded
      if (window.google.maps.Size && window.google.maps.Point) {
        setUserLocationIcon({
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <text x="16" y="24" font-size="24" text-anchor="middle">😎</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        })
      }
      
      // Fit bounds to show all locations if they exist
      if (locations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        locations.forEach(location => {
          bounds.extend(new window.google.maps.LatLng(location.latitude, location.longitude))
        })
        
        // If there's only one location, add padding to bounds to show surrounding area
        // and limit max zoom to 18 (good for seeing buildings across the street)
        if (locations.length === 1) {
          // Add padding to the bounds to ensure surrounding area is visible
          const padding = 0.002 // degrees (roughly 200 meters)
          const location = locations[0]
          bounds.extend(new window.google.maps.LatLng(location.latitude + padding, location.longitude + padding))
          bounds.extend(new window.google.maps.LatLng(location.latitude - padding, location.longitude - padding))
        }
        
        // Fit the map to the bounds
        mapInstance.fitBounds(bounds)
        
        // Get the center and zoom after fitting bounds
        const newCenter = bounds.getCenter()
        setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() })
        
        // Add a small delay to get the zoom level after fitBounds
        setTimeout(() => {
          let calculatedZoom = mapInstance.getZoom() || zoom
          
          // If there's only one location, cap the zoom at 18 to show surrounding detail
          if (locations.length === 1 && calculatedZoom > 18) {
            calculatedZoom = 18
            mapInstance.setZoom(18)
          }
          
          setMapZoom(calculatedZoom)
        }, 100)
      }
    }
  }, [locations, zoom])

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

  const handleFitBounds = useCallback(() => {
    if (!map || locations.length === 0) return

    if (typeof window !== 'undefined' && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds()
      locations.forEach(location => {
        bounds.extend(new window.google.maps.LatLng(location.latitude, location.longitude))
      })

      // If there's only one location, add padding to bounds to show surrounding area
      // and limit max zoom to 18 (good for seeing buildings across the street)
      if (locations.length === 1) {
        const padding = 0.002 // degrees (roughly 200 meters)
        const location = locations[0]
        bounds.extend(new window.google.maps.LatLng(location.latitude + padding, location.longitude + padding))
        bounds.extend(new window.google.maps.LatLng(location.latitude - padding, location.longitude - padding))
      }

      // Fit the map to the bounds
      map.fitBounds(bounds)

      // If there's only one location, cap the zoom at 18
      setTimeout(() => {
        if (locations.length === 1) {
          const currentZoom = map.getZoom() || zoom
          if (currentZoom > 18) {
            map.setZoom(18)
            setMapZoom(18)
          } else {
            setMapZoom(currentZoom)
          }
        } else {
          setMapZoom(map.getZoom() || zoom)
        }
        
        const newCenter = bounds.getCenter()
        setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() })
      }, 100)
    }
  }, [map, locations, zoom])

  // Group tasks by location_id
  const tasksByLocation = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {}
    tasks.forEach((task: Task) => {
      if (task.location_id) {
        if (!grouped[task.location_id]) {
          grouped[task.location_id] = []
        }
        grouped[task.location_id].push(task)
      }
    })
    // Sort tasks by created_at (most recent first) and limit to 5
    Object.keys(grouped).forEach((locationId: string) => {
      const locationTasks = grouped[locationId]
      locationTasks.sort((a: Task, b: Task) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      })
      grouped[locationId] = locationTasks.slice(0, 5)
    })
    return grouped
  }, [tasks])

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Create InfoWindow content for a location
  const createInfoWindowContent = useCallback((location: LocationPin) => {
    const shortLocationName = location.location_name.split(',')[0].trim()
    const locationTasks = tasksByLocation[location.location_id] || []
    
    let content = `<div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px; min-width: 200px;" onmouseover="this.parentElement.parentElement.style.pointerEvents='auto'" onmouseout="this.parentElement.parentElement.style.pointerEvents='none'">
      <div style="font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; color: #111827;">${escapeHtml(shortLocationName)}</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        `
    
    locationTasks.forEach((task: Task, index: number) => {
      const truncatedTask = task.task_description.length > 20 
        ? task.task_description.substring(0, 20) + '...'
        : task.task_description
      content += `
        <tr>
          <td style="padding: 4px 0; color: #111827;">${escapeHtml(truncatedTask)}</td>
        </tr>`
    })
    
    content += `</table></div>`
    return content
  }, [tasksByLocation])

  // Handle marker click to show InfoWindow
  const handleMarkerClick = useCallback((location: LocationPin) => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return

    const marker = markersRef.current[location.location_id]
    if (!marker) return

    // Close all other info windows
    Object.values(infoWindowsRef.current).forEach((infoWindow: google.maps.InfoWindow) => infoWindow.close())

    // Create or get InfoWindow for this location
    let infoWindow = infoWindowsRef.current[location.location_id]
    if (!infoWindow) {
      infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(location),
        disableAutoPan: false
      })
      infoWindowsRef.current[location.location_id] = infoWindow
    } else {
      infoWindow.setContent(createInfoWindowContent(location))
    }

    // Open InfoWindow at marker position
    infoWindow.open(map, marker)
  }, [map, createInfoWindowContent])

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
    <div className="relative w-full" style={{ height }}>
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentMarkerPosition || mapCenter}
            zoom={mapZoom}
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
            
            // Extract first part of location name (before comma) for tooltip
            const shortLocationName = location.location_name.split(',')[0].trim()
            
            // Only use custom icon if google.maps is available (client-side)
            const icon = typeof window !== 'undefined' && window.google?.maps?.SymbolPath
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }
              : undefined
            
            return (
              <Marker
                key={location.location_id}
                position={{ lat: location.latitude, lng: location.longitude }}
                title={shortLocationName}
                icon={isSelected ? undefined : icon}
                onClick={() => handleMarkerClick(location)}
                onLoad={(marker: google.maps.Marker) => {
                  // Store marker reference
                  if (marker) {
                    markersRef.current[location.location_id] = marker
                  }
                }}
              />
            )
          })}
          
          {/* Circles for locations within 100m of user */}
          {userLocation && nearbyLocations.map((location) => (
            <Circle
              key={`circle-${location.location_id}`}
              center={{ lat: location.latitude, lng: location.longitude }}
              radius={100} // 100 meters in meters
              options={{
                fillColor: '#3b82f6', // Blue
                fillOpacity: 0.2, // Translucent
                strokeColor: '#3b82f6', // Blue border
                strokeOpacity: 0.5,
                strokeWeight: 2,
                clickable: false,
                zIndex: 1,
              }}
            />
          ))}

          {/* User location marker */}
          {userLocation && userLocationIcon && (
            <Marker
              position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
              icon={userLocationIcon}
              title="Your location"
            />
          )}
          {/* Selected location marker (if different from permanent pins) */}
          {currentMarkerPosition && !locations.some(loc => 
            Math.abs(loc.latitude - currentMarkerPosition.lat) < 0.0001 &&
            Math.abs(loc.longitude - currentMarkerPosition.lng) < 0.0001
          ) && (
            <Marker position={currentMarkerPosition} />
          )}
        </GoogleMap>
        
        {/* Fit Bounds Button */}
        {locations.length > 0 && (
          <button
            type="button"
            onClick={handleFitBounds}
            className="absolute top-4 right-4 z-10 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 text-black dark:text-zinc-50 text-sm font-medium transition-colors flex items-center gap-2"
            title="Show all locations"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Fit All
          </button>
        )}
      </div>
  )
}

