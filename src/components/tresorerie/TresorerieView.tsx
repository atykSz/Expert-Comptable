'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Save,
    AlertTriangle,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'
import { calculatePrevisionnelCashFlow, PrevisionnelWithRelations } from '@/lib/financial-calculations'

export function TresorerieView({ previsionnel }: { previsionnel: PrevisionnelWithRelations }) {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    // Hypothèses BFR (Init from DB or default)
    const [delaiClients, setDelaiClients] = useState(previsionnel.hypotheses?.delaiPaiementClients || 30)
    const [delaiFournisseurs, setDelaiFournisseurs] = useState(previsionnel.hypotheses?.delaiPaiementFournisseurs || 30)
    const [joursStocksRotation, setJoursStocksRotation] = useState(previsionnel.hypotheses?.dureeStockJours || 0)

    // Trésorerie initiale (TODO: Ajouter ce champ dans Hypotheses ou Financement)
    const [tresorerieInitiale, setTresorerieInitiale] = useState(10000)

    // Recalcul en temps réel
    const planTresorerie = useMemo(() => {
        // Crée une copie du prévisionnel avec les hypothèses modifiées localement
        const tempsReelPrev = {
            ...previsionnel,
            hypotheses: {
                ...previsionnel.hypotheses,
                delaiPaiementClients: delaiClients,
                delaiPaiementFournisseurs: delaiFournisseurs,
                dureeStockJours: joursStocksRotation
            }
        } as PrevisionnelWithRelations

        return calculatePrevisionnelCashFlow(tempsReelPrev, tresorerieInitiale)
    }, [previsionnel, delaiClients, delaiFournisseurs, joursStocksRotation, tresorerieInitiale])

    // Calcul BFR (Simplifié pour l'affichage)
    const bfr = useMemo(() => {
        // On somme tout le CA et Achats du prévisionnel
        let caAnnuel = 0
        previsionnel.lignesCA.forEach((l) => {
            // Cast explicite car Json
            const m = l.montantsMensuels as unknown as number[]
            if (Array.isArray(m)) {
                caAnnuel += m.reduce((a, b) => a + b, 0)
            }
        })

        let achatsAnnuels = 0
        previsionnel.lignesCharge.forEach((l) => {
            // TODO: Filipter sur les charges d'achats uniquement (classe 60)
            const m = l.montantsMensuels as unknown as number[]
            if (Array.isArray(m)) {
                achatsAnnuels += m.reduce((a, b) => a + b, 0)
            }
        })

        // Créances clients = CA TTC * délai / 360
        const creancesClients = (caAnnuel * 1.2 * delaiClients) / 360

        // Stocks = Achats * rotation / 360
        const stocks = joursStocksRotation > 0 ? (achatsAnnuels * joursStocksRotation) / 360 : 0

        // Dettes fournisseurs = Achats TTC * délai / 360
        const dettesFournisseurs = (achatsAnnuels * 1.2 * delaiFournisseurs) / 360

        const bfrMontant = creancesClients + stocks - dettesFournisseurs
        const bfrEnJours = caAnnuel > 0 ? (bfrMontant / caAnnuel) * 360 : 0

        return {
            creancesClients,
            stocks,
            dettesFournisseurs,
            montant: bfrMontant,
            enJours: bfrEnJours,
        }
    }, [previsionnel, delaiClients, delaiFournisseurs, joursStocksRotation])


    // Alertes
    const alertesTresorerie = planTresorerie.filter(p => p.tresorerieFin < 0)
    const tresoMini = Math.min(...planTresorerie.map(p => p.tresorerieFin))
    // const tresoMaxi = Math.max(...planTresorerie.map(p => p.tresorerieFin))

    return (
        <div className="flex min-h-screen bg-gray-50">
            <PrevisionnelSidebar previsionnelId={previsionnel.id} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link
                            href={`/previsionnel/${previsionnel.id}/financement`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour au plan de financement
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Trésorerie & BFR</h1>
                        <p className="text-gray-600">Suivez vos flux de trésorerie (données réelles connectées)</p>
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
                        <div className="text-sm text-gray-500">BFR Estimé</div>
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
                        <CardTitle className="text-lg">Paramètres du BFR (Temps Réel)</CardTitle>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Trésorerie début */}
                                    <tr className="border-b bg-blue-50">
                                        <td className="py-2 px-3 font-medium sticky left-0 bg-blue-50">Trésorerie début (Solde)</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-2 px-2 text-right text-gray-600">{formatCurrency(p.tresorerieFin - p.soldeFlux)}</td>
                                        ))}
                                    </tr>

                                    {/* ENCAISSEMENTS */}
                                    <tr className="bg-green-50">
                                        <td colSpan={13} className="py-1 px-3 font-medium text-green-800">
                                            <ArrowUpRight className="h-3 w-3 inline mr-1" />
                                            ENCAISSEMENTS
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Encaissements clients (TTC)</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.encaissements.caTTC)}</td>
                                        ))}
                                    </tr>

                                    {/* DÉCAISSEMENTS */}
                                    <tr className="bg-red-50">
                                        <td colSpan={13} className="py-1 px-3 font-medium text-red-800">
                                            <ArrowDownRight className="h-3 w-3 inline mr-1" />
                                            DÉCAISSEMENTS
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">Achats & Charges (TTC)</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.decaissements.achatsTTC)}</td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1 px-3 pl-6 sticky left-0 bg-white">TVA à décaisser</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className="py-1 px-2 text-right">{formatCurrency(p.decaissements.tvaDecaissee)}</td>
                                        ))}
                                    </tr>

                                    {/* SOLDE */}
                                    <tr className="border-b bg-gray-100 font-medium">
                                        <td className="py-2 px-3 sticky left-0 bg-gray-100">Flux net du mois</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className={`py-2 px-2 text-right ${p.soldeFlux >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(p.soldeFlux)}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Trésorerie fin */}
                                    <tr className="bg-blue-100 font-bold">
                                        <td className="py-2 px-3 sticky left-0 bg-blue-100">Trésorerie fin</td>
                                        {planTresorerie.map((p, idx) => (
                                            <td key={idx} className={`py-2 px-2 text-right ${p.tresorerieFin >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                                                {formatCurrency(p.tresorerieFin)}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
