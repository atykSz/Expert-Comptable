'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SelecteurNAF } from '@/components/etude-marche/SelecteurNAF'
import { RadarChartComponent } from '@/components/charts'
import { BenchmarkCard } from './BenchmarkCard'
import { BenchmarkSummary } from './BenchmarkSummary'
import type { ResultatBenchmark, RatiosEntreprise } from '@/lib/calculations/benchmarks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Target, BarChart3, Info, AlertTriangle } from 'lucide-react'

export interface BenchmarkViewProps {
  resultat: ResultatBenchmark
  ratios: RatiosEntreprise
  secteur: {
    codeNAF: string
    libelle: string
    annee: number
    nbEntreprises?: number
    source?: string
  }
  previsionnelId: string
  currentNAF: string
}

export function BenchmarkView({
  resultat,
  ratios: _ratios,
  secteur,
  previsionnelId: _previsionnelId,
  currentNAF
}: BenchmarkViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleNafChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('naf', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  // ratios and previsionnelId reserved for future use (export, etc.)
  const { comparaisons, radarData } = resultat

  // Séparer les ratios par catégorie
  const ratiosRentabilite = comparaisons.filter(c =>
    ['margeBrute', 'margeNette', 'tauxVA', 'ebeCA'].includes(c.id)
  )
  const ratiosStructure = comparaisons.filter(c =>
    ['tauxEndettement'].includes(c.id)
  )
  const ratiosRotation = comparaisons.filter(c =>
    ['delaiClients', 'delaiFournisseurs'].includes(c.id)
  )

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Benchmarks Sectoriels
          </h1>
          <p className="text-muted-foreground mt-1">
            Comparez vos ratios financiers à votre secteur d&apos;activité
          </p>
        </div>

        {/* Sélecteur de secteur */}
        <div className="w-full md:w-80">
          <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Secteur de comparaison</div>
          <SelecteurNAF
            value={currentNAF}
            onSelect={(val) => handleNafChange(val)}
          />
          {secteur.source && (
            <div className="text-xs text-right text-muted-foreground mt-1">
              Source : {secteur.source} ({secteur.annee})
            </div>
          )}
        </div>
      </div>

      {/* Résumé + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Résumé */}
        <BenchmarkSummary
          resultat={resultat}
          secteur={secteur.libelle}
          annee={secteur.annee}
        />

        {/* Graphique Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Comparaison visuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <RadarChartComponent data={radarData} />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                  <p>Données insuffisantes pour le graphique</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ratios détaillés par catégorie */}

      {/* Rentabilité */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Ratios de rentabilité
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ratiosRentabilite.map((comp) => (
            <BenchmarkCard key={comp.id} comparaison={comp} />
          ))}
        </div>
      </div>

      {/* Structure financière */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Structure financière
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ratiosStructure.map((comp) => (
            <BenchmarkCard key={comp.id} comparaison={comp} />
          ))}
        </div>
      </div>

      {/* Délais de rotation */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          Délais de rotation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ratiosRotation.map((comp) => (
            <BenchmarkCard key={comp.id} comparaison={comp} />
          ))}
        </div>
      </div>

      {/* Note explicative */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Comment lire ces benchmarks ?</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Q1 (25%)</strong> : 25% des entreprises du secteur ont une valeur inférieure
                </li>
                <li>
                  <strong>Médiane (50%)</strong> : Valeur centrale du secteur
                </li>
                <li>
                  <strong>Q3 (75%)</strong> : 75% des entreprises ont une valeur inférieure
                </li>
              </ul>
              <p>
                Pour les ratios de rentabilité, être au-dessus de la médiane est généralement positif.
                Pour le taux d&apos;endettement et les délais clients, être en-dessous est préférable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Affichage quand aucune donnée de benchmark n'est disponible
 */
export function BenchmarkNoData({ codeNAF }: { codeNAF?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">
        Données non disponibles
      </h2>
      <p className="text-muted-foreground max-w-md">
        {codeNAF
          ? `Nous n'avons pas de données de benchmark pour le code NAF ${codeNAF}.`
          : 'Le code NAF du client n\'est pas renseigné.'}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Renseignez un code NAF valide dans les informations du client pour accéder aux benchmarks sectoriels.
      </p>
    </div>
  )
}
