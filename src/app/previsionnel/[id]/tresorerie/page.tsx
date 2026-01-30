'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Save,
    FileSpreadsheet,
    TrendingUp,
    PiggyBank,
    Calculator,
    Building,
    AlertTriangle,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'

// Navigation latérale

export default function TresoreriePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const previsionnelId = 'demo'
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    // Hypothèses BFR
    const [delaiClients, setDelaiClients] = useState(30)
    const [delaiFournisseurs, setDelaiFournisseurs] = useState(30)
    const [joursStocksRotation, setJoursStocksRotation] = useState(0)

    // Trésorerie initiale
    const [tresorerieInitiale, setTresorerieInitiale] = useState(10000)

    // Données simulées (en production, viendrait des autres modules)
    const donneesCA = [5000, 5000, 6000, 6000, 7000, 8000, 8000, 7000, 8000, 9000, 9000, 10000]
    const donneesAchats = [2000, 2000, 2500, 2500, 3000, 3500, 3500, 3000, 3500, 4000, 4000, 4500]
    const chargesFixes = 3000 // mensuelles
    const mensualiteEmprunt = 560

    // Calcul du plan de trésorerie
    const planTresorerie = useMemo(() => {
        const lignes: {
            mois: string
            encaissementsCA: number
            autresEncaissements: number
            totalEncaissements: number
            decaissementsAchats: number
            chargesExternes: number
            salaires: number
            chargesSociales: number
            remboursementsEmprunts: number
            autresDecaissements: number
            totalDecaissements: number
            soldeFlux: number
            tresorerieDebut: number
            tresorerieFin: number
        }[] = []

        let tresoDebut = tresorerieInitiale

        mois.forEach((m, idx) => {
            // Encaissements = CA encaissé avec délai (simplifié : encaissement du mois précédent)
            const decalageEncaissement = Math.ceil(delaiClients / 30)
            const encaissementsCA = idx >= decalageEncaissement
                ? donneesCA[idx - decalageEncaissement]
                : (idx === 0 ? tresorerieInitiale * 0.1 : 0)

            // Financement initial en janvier
            const autresEncaissements = idx === 0 ? 40000 : 0 // Capital + Emprunt

            const totalEncaissements = encaissementsCA + autresEncaissements

            // Décaissements
            const decalageFournisseurs = Math.ceil(delaiFournisseurs / 30)
            const decaissementsAchats = idx >= decalageFournisseurs
                ? donneesAchats[idx - decalageFournisseurs]
                : donneesAchats[0] * 0.5

            const chargesExternes = chargesFixes * 0.4
            const salaires = chargesFixes * 0.5
            const chargesSociales = salaires * 0.45
            const remboursementsEmprunts = mensualiteEmprunt

            // Investissement initial
            const autresDecaissements = idx === 0 ? 38000 : 0 // Investissements

            const totalDecaissements =
                decaissementsAchats +
                chargesExternes +
                salaires +
                chargesSociales +
                remboursementsEmprunts +
                autresDecaissements

            const soldeFlux = totalEncaissements - totalDecaissements
            const tresoFin = tresoDebut + soldeFlux

            lignes.push({
                mois: m,
                encaissementsCA,
                autresEncaissements,
                totalEncaissements,
                decaissementsAchats,
                chargesExternes,
                salaires,
                chargesSociales,
                remboursementsEmprunts,
                autresDecaissements,
                totalDecaissements,
                soldeFlux,
                tresorerieDebut: tresoDebut,
                tresorerieFin: tresoFin,
            })

            tresoDebut = tresoFin
        })

        return lignes
    }, [mois, delaiClients, delaiFournisseurs, tresorerieInitiale])

    // Calcul BFR
    const bfr = useMemo(() => {
        const caAnnuel = donneesCA.reduce((sum, c) => sum + c, 0)
        const achatsAnnuels = donneesAchats.reduce((sum, a) => sum + a, 0)

        // Créances clients = CA TTC * délai / 360
        const creancesClients = (caAnnuel * 1.2 * delaiClients) / 360

        // Stocks = Achats * rotation / 360
        const stocks = joursStocksRotation > 0 ? (achatsAnnuels * joursStocksRotation) / 360 : 0

        // Dettes fournisseurs = Achats TTC * délai / 360
        const dettesFournisseurs = (achatsAnnuels * 1.2 * delaiFournisseurs) / 360

        const bfrMontant = creancesClients + stocks - dettesFournisseurs

        // BFR en jours de CA
        const bfrEnJours = (bfrMontant / caAnnuel) * 360

        return {
            creancesClients,
            stocks,
            dettesFournisseurs,
            montant: bfrMontant,
            enJours: bfrEnJours,
        }
    }, [delaiClients, delaiFournisseurs, joursStocksRotation])

    // Alertes
    const alertesTresorerie = planTresorerie.filter(p => p.tresorerieFin < 0)
    const tresoMini = Math.min(...planTresorerie.map(p => p.tresorerieFin))
    const tresoMaxi = Math.max(...planTresorerie.map(p => p.tresorerieFin))

    return (
        <div className="flex min-h-screen bg-gray-50">
            <PrevisionnelSidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link
                            href={`/previsionnel/${previsionnelId}/financement`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour au plan de financement
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Trésorerie & BFR</h1>
                        <p className="text-gray-600">Suivez vos flux de trésorerie et votre besoin en fonds de roulement</p>
                    </div>
                    <Button variant="primary">
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                    </Button>
                </div>

                {/* Alerte trésorerie négative */}
                {alertesTresorerie.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <div className="font-medium text-red-800">Attention : Trésorerie négative détectée</div>
                            <div className="text-sm text-red-600">
                                {alertesTresorerie.length} mois avec trésorerie négative.
                                Minimum atteint : {formatCurrency(tresoMini)} en {alertesTresorerie[0]?.mois}.
                                Envisagez d'augmenter le financement initial ou de réduire les décaissements.
                            </div>
                        </div>
                    </div>
                )}

                {/* Résumé */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Trésorerie initiale</div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(tresorerieInitiale)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Trésorerie fin année</div>
                        <div className={`text-2xl font-bold ${planTresorerie[11]?.tresorerieFin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(planTresorerie[11]?.tresorerieFin || 0)}
                        </div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">BFR</div>
                        <div className="text-2xl font-bold text-orange-600">{formatCurrency(bfr.montant)}</div>
                        <div className="text-xs text-gray-400">{bfr.enJours.toFixed(0)} jours de CA</div>
                    </Card>
                    <Card variant="bordered" className={`p-4 ${tresoMini < 0 ? 'border-red-300 bg-red-50' : ''}`}>
                        <div className="text-sm text-gray-500">Trésorerie minimum</div>
                        <div className={`text-2xl font-bold ${tresoMini >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(tresoMini)}
                        </div>
                    </Card>
                </div>

                {/* Hypothèses BFR */}
                <Card variant="bordered" className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Paramètres du BFR</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <Input
                                type="number"
                                label="Délai clients (jours)"
                                value={delaiClients}
                                onChange={(e) => setDelaiClients(parseInt(e.target.value) || 0)}
                                hint="Délai moyen d'encaissement"
                            />
                            <Input
                                type="number"
                                label="Délai fournisseurs (jours)"
                                value={delaiFournisseurs}
                                onChange={(e) => setDelaiFournisseurs(parseInt(e.target.value) || 0)}
                                hint="Délai de paiement négocié"
                            />
                            <Input
                                type="number"
                                label="Rotation stocks (jours)"
                                value={joursStocksRotation}
                                onChange={(e) => setJoursStocksRotation(parseInt(e.target.value) || 0)}
                                hint="0 si pas de stock"
                            />
                            <Input
                                type="number"
                                label="Trésorerie initiale"
                                value={tresorerieInitiale}
                                onChange={(e) => setTresorerieInitiale(parseFloat(e.target.value) || 0)}
                                hint="Solde de départ"
                            />
                        </div>

                        {/* Décomposition BFR */}
                        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                            <h4 className="font-medium text-orange-800 mb-3">Composition du BFR</h4>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-500">Créances clients</div>
                                    <div className="font-bold text-blue-600">+ {formatCurrency(bfr.creancesClients)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Stocks</div>
                                    <div className="font-bold text-blue-600">+ {formatCurrency(bfr.stocks)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Dettes fournisseurs</div>
                                    <div className="font-bold text-green-600">- {formatCurrency(bfr.dettesFournisseurs)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">= BFR</div>
                                    <div className={`font-bold text-lg ${bfr.montant >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        {formatCurrency(bfr.montant)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Plan de trésorerie mensuel */}
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-lg">Plan de Trésorerie Mensuel - Année 1</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="py-2 px-3 text-left font-medium text-gray-600 sticky left-0 bg-gray-50">Poste</th>
                                        {mois.map(m => (
                                            <th key={m} className="py-2 px-2 text-right font-medium text-gray-600 min-w-[80px]">{m}</th>
                                        ))}
                                        <th className="py-2 px-3 text-right font-medium text-gray-600 bg-gray-100">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Trésorerie début */}
                                    <tr className="border-b bg-blue-50">
                                        <td className="py-2 px-3 font-medium sticky left-0 bg-blue-50">Trésorerie début</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-2 px-2 text-right">{formatCurrency(p.tresorerieDebut)}</td>
                                        ))}
                                        <td className="py-2 px-3 text-right bg-blue-100">{formatCurrency(tresorerieInitiale)}</td>
                                    </tr>

                                    {/* ENCAISSEMENTS */}
                                    <tr className="bg-green-50">
                                        <td colSpan={14} className="py-1 px-3 font-medium text-green-800">
                                            <ArrowUpRight className="h-3 w-3 inline mr-1" />
                                            ENCAISSEMENTS
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Encaissements clients</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.encaissementsCA)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-gray-50 font-medium">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.encaissementsCA, 0))}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Autres (financement, etc.)</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.autresEncaissements)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-gray-50 font-medium">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.autresEncaissements, 0))}
                                        </td>
                                    </tr>
                                    <tr className="border-b bg-green-100 font-medium">
                                        <td className="py-1 px-3 sticky left-0 bg-green-100">Total encaissements</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right text-green-700">{formatCurrency(p.totalEncaissements)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-green-200 text-green-800">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.totalEncaissements, 0))}
                                        </td>
                                    </tr>

                                    {/* DÉCAISSEMENTS */}
                                    <tr className="bg-red-50">
                                        <td colSpan={14} className="py-1 px-3 font-medium text-red-800">
                                            <ArrowDownRight className="h-3 w-3 inline mr-1" />
                                            DÉCAISSEMENTS
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Achats</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.decaissementsAchats)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-gray-50 font-medium">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.decaissementsAchats, 0))}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Charges externes</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.chargesExternes)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-gray-50 font-medium">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.chargesExternes, 0))}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Salaires</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.salaires)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-gray-50 font-medium">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.salaires, 0))}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Charges sociales</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.chargesSociales)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-gray-50 font-medium">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.chargesSociales, 0))}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Remboursement emprunts</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.remboursementsEmprunts)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-gray-50 font-medium">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.remboursementsEmprunts, 0))}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Investissements</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.autresDecaissements)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-gray-50 font-medium">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.autresDecaissements, 0))}
                                        </td>
                                    </tr>
                                    <tr className="border-b bg-red-100 font-medium">
                                        <td className="py-1 px-3 sticky left-0 bg-red-100">Total décaissements</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right text-red-700">{formatCurrency(p.totalDecaissements)}</td>
                                        ))}
                                        <td className="py-1 px-3 text-right bg-red-200 text-red-800">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.totalDecaissements, 0))}
                                        </td>
                                    </tr>

                                    {/* SOLDE */}
                                    <tr className="border-b bg-gray-100 font-medium">
                                        <td className="py-2 px-3 sticky left-0 bg-gray-100">Flux net du mois</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className={`py-2 px-2 text-right ${p.soldeFlux >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(p.soldeFlux)}
                                            </td>
                                        ))}
                                        <td className="py-2 px-3 text-right bg-gray-200">
                                            {formatCurrency(planTresorerie.reduce((sum, p) => sum + p.soldeFlux, 0))}
                                        </td>
                                    </tr>

                                    {/* Trésorerie fin */}
                                    <tr className="bg-blue-100 font-bold">
                                        <td className="py-2 px-3 sticky left-0 bg-blue-100">Trésorerie fin</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className={`py-2 px-2 text-right ${p.tresorerieFin >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                                                {p.tresorerieFin < 0 && <TrendingDown className="h-3 w-3 inline mr-1" />}
                                                {formatCurrency(p.tresorerieFin)}
                                            </td>
                                        ))}
                                        <td className={`py-2 px-3 text-right bg-blue-200 ${planTresorerie[11]?.tresorerieFin >= 0 ? 'text-blue-800' : 'text-red-600'}`}>
                                            {formatCurrency(planTresorerie[11]?.tresorerieFin || 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                            <strong>Comment lire ce tableau :</strong> La trésorerie fin = trésorerie début + encaissements - décaissements.
                            Un flux net négatif signifie que les décaissements dépassent les encaissements ce mois-là.
                            Les montants en rouge alertent sur une trésorerie négative nécessitant un financement supplémentaire.
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
