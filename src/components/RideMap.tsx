'use client'

import { useEffect, useRef } from 'react'

interface RideMapProps {
  polyline: string
  startLatlng: [number, number] | null
}

export function RideMap({ polyline, startLatlng }: RideMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cleanup = () => {}

    async function init() {
      // Dynamically import — Leaflet needs window
      const L = (await import('leaflet')).default

      // Decode Google-encoded polyline
      const polylinePkg = await import('@mapbox/polyline')
      const coords = polylinePkg.default.decode(polyline) as [number, number][]

      if (!coords.length || !containerRef.current) return

      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Draw route
      const polylineLayer = L.polyline(coords, {
        color: '#6366f1',
        weight: 3.5,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(map)

      // Start marker
      const startIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        className: '',
        iconAnchor: [6, 6],
      })

      // Finish marker
      const finishIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        className: '',
        iconAnchor: [6, 6],
      })

      L.marker(coords[0], { icon: startIcon }).addTo(map).bindTooltip('Start', { permanent: false })
      L.marker(coords[coords.length - 1], { icon: finishIcon }).addTo(map).bindTooltip('Finish', { permanent: false })

      map.fitBounds(polylineLayer.getBounds(), { padding: [24, 24] })

      cleanup = () => {
        map.remove()
        mapRef.current = null
      }
    }

    init()
    return () => cleanup()
  }, [polyline])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border"
      style={{ height: 360 }}
    />
  )
}
