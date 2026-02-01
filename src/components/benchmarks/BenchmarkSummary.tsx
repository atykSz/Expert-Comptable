'use client'

import { cn } from '@/lib/utils'
import type { ResultatBenchmark } from '@/lib/calculations/benchmarks'
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface BenchmarkSummaryProps {
  resultat: ResultatBenchmark
  secteur?: string
  annee?: number
  className?: string
}

export function BenchmarkSummary({
  resultat,
  secteur,
  annee,
  className
}: BenchmarkSummaryProps) {
  const { scoreGlobal, resume, comparaisons } = resultat

  // Couleur du score
  const getScoreColor = () => {
    if (scoreGlobal >= 75) return 'text-emerald-600'
    if (scoreGlobal >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBg = () => {
    if (scoreGlobal >= 75) return 'bg-emerald-50 dark:bg-emerald-950/30'
    if (scoreGlobal >= 50) return 'bg-amber-50 dark:bg-amber-950/30'
    return 'bg-red-50 dark:bg-red-950/30'
  }

  const getScoreLabel = () => {
    if (scoreGlobal >= 75) return 'Excellent'
    if (scoreGlobal >= 60) return 'Bon'
    if (scoreGlobal >= 50) return 'Moyen'
    if (scoreGlobal >= 35) return 'Faible'
    return 'Critique'
  }

  // Compteurs
  const superieurs = comparaisons.filter(c => c.position === 'SUPERIEUR').length
  const inferieurs = comparaisons.filter(c => c.position === 'INFERIEUR').length
  const alignes = comparaisons.filter(c => c.position === 'ALIGNE').length

  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-6',
      className
    )}>
      {/* En-tête */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Positionnement sectoriel</h2>
          </div>
          {secteur && (
            <p className="text-sm text-muted-foreground">
              Secteur : {secteur}
              {annee && ` (données ${annee})`}
            </p>
          )}
        </div>

        {/* Score circulaire */}
        <div className={cn(
          'flex flex-col items-center justify-center w-20 h-20 rounded-full',
          getScoreBg()
        )}>
          <span className={cn('text-2xl font-bold', getScoreColor())}>
            {Math.round(scoreGlobal)}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Label du score */}
      <div className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4',
        getScoreBg(),
        getScoreColor()
      )}>
        {scoreGlobal >= 50 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {getScoreLabel()}
      </div>

      {/* Résumé */}
      <p className="text-sm text-muted-foreground mb-6">
        {resume}
      </p>

      {/* Compteurs par position */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-1 text-emerald-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="font-semibold text-lg">{superieurs}</span>
          </div>
          <span className="text-xs text-muted-foreground">Au-dessus</span>
        </div>

        <div className="flex flex-col items-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-center gap-1 text-amber-500 mb-1">
            <Minus className="h-4 w-4" />
            <span className="font-semibold text-lg">{alignes}</span>
          </div>
          <span className="text-xs text-muted-foreground">Dans la moyenne</span>
        </div>

        <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
          <div className="flex items-center gap-1 text-red-500 mb-1">
            <TrendingDown className="h-4 w-4" />
            <span className="font-semibold text-lg">{inferieurs}</span>
          </div>
          <span className="text-xs text-muted-foreground">En-dessous</span>
        </div>
      </div>
    </div>
  )
}
