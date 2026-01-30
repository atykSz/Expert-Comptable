'use client'

import { Package, Calendar, Clock, Calculator } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Investissement {
    libelle: string
    categorie: string
    montantHT: number
    dateAcquisition: string
    dureeAmortissement: number
    amortissementAnnuel: number
}

interface InvestissementsSectionProps {
    investissements: Investissement[]
    amortissementsCumules: { annee: number; dotation: number; cumul: number }[]
}

export function InvestissementsSection({ investissements, amortissementsCumules }: InvestissementsSectionProps) {
    const totalInvestissements = investissements.reduce((sum, inv) => sum + inv.montantHT, 0)
    const totalAmortAnnuel = investissements.reduce((sum, inv) => sum + inv.amortissementAnnuel, 0)

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Investissements et Amortissements</h2>
                    <p className="text-sm text-muted-foreground">Immobilisations et plan d'amortissement</p>
                </div>
            </div>

            {/* Investment Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#1e3a5f] text-white">
                            <th className="px-4 py-3 text-left font-semibold">Désignation</th>
                            <th className="px-4 py-3 text-left font-semibold">Catégorie</th>
                            <th className="px-4 py-3 text-right font-semibold">Montant HT</th>
                            <th className="px-4 py-3 text-center font-semibold">Date</th>
                            <th className="px-4 py-3 text-center font-semibold">Durée</th>
                            <th className="px-4 py-3 text-right font-semibold">Amort./an</th>
                        </tr>
                    </thead>
                    <tbody>
                        {investissements.map((inv, idx) => (
                            <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-4 py-3 font-medium">{inv.libelle}</td>
                                <td className="px-4 py-3 text-gray-600">{inv.categorie}</td>
                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.montantHT)}</td>
                                <td className="px-4 py-3 text-center text-gray-600">{inv.dateAcquisition}</td>
                                <td className="px-4 py-3 text-center text-gray-600">{inv.dureeAmortissement} ans</td>
                                <td className="px-4 py-3 text-right text-[#c9a227] font-semibold">{formatCurrency(inv.amortissementAnnuel)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-[#1e3a5f] text-white font-bold">
                            <td className="px-4 py-3" colSpan={2}>TOTAL INVESTISSEMENTS</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(totalInvestissements)}</td>
                            <td className="px-4 py-3" colSpan={2}></td>
                            <td className="px-4 py-3 text-right text-[#c9a227]">{formatCurrency(totalAmortAnnuel)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Amortization Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#c9a227]" />
                    Tableau d'Amortissement Cumulé
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {amortissementsCumules.map((am) => (
                        <div key={am.annee} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Année {am.annee}</div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs text-gray-400">Dotation</div>
                                    <div className="font-semibold text-[#1e3a5f]">{formatCurrency(am.dotation)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Cumul</div>
                                    <div className="font-bold text-[#c9a227]">{formatCurrency(am.cumul)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
