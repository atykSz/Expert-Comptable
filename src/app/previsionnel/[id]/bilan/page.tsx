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
    CheckCircle
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'

// Types pour le bilan
interface PosteBilan {
    code: string
    libelle: string
    montantN: number
    montantN1?: number
    montantN2?: number
    niveau: number // 0 = titre, 1 = sous-total, 2 = ligne
}

// Navigation latérale

// Composant pour afficher une section du bilan
function BilanSection({
    titre,
    postes,
    total,
    couleurTitre,
    annees
}: {
    titre: string
    postes: PosteBilan[]
    total: { n: number; n1?: number; n2?: number }
    couleurTitre: string
    annees: number[]
}) {
    return (
        <div className="mb-6">
            <div className={`${couleurTitre} px-4 py-2 font-bold text-white rounded-t-lg`}>
                {titre}
            </div>
            <table className="w-full border border-gray-200 border-t-0">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Poste</th>
                        {annees.map(a => (
                            <th key={a} className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                                {a}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {postes.map((poste, idx) => (
                        <tr
                            key={idx}
                            className={`border-b ${poste.niveau === 0 ? 'bg-gray-100 font-semibold' :
                                poste.niveau === 1 ? 'bg-gray-50 font-medium' : ''
                                }`}
                        >
                            <td className={`px-4 py-2 ${poste.niveau === 2 ? 'pl-8' : ''}`}>
                                {poste.code && <span className="text-gray-400 mr-2">{poste.code}</span>}
                                {poste.libelle}
                            </td>
                            <td className="px-4 py-2 text-right">{formatCurrency(poste.montantN)}</td>
                            {poste.montantN1 !== undefined && (
                                <td className="px-4 py-2 text-right">{formatCurrency(poste.montantN1)}</td>
                            )}
                            {poste.montantN2 !== undefined && (
                                <td className="px-4 py-2 text-right">{formatCurrency(poste.montantN2)}</td>
                            )}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className={`${couleurTitre} text-white font-bold`}>
                        <td className="px-4 py-3">TOTAL {titre.toUpperCase()}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(total.n)}</td>
                        {total.n1 !== undefined && (
                            <td className="px-4 py-3 text-right">{formatCurrency(total.n1)}</td>
                        )}
                        {total.n2 !== undefined && (
                            <td className="px-4 py-3 text-right">{formatCurrency(total.n2)}</td>
                        )}
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}

export default function BilanPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const previsionnelId = 'demo'
    const annees = [2026, 2027, 2028]

    // Données simulées (dans la vraie app, viendra du compte de résultat, investissements, etc.)
    const donneesEntrees = useMemo(() => ({
        // Du module investissements
        immobilisationsIncorporelles: 0,
        immobilisationsCorporellesBrutes: 38000, // Total investissements
        amortissementsCumules: [8334, 16167, 23500], // Par année

        // Du module compte de résultat
        resultatExercice: [-600, 5000, 12000], // Par année

        // Stocks (hypothèse)
        stocks: 0,

        // Créances clients (hypothèse basée sur délai paiement)
        creancesClients: [5000, 5500, 6000],

        // Trésorerie (sera calculée pour équilibrer)
        tresorerieInitiale: 10000,

        // Capital initial
        capitalSocial: 10000,

        // Emprunts (du module financement)
        emprunts: [30000, 24000, 18000], // Capital restant dû

        // Dettes fournisseurs
        dettesFournisseurs: [3000, 3200, 3500],

        // Dettes fiscales et sociales
        dettesFiscales: [500, 800, 1000],
    }), [])

    // Calcul du bilan pour chaque année
    const bilans = useMemo(() => {
        return annees.map((annee, idx) => {
            // --- ACTIF ---
            const immoBrutes = donneesEntrees.immobilisationsCorporellesBrutes
            const amortCumul = donneesEntrees.amortissementsCumules[idx]
            const immoNettes = immoBrutes - amortCumul

            const stocks = donneesEntrees.stocks
            const creances = donneesEntrees.creancesClients[idx]

            // Calcul des réserves cumulées
            const reservesCumulees = donneesEntrees.resultatExercice
                .slice(0, idx)
                .reduce((sum, r) => sum + r, 0)
            const resultatN = donneesEntrees.resultatExercice[idx]

            // --- PASSIF (connu) ---
            const capital = donneesEntrees.capitalSocial
            const emprunts = donneesEntrees.emprunts[idx]
            const dettesFourn = donneesEntrees.dettesFournisseurs[idx]
            const dettesFisc = donneesEntrees.dettesFiscales[idx]

            // Capitaux propres
            const capitauxPropres = capital + reservesCumulees + resultatN

            // Total passif hors trésorerie passive
            const totalPassifHorsTreso = capitauxPropres + emprunts + dettesFourn + dettesFisc

            // Total actif hors trésorerie
            const totalActifHorsTreso = immoNettes + stocks + creances

            // Trésorerie = équilibrage
            // Si passif > actif hors tréso, on a de la tréso à l'actif
            // Si actif > passif hors tréso, on a un découvert (tréso passive)
            let tresorerie = totalPassifHorsTreso - totalActifHorsTreso
            if (idx === 0) tresorerie += donneesEntrees.tresorerieInitiale

            // Totaux
            const totalActif = totalActifHorsTreso + Math.max(0, tresorerie)
            const totalPassif = totalPassifHorsTreso + Math.max(0, -tresorerie) // Découvert bancaire

            return {
                annee,
                actif: {
                    immoBrutes,
                    amortCumul,
                    immoNettes,
                    stocks,
                    creances,
                    tresorerie: Math.max(0, tresorerie),
                    total: totalActif,
                },
                passif: {
                    capital,
                    reserves: reservesCumulees,
                    resultat: resultatN,
                    capitauxPropres,
                    emprunts,
                    dettesFourn,
                    dettesFisc,
                    decouvert: Math.max(0, -tresorerie),
                    total: totalPassif,
                },
                equilibre: Math.abs(totalActif - totalPassif) < 1, // Équilibré à 1€ près
            }
        })
    }, [annees, donneesEntrees])

    // Vérifier l'équilibre
    const tousEquilibres = bilans.every(b => b.equilibre)

    // Construire les postes pour l'affichage
    const postesActif: PosteBilan[] = [
        { code: '', libelle: 'ACTIF IMMOBILISÉ', montantN: bilans[0].actif.immoNettes, montantN1: bilans[1].actif.immoNettes, montantN2: bilans[2].actif.immoNettes, niveau: 0 },
        { code: '20', libelle: 'Immobilisations incorporelles', montantN: donneesEntrees.immobilisationsIncorporelles, montantN1: donneesEntrees.immobilisationsIncorporelles, montantN2: donneesEntrees.immobilisationsIncorporelles, niveau: 2 },
        { code: '21', libelle: 'Immobilisations corporelles (nettes)', montantN: bilans[0].actif.immoNettes, montantN1: bilans[1].actif.immoNettes, montantN2: bilans[2].actif.immoNettes, niveau: 2 },
        { code: '', libelle: 'ACTIF CIRCULANT', montantN: bilans[0].actif.stocks + bilans[0].actif.creances + bilans[0].actif.tresorerie, montantN1: bilans[1].actif.stocks + bilans[1].actif.creances + bilans[1].actif.tresorerie, montantN2: bilans[2].actif.stocks + bilans[2].actif.creances + bilans[2].actif.tresorerie, niveau: 0 },
        { code: '3', libelle: 'Stocks', montantN: bilans[0].actif.stocks, montantN1: bilans[1].actif.stocks, montantN2: bilans[2].actif.stocks, niveau: 2 },
        { code: '41', libelle: 'Créances clients', montantN: bilans[0].actif.creances, montantN1: bilans[1].actif.creances, montantN2: bilans[2].actif.creances, niveau: 2 },
        { code: '5', libelle: 'Disponibilités', montantN: bilans[0].actif.tresorerie, montantN1: bilans[1].actif.tresorerie, montantN2: bilans[2].actif.tresorerie, niveau: 2 },
    ]

    const postesPassif: PosteBilan[] = [
        { code: '', libelle: 'CAPITAUX PROPRES', montantN: bilans[0].passif.capitauxPropres, montantN1: bilans[1].passif.capitauxPropres, montantN2: bilans[2].passif.capitauxPropres, niveau: 0 },
        { code: '101', libelle: 'Capital social', montantN: bilans[0].passif.capital, montantN1: bilans[1].passif.capital, montantN2: bilans[2].passif.capital, niveau: 2 },
        { code: '11', libelle: 'Report à nouveau', montantN: bilans[0].passif.reserves, montantN1: bilans[1].passif.reserves, montantN2: bilans[2].passif.reserves, niveau: 2 },
        { code: '12', libelle: 'Résultat de l\'exercice', montantN: bilans[0].passif.resultat, montantN1: bilans[1].passif.resultat, montantN2: bilans[2].passif.resultat, niveau: 2 },
        { code: '', libelle: 'DETTES', montantN: bilans[0].passif.emprunts + bilans[0].passif.dettesFourn + bilans[0].passif.dettesFisc + bilans[0].passif.decouvert, montantN1: bilans[1].passif.emprunts + bilans[1].passif.dettesFourn + bilans[1].passif.dettesFisc + bilans[1].passif.decouvert, montantN2: bilans[2].passif.emprunts + bilans[2].passif.dettesFourn + bilans[2].passif.dettesFisc + bilans[2].passif.decouvert, niveau: 0 },
        { code: '16', libelle: 'Emprunts et dettes financières', montantN: bilans[0].passif.emprunts, montantN1: bilans[1].passif.emprunts, montantN2: bilans[2].passif.emprunts, niveau: 2 },
        { code: '40', libelle: 'Dettes fournisseurs', montantN: bilans[0].passif.dettesFourn, montantN1: bilans[1].passif.dettesFourn, montantN2: bilans[2].passif.dettesFourn, niveau: 2 },
        { code: '44', libelle: 'Dettes fiscales et sociales', montantN: bilans[0].passif.dettesFisc, montantN1: bilans[1].passif.dettesFisc, montantN2: bilans[2].passif.dettesFisc, niveau: 2 },
        { code: '519', libelle: 'Concours bancaires courants', montantN: bilans[0].passif.decouvert, montantN1: bilans[1].passif.decouvert, montantN2: bilans[2].passif.decouvert, niveau: 2 },
    ]

    return (
        <div className="flex min-h-screen bg-gray-50">
            <PrevisionnelSidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link
                            href={`/previsionnel/${previsionnelId}/investissements`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour aux investissements
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Bilan Prévisionnel</h1>
                        <p className="text-gray-600">Présentation de la situation patrimoniale prévisionnelle</p>
                    </div>
                    <Button variant="primary">
                        <Save className="h-4 w-4 mr-2" />
                        Exporter PDF
                    </Button>
                </div>

                {/* Indicateur d'équilibre */}
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${tousEquilibres
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                    {tousEquilibres ? (
                        <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-800 font-medium">
                                Le bilan est équilibré pour toutes les années
                            </span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <span className="text-yellow-800 font-medium">
                                Attention : le bilan n'est pas équilibré. Vérifiez les données.
                            </span>
                        </>
                    )}
                </div>

                {/* Résumé par année */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {bilans.map(bilan => (
                        <Card key={bilan.annee} variant="bordered" className="p-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900 mb-2">{bilan.annee}</div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-500">Total Actif</div>
                                        <div className="font-semibold text-blue-600">{formatCurrency(bilan.actif.total)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Total Passif</div>
                                        <div className="font-semibold text-green-600">{formatCurrency(bilan.passif.total)}</div>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm">
                                    <span className="text-gray-500">Capitaux propres : </span>
                                    <span className={`font-semibold ${bilan.passif.capitauxPropres >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(bilan.passif.capitauxPropres)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Bilan complet */}
                <div className="grid grid-cols-2 gap-6">
                    {/* ACTIF */}
                    <BilanSection
                        titre="Actif"
                        postes={postesActif}
                        total={{
                            n: bilans[0].actif.total,
                            n1: bilans[1].actif.total,
                            n2: bilans[2].actif.total
                        }}
                        couleurTitre="bg-blue-600"
                        annees={annees}
                    />

                    {/* PASSIF */}
                    <BilanSection
                        titre="Passif"
                        postes={postesPassif}
                        total={{
                            n: bilans[0].passif.total,
                            n1: bilans[1].passif.total,
                            n2: bilans[2].passif.total
                        }}
                        couleurTitre="bg-green-600"
                        annees={annees}
                    />
                </div>

                {/* Explications */}
                <Card variant="bordered" className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Comprendre le bilan prévisionnel</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600 space-y-2">
                        <p>
                            <strong>L'Actif</strong> représente ce que l'entreprise possède : immobilisations
                            (équipements, véhicules...), stocks, créances clients et trésorerie.
                        </p>
                        <p>
                            <strong>Le Passif</strong> représente les ressources de l'entreprise : capitaux propres
                            (capital + résultats accumulés) et dettes (emprunts, fournisseurs, fiscal).
                        </p>
                        <p>
                            <strong>L'équilibre Actif = Passif</strong> est une règle fondamentale de la comptabilité.
                            Si le bilan n'est pas équilibré, vérifiez vos hypothèses de trésorerie ou d'apport en capital.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
