'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    L?: any
  }
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const ICON = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const ICON_2X = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const SHADOW = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

let leafletPromise: Promise<any> | null = null

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.async = true
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error('No se pudo cargar el mapa'))
    document.body.appendChild(script)
  })
  return leafletPromise
}

type Props = {
  lat?: number | null
  lng?: number | null
  editable?: boolean
  onChange?: (lat: number, lng: number) => void
  height?: number
}

export default function MapPicker({ lat, lng, editable = false, onChange, height = 220 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)

  const startLat = lat ?? 14.6349
  const startLng = lng ?? -90.5069 // Guatemala City por defecto

  useEffect(() => {
    let cancelled = false
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return
        const map = L.map(containerRef.current).setView([startLat, startLng], lat != null ? 15 : 12)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map)

        const icon = L.icon({
          iconUrl: ICON,
          iconRetinaUrl: ICON_2X,
          shadowUrl: SHADOW,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        const marker = L.marker([startLat, startLng], { draggable: editable, icon }).addTo(map)
        markerRef.current = marker
        mapRef.current = map

        if (editable) {
          marker.on('dragend', () => {
            const p = marker.getLatLng()
            onChange?.(p.lat, p.lng)
          })
          map.on('click', (e: any) => {
            marker.setLatLng(e.latlng)
            onChange?.(e.latlng.lat, e.latlng.lng)
          })
        }
        setReady(true)
        setTimeout(() => map.invalidateSize(), 100)
      })
      .catch(() => setReady(false))

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reposiciona el marcador si cambian lat/lng desde afuera
  useEffect(() => {
    if (ready && mapRef.current && markerRef.current && lat != null && lng != null) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.setView([lat, lng], 15)
    }
  }, [lat, lng, ready])

  const doSearch = async () => {
    if (!search.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(search)}`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      if (data[0]) {
        const la = Number(data[0].lat)
        const lo = Number(data[0].lon)
        markerRef.current?.setLatLng([la, lo])
        mapRef.current?.setView([la, lo], 16)
        onChange?.(la, lo)
      }
    } catch {
      /* noop */
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-2">
      {editable && (
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
            placeholder="Buscar dirección en el mapa..."
            className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={doSearch}
            disabled={searching}
            className="px-4 py-2 bg-primary text-white rounded-lg text-[11px] font-bold tracking-wider disabled:opacity-50"
          >
            {searching ? '...' : 'BUSCAR'}
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full rounded-lg border border-outline-variant overflow-hidden bg-surface-container-high z-0"
      />
      {editable && <p className="text-[11px] text-on-surface-variant">Haz clic en el mapa o arrastra el pin para fijar la ubicación.</p>}
    </div>
  )
}
