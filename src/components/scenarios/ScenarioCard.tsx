'use client'

import { TrendingUp, TrendingDown, Trash2, Edit2 } from 'lucide-react'
import { Card } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

interface ScenarioCardProps {
    id: string
    nom: string
    type: string
    couleur: string
    modifCA: number
    modifCharges: number
    resultatNetAn3?: number | null
    tresorerieFinAn3?: number | null
    isDefault?: boolean
    isSelected?: boolean
    onSelect?: () => void
    onEdit?: () => void
    onDelete?: () => void
}

export function ScenarioCard({
    nom,
    type,
    couleur,
    modifCA,
    modifCharges,
    resultatNetAn3,
    tresorerieFinAn3,
    isDefault,
    isSelected,
    onSelect,
    onEdit,
    onDelete
}: ScenarioCardProps) {
    const getTypeIcon = () => {
        switch (type) {
            case 'OPTIMISTE': return '🟢'
            case 'REALISTE': return '🔵'
            case 'PESSIMISTE': return '🔴'
            default: return '🟣'
        }
    }

    return (
        <Card
            variant="bordered"
            className={`p-5 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-offset-2' : ''
                }`}
            style={{
                borderColor: isSelected ? couleur : undefined,
                ['--tw-ring-color' as string]: couleur
            }}
            onClick={onSelect}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon()}</span>
                    <div>
                        <h3 className="font-semibold">{nom}</h3>
                        {isDefault && (
                            <span className="text-xs text-muted-foreground">Base</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1">
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                    )}
                    {onDelete && !isDefault && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1 text-muted-foreground hover:text-danger transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Modificateurs */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">CA</span>
                    <span className={modifCA >= 0 ? 'text-success' : 'text-danger'}>
                        {modifCA >= 0 ? '+' : ''}{modifCA}%
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Charges</span>
                    <span className={modifCharges <= 0 ? 'text-success' : 'text-danger'}>
                        {modifCharges >= 0 ? '+' : ''}{modifCharges}%
                    </span>
                </div>
            </div>

            {/* Résultats */}
            <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Résultat Net A3</span>
                    <span className={`text-sm font-semibold flex items-center gap-1 ${(resultatNetAn3 || 0) >= 0 ? 'text-success' : 'text-danger'
                        }`}>
                        {(resultatNetAn3 || 0) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatCurrency(resultatNetAn3 || 0)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trésorerie A3</span>
                    <span className={`text-sm font-semibold ${(tresorerieFinAn3 || 0) >= 0 ? 'text-accent' : 'text-danger'
                        }`}>
                        {formatCurrency(tresorerieFinAn3 || 0)}
                    </span>
                </div>
            </div>
        </Card>
    )
}
