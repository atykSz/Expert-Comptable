'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { BarChartComponent } from '@/components/charts'
import { ScenarioResult } from '@/lib/calculations/scenarios'

interface ScenarioData {
    nom: string
    couleur: string
    resultats: ScenarioResult
}

interface ScenarioCompareProps {
    scenarios: ScenarioData[]
    annees: number[]
}

export function ScenarioCompare({ scenarios, annees }: ScenarioCompareProps) {
    if (scenarios.length === 0) {
        return (
            <Card variant="bordered" className="p-8 text-center">
                <p className="text-muted-foreground">
                    Aucun scénario à comparer. Créez au moins un scénario pour voir la comparaison.
                </p>
            </Card>
        )
    }

    // Préparer les données pour le graphique
    const chartData = annees.map((annee, i) => {
        const dataPoint: { name: string; value: number;[key: string]: string | number } = {
            name: `${annee}`,
            value: scenarios[0]?.resultats.resultatNet[i] || 0
        }
        scenarios.forEach(scenario => {
            dataPoint[scenario.nom] = scenario.resultats.resultatNet[i] || 0
        })
        return dataPoint
    })

    const dataKeys = scenarios.map(s => ({
        key: s.nom,
        color: s.couleur,
        name: s.nom
    }))

    // Calculer les totaux
    const totaux = scenarios.map(s => ({
        nom: s.nom,
        couleur: s.couleur,
        caTotal: s.resultats.ca.reduce((a, b) => a + b, 0),
        resultatTotal: s.resultats.resultatNet.reduce((a, b) => a + b, 0),
        tresoFin: s.resultats.tresorerieFin[s.resultats.tresorerieFin.length - 1] || 0,
        margeMoyenne: s.resultats.tauxMarge.reduce((a, b) => a + b, 0) / s.resultats.tauxMarge.length
    }))

    // Trouver le meilleur et le pire
    const sortedByResultat = [...totaux].sort((a, b) => b.resultatTotal - a.resultatTotal)
    const meilleur = sortedByResultat[0]
    const pire = sortedByResultat[sortedByResultat.length - 1]

    return (
        <div className="space-y-6">
            {/* Graphique comparatif */}
            <Card variant="bordered">
                <CardHeader>
                    <CardTitle className="text-lg">Évolution du Résultat Net par Scénario</CardTitle>
                </CardHeader>
                <CardContent>
                    <BarChartComponent
                        data={chartData}
                        dataKeys={dataKeys}
                    />
                </CardContent>
            </Card>

            {/* Tableau comparatif */}
            <Card variant="bordered">
                <CardHeader>
                    <CardTitle className="text-lg">Tableau Comparatif</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-3 text-left font-medium text-muted-foreground">Indicateur</th>
                                    {scenarios.map(s => (
                                        <th key={s.nom} className="py-3 text-right font-medium" style={{ color: s.couleur }}>
                                            {s.nom}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* CA par année */}
                                {annees.map((annee, i) => (
                                    <tr key={`ca-${annee}`} className="border-b border-border">
                                        <td className="py-3">CA {annee}</td>
                                        {scenarios.map(s => (
                                            <td key={s.nom} className="py-3 text-right">
                                                {formatCurrency(s.resultats.ca[i] || 0)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {/* Ligne de séparation */}
                                <tr className="bg-secondary/30">
                                    <td colSpan={scenarios.length + 1} className="py-1"></td>
                                </tr>

                                {/* Résultat par année */}
                                {annees.map((annee, i) => (
                                    <tr key={`rn-${annee}`} className="border-b border-border">
                                        <td className="py-3">Résultat Net {annee}</td>
                                        {scenarios.map(s => {
                                            const val = s.resultats.resultatNet[i] || 0
                                            return (
                                                <td key={s.nom} className={`py-3 text-right font-medium ${val >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {formatCurrency(val)}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}

                                {/* Totaux */}
                                <tr className="bg-secondary/50 font-semibold">
                                    <td className="py-3">Résultat Cumulé</td>
                                    {totaux.map(t => (
                                        <td key={t.nom} className={`py-3 text-right ${t.resultatTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {formatCurrency(t.resultatTotal)}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="border-b border-border">
                                    <td className="py-3">Trésorerie Fin de Période</td>
                                    {totaux.map(t => (
                                        <td key={t.nom} className={`py-3 text-right ${t.tresoFin >= 0 ? 'text-accent' : 'text-danger'}`}>
                                            {formatCurrency(t.tresoFin)}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="border-b border-border">
                                    <td className="py-3">Taux de Marge Moyen</td>
                                    {totaux.map(t => (
                                        <td key={t.nom} className="py-3 text-right">
                                            {t.margeMoyenne.toFixed(1)}%
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Synthèse */}
            <div className="grid grid-cols-2 gap-4">
                <Card variant="bordered" className="p-5 border-l-4 border-l-success">
                    <div className="text-sm text-muted-foreground mb-1">Scénario le plus favorable</div>
                    <div className="text-xl font-semibold text-success">{meilleur.nom}</div>
                    <div className="text-sm mt-2">
                        Résultat cumulé : {formatCurrency(meilleur.resultatTotal)}
                    </div>
                </Card>
                <Card variant="bordered" className="p-5 border-l-4 border-l-danger">
                    <div className="text-sm text-muted-foreground mb-1">Scénario le moins favorable</div>
                    <div className="text-xl font-semibold text-danger">{pire.nom}</div>
                    <div className="text-sm mt-2">
                        Résultat cumulé : {formatCurrency(pire.resultatTotal)}
                    </div>
                </Card>
            </div>

            {/* Écart */}
            <Card variant="bordered" className="p-5 text-center">
                <div className="text-sm text-muted-foreground mb-2">Écart entre scénarios</div>
                <div className="text-3xl font-bold tracking-tight">
                    {formatCurrency(meilleur.resultatTotal - pire.resultatTotal)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                    sur la période de {annees.length} ans
                </div>
            </Card>
        </div>
    )
}
