'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'

interface ScenarioData {
    nom: string
    type: string
    couleur: string
    modifCA: number
    modifCharges: number
    resultatNetAn1?: number | null
    resultatNetAn3?: number | null
    tresorerieFinAn3?: number | null
    resultats?: {
        annees: number[]
        ca: number[]
        resultatNet: number[]
        tresorerieFin: number[]
    }
}

interface ScenarioSectionProps {
    scenarios: ScenarioData[]
    annees?: number[]
}

export function ScenarioSection({ scenarios, annees = [2026, 2027, 2028] }: ScenarioSectionProps) {
    if (!scenarios || scenarios.length === 0) {
        return (
            <section className="mb-10 page-break-inside-avoid">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-[#c9a227]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[#1e3a5f]">Analyse des Scénarios</h2>
                        <p className="text-sm text-gray-500">Aucun scénario configuré</p>
                    </div>
                </div>
                <Card variant="bordered" className="p-6 text-center">
                    <p className="text-gray-500">
                        Aucun scénario n'a été créé pour ce prévisionnel.
                        Vous pouvez créer des scénarios depuis la page dédiée.
                    </p>
                </Card>
            </section>
        )
    }

    // Calculer les totaux par scénario
    const scenariosAvecTotaux = scenarios.map(s => {
        const resultats = s.resultats || { ca: [], resultatNet: [], tresorerieFin: [] }
        return {
            ...s,
            caTotal: resultats.ca?.reduce((a, b) => a + b, 0) || 0,
            resultatTotal: resultats.resultatNet?.reduce((a, b) => a + b, 0) || 0,
            tresoFin: resultats.tresorerieFin?.[resultats.tresorerieFin.length - 1] || s.tresorerieFinAn3 || 0,
        }
    })

    // Trouver le meilleur et le pire
    const sortedByResultat = [...scenariosAvecTotaux].sort((a, b) => b.resultatTotal - a.resultatTotal)
    const meilleur = sortedByResultat[0]
    const pire = sortedByResultat[sortedByResultat.length - 1]
    const ecart = meilleur.resultatTotal - pire.resultatTotal

    return (
        <section className="mb-10 page-break-before-always">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Analyse des Scénarios</h2>
                    <p className="text-sm text-gray-500">Comparaison des hypothèses optimiste, réaliste et pessimiste</p>
                </div>
            </div>

            {/* Tableau comparatif */}
            <div className="overflow-hidden rounded-xl border border-gray-200 mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#1e3a5f] text-white">
                            <th className="px-4 py-3 text-left font-semibold">Scénario</th>
                            <th className="px-4 py-3 text-right font-semibold">Modif. CA</th>
                            <th className="px-4 py-3 text-right font-semibold">Modif. Charges</th>
                            <th className="px-4 py-3 text-right font-semibold">Résultat Cumulé</th>
                            <th className="px-4 py-3 text-right font-semibold">Trésorerie Fin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scenariosAvecTotaux.map((scenario, idx) => (
                            <tr
                                key={scenario.nom}
                                className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: scenario.couleur }}
                                        />
                                        <span className="font-medium">{scenario.nom}</span>
                                    </div>
                                </td>
                                <td className={`px-4 py-3 text-right ${scenario.modifCA >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {scenario.modifCA >= 0 ? '+' : ''}{scenario.modifCA}%
                                </td>
                                <td className={`px-4 py-3 text-right ${scenario.modifCharges <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {scenario.modifCharges >= 0 ? '+' : ''}{scenario.modifCharges}%
                                </td>
                                <td className={`px-4 py-3 text-right font-semibold ${scenario.resultatTotal >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {formatCurrency(scenario.resultatTotal)}
                                </td>
                                <td className={`px-4 py-3 text-right ${scenario.tresoFin >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                    {formatCurrency(scenario.tresoFin)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Barres de comparaison visuelles */}
            <Card variant="bordered" className="p-6 mb-6">
                <h3 className="font-semibold text-[#1e3a5f] mb-4">Comparaison des Résultats Cumulés</h3>
                <div className="space-y-4">
                    {scenariosAvecTotaux.map(scenario => {
                        const maxResultat = Math.max(...scenariosAvecTotaux.map(s => Math.abs(s.resultatTotal)))
                        const widthPercent = maxResultat > 0 ? (Math.abs(scenario.resultatTotal) / maxResultat) * 100 : 0

                        return (
                            <div key={scenario.nom} className="flex items-center gap-4">
                                <div className="w-24 flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: scenario.couleur }}
                                    />
                                    <span className="text-sm font-medium truncate">{scenario.nom}</span>
                                </div>
                                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                                    <div
                                        className="h-full rounded-lg transition-all duration-500"
                                        style={{
                                            width: `${widthPercent}%`,
                                            backgroundColor: scenario.couleur,
                                        }}
                                    />
                                </div>
                                <div className={`w-28 text-right font-semibold ${scenario.resultatTotal >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {formatCurrency(scenario.resultatTotal)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Synthèse */}
            <div className="grid grid-cols-3 gap-4">
                <Card variant="bordered" className="p-5 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Scénario le plus favorable
                    </div>
                    <div className="text-lg font-bold text-green-600">{meilleur.nom}</div>
                    <div className="text-sm text-gray-600 mt-1">
                        Résultat : {formatCurrency(meilleur.resultatTotal)}
                    </div>
                </Card>

                <Card variant="bordered" className="p-5 border-l-4 border-l-red-500">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Scénario le moins favorable
                    </div>
                    <div className="text-lg font-bold text-red-600">{pire.nom}</div>
                    <div className="text-sm text-gray-600 mt-1">
                        Résultat : {formatCurrency(pire.resultatTotal)}
                    </div>
                </Card>

                <Card variant="bordered" className="p-5 border-l-4 border-l-[#1e3a5f]">
                    <div className="text-sm text-gray-500 mb-2">Écart entre scénarios</div>
                    <div className="text-lg font-bold text-[#1e3a5f]">{formatCurrency(ecart)}</div>
                    <div className="text-sm text-gray-600 mt-1">
                        sur la période de {annees.length} ans
                    </div>
                </Card>
            </div>

            {/* Note explicative */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <p>
                    <strong>Note :</strong> Cette analyse compare les différents scénarios basés sur les hypothèses de variation
                    du chiffre d'affaires et des charges. Le scénario réaliste représente les projections de base sans modification.
                </p>
            </div>
        </section>
    )
}
