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
    if (!containerRef.current) return

    let cancelled = false

    // Destroy any stale Leaflet instance on this container
    // (happens when navigating quickly between rides before async init completes)
    const el = containerRef.current as HTMLDivElement & { _leaflet_id?: number }
    if (el._leaflet_id) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapRef.current as any)?.remove()
      } catch (_) { /* ignore */ }
      mapRef.current = null
      delete el._leaflet_id
    }

    async function init() {
      const L = (await import('leaflet')).default
      const polylinePkg = await import('@mapbox/polyline')

      // Bail if we were cancelled while awaiting imports
      if (cancelled || !containerRef.current) return

      const coords = polylinePkg.default.decode(polyline) as [number, number][]
      if (!coords.length) return

      // One more guard — container may have been re-taken by a later effect
      const container = containerRef.current as HTMLDivElement & { _leaflet_id?: number }
      if (container._leaflet_id) return

      const map = L.map(container, { zoomControl: true, attributionControl: true })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const polylineLayer = L.polyline(coords, {
        color: '#6366f1',
        weight: 3.5,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(map)

      const startIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        className: '',
        iconAnchor: [6, 6],
      })

      const finishIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        className: '',
        iconAnchor: [6, 6],
      })

      L.marker(coords[0], { icon: startIcon }).addTo(map).bindTooltip('Start', { permanent: false })
      L.marker(coords[coords.length - 1], { icon: finishIcon }).addTo(map).bindTooltip('Finish', { permanent: false })

      map.fitBounds(polylineLayer.getBounds(), { padding: [24, 24] })
    }

    init()

    return () => {
      cancelled = true
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapRef.current as any)?.remove()
      } catch (_) { /* ignore */ }
      mapRef.current = null
    }
  }, [polyline])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border"
      style={{ height: 360 }}
    />
  )
}
