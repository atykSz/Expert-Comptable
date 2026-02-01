'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix for default marker icon missing assets in Leaflet + Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png'

// Custom icons
const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const homeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface LeafletMapProps {
    center: [number, number]
    zoom?: number
    radius?: number // en km
    markers?: {
        position: [number, number]
        title: string
        description?: string
        isHome?: boolean
    }[]
}

export default function LeafletMap({ center, zoom = 13, radius, markers = [] }: LeafletMapProps) {

    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Zone de chalandise */}
            {radius && (
                <Circle
                    center={center}
                    radius={radius * 1000}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                />
            )}

            {/* Marqueurs */}
            {markers.map((marker, idx) => (
                <Marker
                    key={idx}
                    position={marker.position}
                    icon={marker.isHome ? homeIcon : defaultIcon}
                >
                    <Popup>
                        <div className="font-semibold">{marker.title}</div>
                        {marker.description && <div className="text-sm">{marker.description}</div>}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
