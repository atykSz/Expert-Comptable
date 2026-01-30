'use client'

import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface SIGSectionProps {
    sig: {
        annee: number
        margeCommerciale: number
        productionExercice: number
        valeurAjoutee: number
        ebe: number
        resultatExploitation: number
        resultatCourant: number
        resultatNet: number
        caf: number
    }[]
}

export function SIGSection({ sig }: SIGSectionProps) {
    const annees = sig.map(s => s.annee.toString())

    const sigRows = [
        { label: 'Marge commerciale', key: 'margeCommerciale' as const },
        { label: 'Production de l\'exercice', key: 'productionExercice' as const },
        { label: 'Valeur Ajoutée', key: 'valeurAjoutee' as const, highlight: true },
        { label: 'Excédent Brut d\'Exploitation (EBE)', key: 'ebe' as const, highlight: true },
        { label: 'Résultat d\'exploitation', key: 'resultatExploitation' as const },
        { label: 'Résultat courant avant impôts', key: 'resultatCourant' as const },
        { label: 'Résultat Net', key: 'resultatNet' as const, total: true },
        { label: 'Capacité d\'Autofinancement (CAF)', key: 'caf' as const },
    ]

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Soldes Intermédiaires de Gestion</h2>
                    <p className="text-sm text-muted-foreground">Analyse de la formation du résultat</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#1e3a5f] text-white">
                            <th className="px-4 py-3 text-left font-semibold">Solde</th>
                            {annees.map(annee => (
                                <th key={annee} className="px-4 py-3 text-right font-semibold">{annee}</th>
                            ))}
                            <th className="px-4 py-3 text-right font-semibold">Évolution</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sigRows.map((row, idx) => {
                            const values = sig.map(s => s[row.key])
                            const evolution = values.length >= 2
                                ? ((values[values.length - 1] - values[0]) / Math.abs(values[0]) * 100)
                                : 0
                            const isPositive = evolution >= 0

                            return (
                                <tr
                                    key={row.key}
                                    className={`border-b border-gray-100 ${row.total ? 'bg-[#1e3a5f] text-white font-bold' :
                                            row.highlight ? 'bg-[#c9a227]/10 font-semibold' :
                                                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        }`}
                                >
                                    <td className="px-4 py-3">{row.label}</td>
                                    {values.map((val, i) => (
                                        <td
                                            key={i}
                                            className={`px-4 py-3 text-right ${val < 0 ? 'text-red-500' : ''
                                                } ${row.total ? 'text-[#c9a227]' : ''}`}
                                        >
                                            {formatCurrency(val)}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right">
                                        <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'
                                            } ${row.total ? 'text-[#c9a227]' : ''}`}>
                                            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                            {formatPercent(Math.abs(evolution))}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
