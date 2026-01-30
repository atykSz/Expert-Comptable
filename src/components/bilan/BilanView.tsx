'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Save,
    Building,
    Scale,
    TrendingUp
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'
import { BilanAnnuel, PrevisionnelWithRelations } from '@/lib/financial-calculations'

interface BilanViewProps {
    previsionnel: PrevisionnelWithRelations
    bilans: BilanAnnuel[]
}

export function BilanView({ previsionnel, bilans }: BilanViewProps) {
    // Onglets d'année
    const [selectedYear, setSelectedYear] = useState(1)

    // Récupérer le bilan de l'année sélectionnée ou un objet vide safe
    const currentBilan = bilans.find(b => b.annee === selectedYear) || {
        actif: {
            immobilisationsBrutes: 0,
            amortissementsCumules: 0,
            immobilisationsNet: 0,
            creancesClients: 0,
            stocks: 0,
            disponibilites: 0,
            total: 0
        },
        passif: {
            capitalSocial: 0,
            resultatNet: 0,
            reportANouveau: 0,
            emprunts: 0,
            dettesFournisseurs: 0,
            dettesFiscalesSociales: 0,
            decouvertBancaire: 0,
            total: 0
        },
        equilibre: true
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <PrevisionnelSidebar previsionnelId={previsionnel.id} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link
                            href={`/previsionnel/${previsionnel.id}/tresorerie`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour à la trésorerie
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Bilan Prévisionnel</h1>
                        <p className="text-gray-600">Vision patrimoniale de l'entreprise (Actif / Passif)</p>
                    </div>
                    <Button variant="primary">
                        <Save className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                </div>

                {/* Sélecteur d'année */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border ${selectedYear === year
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Année {year}
                        </button>
                    ))}
                </div>

                {!currentBilan.equilibre && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                        <Scale className="h-5 w-5" />
                        <span className="font-medium">Attention : Le bilan n'est pas équilibré (Ecart: {formatCurrency(currentBilan.actif.total - currentBilan.passif.total)})</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ACTIF */}
                    <Card variant="bordered">
                        <CardHeader className="bg-blue-50 border-b border-blue-100">
                            <CardTitle className="text-blue-800 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                ACTIF (Ce que l'entreprise possède)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="bg-gray-50 font-semibold text-gray-500 text-xs uppercase">
                                        <td className="px-4 py-2">Actif Immobilisé</td>
                                        <td className="px-4 py-2 text-right">Montant</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Immobilisations brutes</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(currentBilan.actif.immobilisationsBrutes)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3 text-gray-500">Amortissements cumulés (-)</td>
                                        <td className="px-4 py-3 text-right text-gray-500">({formatCurrency(currentBilan.actif.amortissementsCumules)})</td>
                                    </tr>
                                    <tr className="bg-gray-100 font-medium">
                                        <td className="px-4 py-2">Total Actif Immobilisé (Net)</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(currentBilan.actif.immobilisationsNet)}</td>
                                    </tr>

                                    <tr className="bg-gray-50 font-semibold text-gray-500 text-xs uppercase mt-4">
                                        <td className="px-4 py-2">Actif Circulant</td>
                                        <td className="px-4 py-2 text-right"></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Stocks</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(currentBilan.actif.stocks)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Créances clients</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(currentBilan.actif.creancesClients)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Disponibilités (Trésorerie)</td>
                                        <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(currentBilan.actif.disponibilites)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-blue-600 text-white font-bold text-lg">
                                        <td className="px-4 py-4">TOTAL ACTIF</td>
                                        <td className="px-4 py-4 text-right">{formatCurrency(currentBilan.actif.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>

                    {/* PASSIF */}
                    <Card variant="bordered">
                        <CardHeader className="bg-orange-50 border-b border-orange-100">
                            <CardTitle className="text-orange-800 flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                PASSIF (Ce que l'entreprise doit)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="bg-gray-50 font-semibold text-gray-500 text-xs uppercase">
                                        <td className="px-4 py-2">Capitaux Propres</td>
                                        <td className="px-4 py-2 text-right">Montant</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Capital Social</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(currentBilan.passif.capitalSocial)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Report à nouveau</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(currentBilan.passif.reportANouveau)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Résultat de l'exercice</td>
                                        <td className={`px-4 py-3 text-right font-medium ${currentBilan.passif.resultatNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(currentBilan.passif.resultatNet)}
                                        </td>
                                    </tr>

                                    <tr className="bg-gray-50 font-semibold text-gray-500 text-xs uppercase mt-4">
                                        <td className="px-4 py-2">Dettes</td>
                                        <td className="px-4 py-2 text-right"></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Emprunts bancaires</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(currentBilan.passif.emprunts)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Dettes fournisseurs</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(currentBilan.passif.dettesFournisseurs)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Dettes fiscales & sociales</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(currentBilan.passif.dettesFiscalesSociales)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="px-4 py-3">Découvert bancaire</td>
                                        <td className="px-4 py-3 text-right text-red-600">{formatCurrency(currentBilan.passif.decouvertBancaire)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-orange-600 text-white font-bold text-lg">
                                        <td className="px-4 py-4">TOTAL PASSIF</td>
                                        <td className="px-4 py-4 text-right">{formatCurrency(currentBilan.passif.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
