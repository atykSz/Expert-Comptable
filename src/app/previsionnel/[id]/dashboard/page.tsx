'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
    FileSpreadsheet,
    TrendingUp,
    PiggyBank,
    Calculator,
    Building,
    Download,
    FileText,
    Table,
    BarChart3,
    CheckCircle,
    AlertTriangle,
    TrendingDown,
    ArrowRight
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

// Navigation latérale avec dashboard
function Sidebar({ previsionnelId }: { previsionnelId: string }) {
    const navItems = [
        { href: `/previsionnel/${previsionnelId}/dashboard`, label: 'Tableau de Bord', icon: BarChart3, active: true },
        { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Résultat', icon: FileSpreadsheet },
        { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building },
        { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan Prévisionnel', icon: Calculator },
        { href: `/previsionnel/${previsionnelId}/financement`, label: 'Plan de Financement', icon: TrendingUp },
        { href: `/previsionnel/${previsionnelId}/tresorerie`, label: 'Plan de Trésorerie', icon: PiggyBank },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-gray-900">Expert-Comptable</span>
            </Link>

            <nav className="space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.active
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Actions export */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-400 uppercase mb-3">Exports</div>
                <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF (bientôt)
                    </Button>
                    <a href={`/api/exports/excel/${previsionnelId}`} download>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Table className="h-4 w-4 mr-2" />
                            Export Excel
                        </Button>
                    </a>
                </div>
            </div>
        </aside>
    )
}

// Indicateur avec statut
function StatutIndicateur({
    label,
    valeur,
    seuil = 0,
    inversé = false,
    formatFn = formatCurrency
}: {
    label: string
    valeur: number
    seuil?: number
    inversé?: boolean
    formatFn?: (n: number) => string
}) {
    const estBon = inversé ? valeur <= seuil : valeur >= seuil

    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
                {estBon ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
                <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className={`font-semibold ${estBon ? 'text-green-600' : 'text-orange-600'}`}>
                {formatFn(valeur)}
            </span>
        </div>
    )
}

export default function DashboardPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const previsionnelId = 'demo'
    const annees = [2026, 2027, 2028]

    // Données synthétiques (en production, viendrait de la consolidation de tous les modules)
    const donnees = useMemo(() => ({
        // Compte de résultat
        ca: [60000, 72000, 87000],
        resultatNet: [-600, 5000, 12000],
        ebe: [8000, 15000, 22000],

        // Bilan
        capitauxPropres: [9400, 14400, 26400],
        endettement: [30000, 24000, 18000],

        // Trésorerie
        tresorerieMin: [-2500, 1000, 5000],
        tresorerieFin: [5000, 12000, 22000],
        bfr: 8500,

        // Investissements
        totalInvest: 38000,
        dotationsAn1: 11217,

        // Ratios
        tauxMarge: [13.3, 20.8, 25.3], // EBE / CA
        ratioEndettement: [3.19, 1.67, 0.68], // Dettes / CP
    }), [])

    // Alertes
    const alertes = useMemo(() => {
        const liste: { type: 'warning' | 'danger' | 'info'; message: string }[] = []

        if (donnees.resultatNet[0] < 0) {
            liste.push({ type: 'warning', message: 'Résultat net négatif en année 1 (-600 €)' })
        }
        if (donnees.tresorerieMin[0] < 0) {
            liste.push({ type: 'danger', message: 'Trésorerie négative détectée en année 1' })
        }
        if (donnees.ratioEndettement[0] > 2) {
            liste.push({ type: 'warning', message: 'Ratio d\'endettement élevé (> 2) en année 1' })
        }
        if (donnees.capitauxPropres[2] > donnees.capitauxPropres[0] * 2) {
            liste.push({ type: 'info', message: 'Capitaux propres doublés sur la période (+181%)' })
        }

        return liste
    }, [donnees])

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
                        <p className="text-gray-600">Synthèse du prévisionnel sur 3 ans</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Exporter tout
                        </Button>
                    </div>
                </div>

                {/* Alertes */}
                {alertes.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {alertes.map((alerte, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg flex items-center gap-3 ${alerte.type === 'danger' ? 'bg-red-50 border border-red-200' :
                                    alerte.type === 'warning' ? 'bg-orange-50 border border-orange-200' :
                                        'bg-blue-50 border border-blue-200'
                                    }`}
                            >
                                {alerte.type === 'danger' ? (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                ) : alerte.type === 'warning' ? (
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                )}
                                <span className={`text-sm ${alerte.type === 'danger' ? 'text-red-800' :
                                    alerte.type === 'warning' ? 'text-orange-800' :
                                        'text-blue-800'
                                    }`}>
                                    {alerte.message}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Indicateurs clés */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">CA Année 3</div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(donnees.ca[2])}</div>
                        <div className="text-xs text-green-600">+{((donnees.ca[2] / donnees.ca[0] - 1) * 100).toFixed(0)}% vs A1</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Résultat cumulé</div>
                        <div className={`text-2xl font-bold ${donnees.resultatNet.reduce((a, b) => a + b, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(donnees.resultatNet.reduce((a, b) => a + b, 0))}
                        </div>
                        <div className="text-xs text-gray-400">sur 3 ans</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Trésorerie fin A3</div>
                        <div className={`text-2xl font-bold ${donnees.tresorerieFin[2] >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(donnees.tresorerieFin[2])}
                        </div>
                        <div className="text-xs text-gray-400">solde disponible</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Capitaux propres A3</div>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(donnees.capitauxPropres[2])}</div>
                        <div className="text-xs text-green-600">+{((donnees.capitauxPropres[2] / donnees.capitauxPropres[0] - 1) * 100).toFixed(0)}% vs A1</div>
                    </Card>
                </div>

                {/* Tableaux de synthèse */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Compte de résultat synthétique */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Compte de Résultat</CardTitle>
                            <Link
                                href={`/previsionnel/${previsionnelId}/compte-resultat`}
                                className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                                Détails <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left font-medium text-gray-600">Poste</th>
                                        {annees.map(a => (
                                            <th key={a} className="py-2 text-right font-medium text-gray-600">{a}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">Chiffre d'affaires</td>
                                        {donnees.ca.map((v, i) => (
                                            <td key={i} className="py-2 text-right">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">EBE</td>
                                        {donnees.ebe.map((v, i) => (
                                            <td key={i} className="py-2 text-right">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="bg-gray-50 font-semibold">
                                        <td className="py-2">Résultat Net</td>
                                        {donnees.resultatNet.map((v, i) => (
                                            <td key={i} className={`py-2 text-right ${v >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(v)}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Bilan synthétique */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Bilan</CardTitle>
                            <Link
                                href={`/previsionnel/${previsionnelId}/bilan`}
                                className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                                Détails <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left font-medium text-gray-600">Poste</th>
                                        {annees.map(a => (
                                            <th key={a} className="py-2 text-right font-medium text-gray-600">{a}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">Capitaux propres</td>
                                        {donnees.capitauxPropres.map((v, i) => (
                                            <td key={i} className="py-2 text-right text-green-600">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Endettement (emprunts)</td>
                                        {donnees.endettement.map((v, i) => (
                                            <td key={i} className="py-2 text-right text-orange-600">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="py-2">Ratio Dettes/CP</td>
                                        {donnees.ratioEndettement.map((v, i) => (
                                            <td key={i} className={`py-2 text-right font-semibold ${v <= 1 ? 'text-green-600' : v <= 2 ? 'text-orange-600' : 'text-red-600'}`}>
                                                {v.toFixed(2)}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Trésorerie et ratios */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Trésorerie */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Trésorerie</CardTitle>
                            <Link
                                href={`/previsionnel/${previsionnelId}/tresorerie`}
                                className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                                Détails <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left font-medium text-gray-600">Indicateur</th>
                                        {annees.map(a => (
                                            <th key={a} className="py-2 text-right font-medium text-gray-600">{a}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">Trésorerie minimum</td>
                                        {donnees.tresorerieMin.map((v, i) => (
                                            <td key={i} className={`py-2 text-right ${v >= 0 ? '' : 'text-red-600 font-semibold'}`}>
                                                {formatCurrency(v)}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Trésorerie fin d'année</td>
                                        {donnees.tresorerieFin.map((v, i) => (
                                            <td key={i} className="py-2 text-right">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="py-2">BFR</td>
                                        <td colSpan={3} className="py-2 text-right font-semibold text-orange-600">
                                            {formatCurrency(donnees.bfr)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Indicateurs de santé */}
                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle className="text-lg">Indicateurs de Santé</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <StatutIndicateur
                                    label="Résultat net A3"
                                    valeur={donnees.resultatNet[2]}
                                    seuil={0}
                                />
                                <StatutIndicateur
                                    label="Taux de marge (EBE/CA) A3"
                                    valeur={donnees.tauxMarge[2]}
                                    seuil={15}
                                    formatFn={(n) => `${n.toFixed(1)}%`}
                                />
                                <StatutIndicateur
                                    label="Ratio d'endettement A3"
                                    valeur={donnees.ratioEndettement[2]}
                                    seuil={1}
                                    inversé={true}
                                    formatFn={(n) => n.toFixed(2)}
                                />
                                <StatutIndicateur
                                    label="Trésorerie fin A3"
                                    valeur={donnees.tresorerieFin[2]}
                                    seuil={5000}
                                />
                                <StatutIndicateur
                                    label="Croissance CA (A1→A3)"
                                    valeur={((donnees.ca[2] / donnees.ca[0] - 1) * 100)}
                                    seuil={20}
                                    formatFn={(n) => `${n.toFixed(0)}%`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Modules rapides */}
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-lg">Accès Rapide aux Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-4">
                            {[
                                { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Résultat', icon: FileSpreadsheet, color: 'blue' },
                                { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building, color: 'purple' },
                                { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan', icon: Calculator, color: 'green' },
                                { href: `/previsionnel/${previsionnelId}/financement`, label: 'Financement', icon: TrendingUp, color: 'orange' },
                                { href: `/previsionnel/${previsionnelId}/tresorerie`, label: 'Trésorerie', icon: PiggyBank, color: 'cyan' },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`p-4 rounded-lg border-2 border-${item.color}-200 bg-${item.color}-50 hover:bg-${item.color}-100 transition-colors text-center`}
                                >
                                    <item.icon className={`h-8 w-8 mx-auto mb-2 text-${item.color}-600`} />
                                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
