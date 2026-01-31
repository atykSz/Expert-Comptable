'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface AdresseSuggestion {
    properties: {
        label: string
        id: string
        city: string
        postcode: string
        x: number
        y: number
    }
    geometry: {
        coordinates: [number, number]
    }
}

interface AdresseAutocompleteProps {
    onSelect: (adresse: {
        label: string
        codePostal: string
        commune: string
        coordinates: [number, number]
    }) => void
}

export function AdresseAutocomplete({ onSelect }: AdresseAutocompleteProps) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<AdresseSuggestion[]>([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([])
            return
        }

        // Si l'utilisateur a sélectionné une adresse (query correspond exactement), on évite de recharger
        // Mais ici on utilise showSuggestions pour gérer ça plus proprement

        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const response = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
                )
                const data = await response.json()
                setSuggestions(data.features || [])
                // Si on a des résultats et qu'on est en train de taper (le focus est normalement dessus), on affiche
                setShowSuggestions(true)
            } catch (error) {
                console.error('Erreur API Adresse:', error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Saisissez une adresse ou une ville..."
                    className="pl-9"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setShowSuggestions(true)
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true)
                    }}
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card text-card-foreground rounded-md border shadow-md">
                    <ul className="py-1">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.properties.id}
                                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm flex items-center gap-2"
                                onClick={() => {
                                    const props = suggestion.properties
                                    setQuery(props.label) // Update input with selected address
                                    onSelect({
                                        label: props.label,
                                        codePostal: props.postcode,
                                        commune: props.city,
                                        coordinates: suggestion.geometry.coordinates,
                                    })
                                    setShowSuggestions(false)
                                }}
                            >
                                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="truncate">{suggestion.properties.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
