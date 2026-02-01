'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-muted-foreground">Chargement de la carte...</div>
})

interface Concurrent {
    nom: string
    adresse: string
    latitude?: number
    longitude?: number
    [key: string]: any
}

interface CarteConcurrentsProps {
    center: [number, number]
    radius?: number
    concurrents: Concurrent[]
}

export function CarteConcurrents({ center, radius, concurrents }: CarteConcurrentsProps) {
    const markers = [
        // Projet
        {
            position: center,
            title: "Votre Emplacement",
            description: "Zone d'implantation du projet",
            isHome: true
        },
        // Concurrents
        ...concurrents
            .filter(c => c.latitude && c.longitude)
            .map(c => ({
                position: [c.latitude!, c.longitude!] as [number, number],
                title: c.nom,
                description: c.adresse,
                isHome: false
            }))
    ]

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Carte de la concurrence</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-[400px]">
                <LeafletMap
                    center={center}
                    zoom={13}
                    radius={radius}
                    markers={markers}
                />
            </CardContent>
        </Card>
    )
}
