'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import nafData from '@/lib/data/naf-codes.json'

const NAF_CODES = nafData as { value: string; label: string }[]

interface SelecteurNAFProps {
    value: string
    onSelect: (value: string, label: string) => void
}

export function SelecteurNAF({ value, onSelect }: SelecteurNAFProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const filteredCodes = query === ''
        ? NAF_CODES
        : NAF_CODES.filter((naf) =>
            naf.label.toLowerCase().includes(query.toLowerCase()) ||
            naf.value.toLowerCase().includes(query.toLowerCase())
        )

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedLabel = NAF_CODES.find((naf) => naf.value === value)?.label

    return (
        <div className="relative w-full" ref={containerRef}>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                onClick={() => setOpen(!open)}
            >
                {value ? selectedLabel : "Sélectionner une activité (NAF)..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute z-10 mt-1 w-full bg-card rounded-md border shadow-lg max-h-[300px] flex flex-col">
                    <div className="p-2 border-b">
                        <Input
                            placeholder="Rechercher code ou libellé..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                            className="h-8"
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1 max-h-[200px]">
                        {filteredCodes.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Aucune activité trouvée.
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {filteredCodes.map((naf) => (
                                    <li
                                        key={naf.value}
                                        className={cn(
                                            "px-2 py-2 flex items-center justify-between cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground text-sm",
                                            value === naf.value && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={() => {
                                            onSelect(naf.value, naf.label)
                                            setOpen(false)
                                            setQuery('')
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <span className="font-mono text-xs text-muted-foreground mr-2 bg-secondary px-1 rounded">
                                                {naf.value}
                                            </span>
                                            <span>{naf.label}</span>
                                        </div>
                                        {value === naf.value && <Check className="h-4 w-4" />}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
