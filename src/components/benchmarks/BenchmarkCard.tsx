'use client'

import { cn } from '@/lib/utils'
import type { ComparaisonRatio } from '@/lib/calculations/benchmarks'
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'

interface BenchmarkCardProps {
  comparaison: ComparaisonRatio
  className?: string
}

export function BenchmarkCard({ comparaison, className }: BenchmarkCardProps) {
  const { nom, valeur, mediane, ecart, position, quartile, message, unite, inversement } = comparaison

  // Déterminer la couleur selon la position
  const getPositionColor = () => {
    if (mediane === null) return 'text-muted-foreground'
    if (position === 'SUPERIEUR') return 'text-emerald-600'
    if (position === 'INFERIEUR') return 'text-red-500'
    return 'text-amber-500'
  }

  const getPositionBg = () => {
    if (mediane === null) return 'bg-muted/50'
    if (position === 'SUPERIEUR') return 'bg-emerald-50 dark:bg-emerald-950/30'
    if (position === 'INFERIEUR') return 'bg-red-50 dark:bg-red-950/30'
    return 'bg-amber-50 dark:bg-amber-950/30'
  }

  const getPositionIcon = () => {
    if (mediane === null) return <AlertCircle className="h-4 w-4" />
    if (position === 'SUPERIEUR') return <TrendingUp className="h-4 w-4" />
    if (position === 'INFERIEUR') return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getQuartileLabel = () => {
    if (inversement) {
      // Pour les ratios inversés, Q1 = meilleur
      switch (quartile) {
        case 1: return 'Top 25%'
        case 2: return '25-50%'
        case 3: return '50-75%'
        case 4: return 'Bottom 25%'
      }
    } else {
      switch (quartile) {
        case 1: return 'Bottom 25%'
        case 2: return '25-50%'
        case 3: return '50-75%'
        case 4: return 'Top 25%'
      }
    }
  }

  const formatValue = (val: number) => {
    if (unite === 'jours') return `${Math.round(val)} j`
    return `${val.toFixed(1)}%`
  }

  return (
    <div className={cn(
      'rounded-xl border border-border p-4 transition-shadow hover:shadow-sm',
      getPositionBg(),
      className
    )}>
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-sm text-foreground">{nom}</h3>
        <span className={cn(
          'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
          getPositionColor(),
          position === 'SUPERIEUR' && 'bg-emerald-100 dark:bg-emerald-900/50',
          position === 'INFERIEUR' && 'bg-red-100 dark:bg-red-900/50',
          position === 'ALIGNE' && 'bg-amber-100 dark:bg-amber-900/50',
          mediane === null && 'bg-muted'
        )}>
          {getPositionIcon()}
          {getQuartileLabel()}
        </span>
      </div>

      {/* Valeurs */}
      <div className="flex items-end gap-4 mb-3">
        <div>
          <div className="text-2xl font-bold text-foreground">
            {formatValue(valeur)}
          </div>
          <div className="text-xs text-muted-foreground">Votre valeur</div>
        </div>

        {mediane !== null && (
          <div className="text-right">
            <div className="text-lg font-medium text-muted-foreground">
              {formatValue(mediane)}
            </div>
            <div className="text-xs text-muted-foreground">Médiane secteur</div>
          </div>
        )}
      </div>

      {/* Écart */}
      {ecart !== null && (
        <div className={cn(
          'text-sm font-medium mb-2',
          getPositionColor()
        )}>
          {ecart > 0 ? '+' : ''}{formatValue(ecart)} vs médiane
        </div>
      )}

      {/* Message */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {message}
      </p>

      {/* Barre de progression (quartiles) */}
      {mediane !== null && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((q) => (
              <div
                key={q}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  q <= quartile
                    ? position === 'SUPERIEUR'
                      ? 'bg-emerald-500'
                      : position === 'INFERIEUR'
                        ? 'bg-red-400'
                        : 'bg-amber-400'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">Q1</span>
            <span className="text-[10px] text-muted-foreground">Q4</span>
          </div>
        </div>
      )}
    </div>
  )
}
