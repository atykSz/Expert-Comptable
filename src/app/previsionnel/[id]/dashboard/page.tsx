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
    ArrowRight,
    ArrowLeft
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

// Navigation laterale avec dashboard
function Sidebar({ previsionnelId }: { previsionnelId: string }) {
    const navItems = [
        { href: `/previsionnel/${previsionnelId}/dashboard`, label: 'Tableau de Bord', icon: BarChart3, active: true },
        { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Resultat', icon: FileSpreadsheet },
        { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building },
        { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan Previsionnel', icon: Calculator },
        { href: `/previsionnel/${previsionnelId}/financement`, label: 'Plan de Financement', icon: TrendingUp },
        { href: `/previsionnel/${previsionnelId}/tresorerie`, label: 'Plan de Tresorerie', icon: PiggyBank },
    ]

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen p-5">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-background" />
                </div>
                <span className="font-semibold tracking-tight">Expert-Comptable</span>
            </Link>

            <nav className="space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${item.active
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Actions export */}
            <div className="mt-8 pt-8 border-t border-border">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Exports</div>
                <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF (bientot)
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
    inverse = false,
    formatFn = formatCurrency
}: {
    label: string
    valeur: number
    seuil?: number
    inverse?: boolean
    formatFn?: (n: number) => string
}) {
    const estBon = inverse ? valeur <= seuil : valeur >= seuil

    return (
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
                {estBon ? (
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                )}
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className={`font-semibold ${estBon ? 'text-success' : 'text-warning'}`}>
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

    // Donnees synthetiques (en production, viendrait de la consolidation de tous les modules)
    const donnees = useMemo(() => ({
        // Compte de resultat
        ca: [60000, 72000, 87000],
        resultatNet: [-600, 5000, 12000],
        ebe: [8000, 15000, 22000],

        // Bilan
        capitauxPropres: [9400, 14400, 26400],
        endettement: [30000, 24000, 18000],

        // Tresorerie
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
            liste.push({ type: 'warning', message: 'Resultat net negatif en annee 1 (-600 EUR)' })
        }
        if (donnees.tresorerieMin[0] < 0) {
            liste.push({ type: 'danger', message: 'Tresorerie negative detectee en annee 1' })
        }
        if (donnees.ratioEndettement[0] > 2) {
            liste.push({ type: 'warning', message: 'Ratio d\'endettement eleve (> 2) en annee 1' })
        }
        if (donnees.capitauxPropres[2] > donnees.capitauxPropres[0] * 2) {
            liste.push({ type: 'info', message: 'Capitaux propres doubles sur la periode (+181%)' })
        }

        return liste
    }, [donnees])

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </Link>
                        <h1 className="text-2xl font-semibold tracking-tight">Tableau de Bord</h1>
                        <p className="text-muted-foreground">Synthese du previsionnel sur 3 ans</p>
                    </div>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter tout
                    </Button>
                </div>

                {/* Alertes */}
                {alertes.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {alertes.map((alerte, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl flex items-center gap-3 ${alerte.type === 'danger' ? 'bg-danger/10 text-danger' :
                                    alerte.type === 'warning' ? 'bg-warning/10 text-warning' :
                                        'bg-accent/10 text-accent'
                                    }`}
                            >
                                {alerte.type === 'danger' ? (
                                    <TrendingDown className="h-5 w-5" />
                                ) : alerte.type === 'warning' ? (
                                    <AlertTriangle className="h-5 w-5" />
                                ) : (
                                    <CheckCircle className="h-5 w-5" />
                                )}
                                <span className="text-sm font-medium">
                                    {alerte.message}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Indicateurs cles */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card variant="bordered" className="p-5">
                        <div className="text-sm text-muted-foreground mb-1">CA Annee 3</div>
                        <div className="text-2xl font-semibold tracking-tight">{formatCurrency(donnees.ca[2])}</div>
                        <div className="text-xs text-success mt-1">+{((donnees.ca[2] / donnees.ca[0] - 1) * 100).toFixed(0)}% vs A1</div>
                    </Card>
                    <Card variant="bordered" className="p-5">
                        <div className="text-sm text-muted-foreground mb-1">Resultat cumule</div>
                        <div className={`text-2xl font-semibold tracking-tight ${donnees.resultatNet.reduce((a, b) => a + b, 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(donnees.resultatNet.reduce((a, b) => a + b, 0))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">sur 3 ans</div>
                    </Card>
                    <Card variant="bordered" className="p-5">
                        <div className="text-sm text-muted-foreground mb-1">Tresorerie fin A3</div>
                        <div className={`text-2xl font-semibold tracking-tight ${donnees.tresorerieFin[2] >= 0 ? 'text-accent' : 'text-danger'}`}>
                            {formatCurrency(donnees.tresorerieFin[2])}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">solde disponible</div>
                    </Card>
                    <Card variant="bordered" className="p-5">
                        <div className="text-sm text-muted-foreground mb-1">Capitaux propres A3</div>
                        <div className="text-2xl font-semibold tracking-tight text-success">{formatCurrency(donnees.capitauxPropres[2])}</div>
                        <div className="text-xs text-success mt-1">+{((donnees.capitauxPropres[2] / donnees.capitauxPropres[0] - 1) * 100).toFixed(0)}% vs A1</div>
                    </Card>
                </div>

                {/* Tableaux de synthese */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Compte de resultat synthetique */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Compte de Resultat</CardTitle>
                            <Link
                                href={`/previsionnel/${previsionnelId}/compte-resultat`}
                                className="text-sm text-accent hover:underline flex items-center gap-1"
                            >
                                Details <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-3 text-left font-medium text-muted-foreground">Poste</th>
                                        {annees.map(a => (
                                            <th key={a} className="py-3 text-right font-medium text-muted-foreground">{a}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border">
                                        <td className="py-3">Chiffre d&apos;affaires</td>
                                        {donnees.ca.map((v, i) => (
                                            <td key={i} className="py-3 text-right">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="py-3">EBE</td>
                                        {donnees.ebe.map((v, i) => (
                                            <td key={i} className="py-3 text-right">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="bg-secondary/50 font-semibold">
                                        <td className="py-3">Resultat Net</td>
                                        {donnees.resultatNet.map((v, i) => (
                                            <td key={i} className={`py-3 text-right ${v >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {formatCurrency(v)}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Bilan synthetique */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Bilan</CardTitle>
                            <Link
                                href={`/previsionnel/${previsionnelId}/bilan`}
                                className="text-sm text-accent hover:underline flex items-center gap-1"
                            >
                                Details <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-3 text-left font-medium text-muted-foreground">Poste</th>
                                        {annees.map(a => (
                                            <th key={a} className="py-3 text-right font-medium text-muted-foreground">{a}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border">
                                        <td className="py-3">Capitaux propres</td>
                                        {donnees.capitauxPropres.map((v, i) => (
                                            <td key={i} className="py-3 text-right text-success">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="py-3">Endettement (emprunts)</td>
                                        {donnees.endettement.map((v, i) => (
                                            <td key={i} className="py-3 text-right text-warning">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="bg-secondary/50">
                                        <td className="py-3">Ratio Dettes/CP</td>
                                        {donnees.ratioEndettement.map((v, i) => (
                                            <td key={i} className={`py-3 text-right font-semibold ${v <= 1 ? 'text-success' : v <= 2 ? 'text-warning' : 'text-danger'}`}>
                                                {v.toFixed(2)}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Tresorerie et ratios */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Tresorerie */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Tresorerie</CardTitle>
                            <Link
                                href={`/previsionnel/${previsionnelId}/tresorerie`}
                                className="text-sm text-accent hover:underline flex items-center gap-1"
                            >
                                Details <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-3 text-left font-medium text-muted-foreground">Indicateur</th>
                                        {annees.map(a => (
                                            <th key={a} className="py-3 text-right font-medium text-muted-foreground">{a}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border">
                                        <td className="py-3">Tresorerie minimum</td>
                                        {donnees.tresorerieMin.map((v, i) => (
                                            <td key={i} className={`py-3 text-right ${v >= 0 ? '' : 'text-danger font-semibold'}`}>
                                                {formatCurrency(v)}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="py-3">Tresorerie fin d&apos;annee</td>
                                        {donnees.tresorerieFin.map((v, i) => (
                                            <td key={i} className="py-3 text-right">{formatCurrency(v)}</td>
                                        ))}
                                    </tr>
                                    <tr className="bg-secondary/50">
                                        <td className="py-3">BFR</td>
                                        <td colSpan={3} className="py-3 text-right font-semibold text-warning">
                                            {formatCurrency(donnees.bfr)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Indicateurs de sante */}
                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle className="text-lg">Indicateurs de Sante</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StatutIndicateur
                                label="Resultat net A3"
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
                                inverse={true}
                                formatFn={(n) => n.toFixed(2)}
                            />
                            <StatutIndicateur
                                label="Tresorerie fin A3"
                                valeur={donnees.tresorerieFin[2]}
                                seuil={5000}
                            />
                            <StatutIndicateur
                                label="Croissance CA (A1-A3)"
                                valeur={((donnees.ca[2] / donnees.ca[0] - 1) * 100)}
                                seuil={20}
                                formatFn={(n) => `${n.toFixed(0)}%`}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Modules rapides */}
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-lg">Acces Rapide aux Modules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-4">
                            {[
                                { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Resultat', icon: FileSpreadsheet },
                                { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building },
                                { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan', icon: Calculator },
                                { href: `/previsionnel/${previsionnelId}/financement`, label: 'Financement', icon: TrendingUp },
                                { href: `/previsionnel/${previsionnelId}/tresorerie`, label: 'Tresorerie', icon: PiggyBank },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="p-4 rounded-xl border border-border bg-card hover:bg-secondary hover:border-foreground/20 transition-all text-center group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-secondary mx-auto mb-3 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
