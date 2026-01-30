'use client'

import Link from 'next/link'
import {
    FileSpreadsheet,
    TrendingUp,
    PiggyBank,
    Calculator,
    Building,
    FileText,
    CheckCircle,
    AlertTriangle,
    TrendingDown,
    ArrowRight,
    ArrowLeft
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'

// Types pour les données du dashboard
export interface DashboardData {
    previsionnelId: string
    titre: string
    annees: number[]
    ca: number[]
    resultatNet: number[]
    ebe: number[]
    capitauxPropres: number[]
    endettement: number[]
    tresorerieMin: number[]
    tresorerieFin: number[]
    bfr: number
    tauxMarge: number[]
    ratioEndettement: number[]
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
    const isGood = inverse ? valeur <= seuil : valeur >= seuil
    return (
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isGood ? 'text-success' : 'text-warning'}`}>
                    {formatFn(valeur)}
                </span>
                {isGood ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                )}
            </div>
        </div>
    )
}

export function DashboardView({ donnees }: { donnees: DashboardData }) {
    const { previsionnelId, titre, annees } = donnees

    // Alertes
    const alertes: { type: 'warning' | 'danger' | 'info'; message: string }[] = []

    if (donnees.resultatNet[0] < 0) {
        alertes.push({ type: 'warning', message: `Résultat net négatif en année 1 (${formatCurrency(donnees.resultatNet[0])})` })
    }
    if (donnees.tresorerieMin[0] < 0) {
        alertes.push({ type: 'danger', message: 'Trésorerie négative détectée en année 1' })
    }
    if (donnees.ratioEndettement[0] > 2) {
        alertes.push({ type: 'warning', message: "Ratio d'endettement élevé (> 2) en année 1" })
    }
    if (donnees.ca[0] > 0 && donnees.capitauxPropres[2] > donnees.capitauxPropres[0] * 2) {
        alertes.push({ type: 'info', message: 'Capitaux propres doublés sur la période' })
    }

    return (
        <div className="flex min-h-screen bg-background">
            <PrevisionnelSidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </Link>
                        <h1 className="text-2xl font-semibold tracking-tight">Tableau de Bord</h1>
                        <p className="text-muted-foreground">{titre} - Synthèse sur {annees.length} ans</p>
                    </div>
                    <Link href={`/previsionnel/${previsionnelId}/rapport`}>
                        <Button variant="default">
                            <FileText className="h-4 w-4 mr-2" />
                            Générer le rapport
                        </Button>
                    </Link>
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

                {/* Indicateurs clés */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card variant="bordered" className="p-5">
                        <div className="text-sm text-muted-foreground mb-1">CA Année {annees.length}</div>
                        <div className="text-2xl font-semibold tracking-tight">{formatCurrency(donnees.ca[donnees.ca.length - 1])}</div>
                        {donnees.ca[0] > 0 && (
                            <div className="text-xs text-success mt-1">+{((donnees.ca[donnees.ca.length - 1] / donnees.ca[0] - 1) * 100).toFixed(0)}% vs A1</div>
                        )}
                    </Card>
                    <Card variant="bordered" className="p-5">
                        <div className="text-sm text-muted-foreground mb-1">Résultat cumulé</div>
                        <div className={`text-2xl font-semibold tracking-tight ${donnees.resultatNet.reduce((a, b) => a + b, 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(donnees.resultatNet.reduce((a, b) => a + b, 0))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">sur {annees.length} ans</div>
                    </Card>
                    <Card variant="bordered" className="p-5">
                        <div className="text-sm text-muted-foreground mb-1">Trésorerie fin A{annees.length}</div>
                        <div className={`text-2xl font-semibold tracking-tight ${donnees.tresorerieFin[donnees.tresorerieFin.length - 1] >= 0 ? 'text-accent' : 'text-danger'}`}>
                            {formatCurrency(donnees.tresorerieFin[donnees.tresorerieFin.length - 1])}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">solde disponible</div>
                    </Card>
                    <Card variant="bordered" className="p-5">
                        <div className="text-sm text-muted-foreground mb-1">Capitaux propres A{annees.length}</div>
                        <div className="text-2xl font-semibold tracking-tight text-success">{formatCurrency(donnees.capitauxPropres[donnees.capitauxPropres.length - 1])}</div>
                        {donnees.capitauxPropres[0] > 0 && (
                            <div className="text-xs text-success mt-1">+{((donnees.capitauxPropres[donnees.capitauxPropres.length - 1] / donnees.capitauxPropres[0] - 1) * 100).toFixed(0)}% vs A1</div>
                        )}
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
                                className="text-sm text-accent hover:underline flex items-center gap-1"
                            >
                                Détails <ArrowRight className="h-3 w-3" />
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
                                        <td className="py-3">Résultat Net</td>
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

                    {/* Bilan synthétique */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Bilan</CardTitle>
                            <Link
                                href={`/previsionnel/${previsionnelId}/bilan`}
                                className="text-sm text-accent hover:underline flex items-center gap-1"
                            >
                                Détails <ArrowRight className="h-3 w-3" />
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

                {/* Trésorerie et ratios */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Trésorerie */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Trésorerie</CardTitle>
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
                                        <td className="py-3">Trésorerie minimum</td>
                                        {donnees.tresorerieMin.map((v, i) => (
                                            <td key={i} className={`py-3 text-right ${v >= 0 ? '' : 'text-danger font-semibold'}`}>
                                                {formatCurrency(v)}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="py-3">Trésorerie fin d&apos;année</td>
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

                    {/* Indicateurs de santé */}
                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle className="text-lg">Indicateurs de Santé</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StatutIndicateur
                                label={`Résultat net A${annees.length}`}
                                valeur={donnees.resultatNet[donnees.resultatNet.length - 1]}
                                seuil={0}
                            />
                            <StatutIndicateur
                                label={`Taux de marge (EBE/CA) A${annees.length}`}
                                valeur={donnees.tauxMarge[donnees.tauxMarge.length - 1]}
                                seuil={15}
                                formatFn={(n) => `${n.toFixed(1)}%`}
                            />
                            <StatutIndicateur
                                label={`Ratio d'endettement A${annees.length}`}
                                valeur={donnees.ratioEndettement[donnees.ratioEndettement.length - 1]}
                                seuil={1}
                                inverse={true}
                                formatFn={(n) => n.toFixed(2)}
                            />
                            <StatutIndicateur
                                label={`Trésorerie fin A${annees.length}`}
                                valeur={donnees.tresorerieFin[donnees.tresorerieFin.length - 1]}
                                seuil={5000}
                            />
                            {donnees.ca[0] > 0 && (
                                <StatutIndicateur
                                    label="Croissance CA (A1-A3)"
                                    valeur={((donnees.ca[donnees.ca.length - 1] / donnees.ca[0] - 1) * 100)}
                                    seuil={20}
                                    formatFn={(n) => `${n.toFixed(0)}%`}
                                />
                            )}
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
                                { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Résultat', icon: FileSpreadsheet },
                                { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building },
                                { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan', icon: Calculator },
                                { href: `/previsionnel/${previsionnelId}/financement`, label: 'Financement', icon: TrendingUp },
                                { href: `/previsionnel/${previsionnelId}/tresorerie`, label: 'Trésorerie', icon: PiggyBank },
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
