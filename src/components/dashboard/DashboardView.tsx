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
    ArrowLeft,
    DollarSign,
    Wallet,
    PieChart,
    Lightbulb
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'
import { KPICard } from './KPICard'
import { CircularGauge, ProgressGauge } from './ProgressGauge'
import {
    BarChartComponent,
    LineChartComponent,
    PieChartComponent
} from '@/components/charts'
import { FinancialAlert } from '@/lib/analysis/alerts'
import { BreakEvenAnalysis } from '@/lib/analysis/breakeven'

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
    // Nouvelles données pour les graphiques
    tresorerieMensuelle?: { mois: string; solde: number }[]
    repartitionCharges?: { name: string; value: number }[]

    // Analysis
    alertes?: FinancialAlert[]
    breakEven?: BreakEvenAnalysis
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

    // Préparer les données pour les graphiques
    const chartDataAnnuel = annees.map((annee, i) => ({
        name: `${annee}`,
        ca: donnees.ca[i] || 0,
        ebe: donnees.ebe[i] || 0,
        resultat: donnees.resultatNet[i] || 0,
        value: donnees.ca[i] || 0
    }))

    const tresorerieChartData = donnees.tresorerieMensuelle
        ? donnees.tresorerieMensuelle.map(d => ({ name: d.mois, value: d.solde, solde: d.solde }))
        : annees.map((annee, i) => ({
            name: `Fin ${annee}`,
            value: donnees.tresorerieFin[i] || 0,
            solde: donnees.tresorerieFin[i] || 0
        }))

    // Rentabilité EBE/CA en %
    const rentabilite = donnees.ca[donnees.ca.length - 1] > 0
        ? (donnees.ebe[donnees.ebe.length - 1] / donnees.ca[donnees.ca.length - 1]) * 100
        : 0

    // Ratio endettement inversé (plus c'est bas, mieux c'est)
    const endettementScore = Math.max(0, 100 - donnees.ratioEndettement[donnees.ratioEndettement.length - 1] * 33)

    // Alertes du backend
    const dynamicAlertes = donnees.alertes || []

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

                {/* Alertes Intelligentes */}
                {dynamicAlertes.length > 0 && (
                    <div className="mb-6 grid gap-3">
                        {dynamicAlertes.map((alerte, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl flex items-start gap-4 border ${alerte.type === 'danger' ? 'bg-red-50 border-red-200 text-red-900' :
                                    alerte.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                                        'bg-blue-50 border-blue-200 text-blue-900'
                                    }`}
                            >
                                <div className={`mt-0.5 p-1.5 rounded-full ${alerte.type === 'danger' ? 'bg-red-100 text-red-600' :
                                    alerte.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    {alerte.type === 'danger' ? (
                                        <TrendingDown className="h-4 w-4" />
                                    ) : alerte.type === 'warning' ? (
                                        <AlertTriangle className="h-4 w-4" />
                                    ) : (
                                        <Lightbulb className="h-4 w-4" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                                        {alerte.title}
                                        {alerte.type === 'danger' && <Badge variant="destructive" className="h-5 text-[10px]">Critique</Badge>}
                                    </h4>
                                    <p className="text-sm opacity-90 mb-1">{alerte.message}</p>
                                    <p className="text-xs font-medium opacity-75 flex items-center gap-1">
                                        <ArrowRight className="h-3 w-3" />
                                        Conseil : {alerte.suggestion}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* KPI Cards avec Sparklines */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <KPICard
                        label={`CA Année ${annees.length}`}
                        value={donnees.ca[donnees.ca.length - 1]}
                        previousValue={donnees.ca[0]}
                        sparklineData={donnees.ca}
                        icon={<DollarSign className="h-4 w-4" />}
                        color="accent"
                        subtitle={`+${((donnees.ca[donnees.ca.length - 1] / donnees.ca[0] - 1) * 100 || 0).toFixed(0)}% vs A1`}
                    />
                    <KPICard
                        label="Résultat Cumulé"
                        value={donnees.resultatNet.reduce((a, b) => a + b, 0)}
                        sparklineData={donnees.resultatNet}
                        icon={<TrendingUp className="h-4 w-4" />}
                        color={donnees.resultatNet.reduce((a, b) => a + b, 0) >= 0 ? 'success' : 'danger'}
                        subtitle={`sur ${annees.length} ans`}
                    />
                    <KPICard
                        label={`Trésorerie Fin A${annees.length}`}
                        value={donnees.tresorerieFin[donnees.tresorerieFin.length - 1]}
                        sparklineData={donnees.tresorerieFin}
                        icon={<Wallet className="h-4 w-4" />}
                        color={donnees.tresorerieFin[donnees.tresorerieFin.length - 1] >= 0 ? 'accent' : 'danger'}
                        subtitle="solde disponible"
                    />
                    <KPICard
                        label={`Capitaux Propres A${annees.length}`}
                        value={donnees.capitauxPropres[donnees.capitauxPropres.length - 1]}
                        previousValue={donnees.capitauxPropres[0]}
                        sparklineData={donnees.capitauxPropres}
                        icon={<Building className="h-4 w-4" />}
                        color="success"
                    />
                </div>

                {/* Graphique Principal : CA / EBE / Résultat */}
                <Card variant="bordered" className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Évolution Financière par Année
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChartComponent
                            data={chartDataAnnuel}
                            dataKeys={[
                                { key: 'ca', color: '#3B82F6', name: "Chiffre d'affaires" },
                                { key: 'ebe', color: '#10B981', name: 'EBE' },
                                { key: 'resultat', color: '#8B5CF6', name: 'Résultat Net' }
                            ]}
                        />
                        {/* Seuil de Rentabilité Widget */}
                        {donnees.breakEven && (
                            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Seuil de Rentabilité</div>
                                    <div className="text-2xl font-bold">{formatCurrency(donnees.breakEven.seuilRentabilite)}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Charges Fixes : {formatCurrency(donnees.breakEven.chargesFixes)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Point Mort</div>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        {donnees.breakEven.pointMortMois.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">mois</span>
                                    </div>
                                    {donnees.breakEven.pointMortDate && (
                                        <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Atteint le {new Date(donnees.breakEven.pointMortDate).toLocaleDateString('fr-FR')}
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2 bg-secondary/20 p-3 rounded-lg flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        <TrendingUp className="h-5 w-5 text-accent" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">Analyse Point Mort</div>
                                        <p className="text-xs text-muted-foreground">
                                            Vous commencez à gagner de l'argent après {formatCurrency(donnees.breakEven.seuilRentabilite)} de CA.
                                            Les charges fixes représentent {((donnees.breakEven.chargesFixes / (donnees.ca[0] || 1)) * 100).toFixed(0)}% du CA Année 1.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Graphiques secondaires */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Trésorerie */}
                    <Card variant="bordered">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Évolution Trésorerie</CardTitle>
                            <Link
                                href={`/previsionnel/${previsionnelId}/tresorerie`}
                                className="text-sm text-accent hover:underline flex items-center gap-1"
                            >
                                Détails <ArrowRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <LineChartComponent
                                data={tresorerieChartData}
                                dataKeys={[
                                    { key: 'solde', color: '#3B82F6', name: 'Solde' }
                                ]}
                            />
                        </CardContent>
                    </Card>

                    {/* Jauges de Santé */}
                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle className="text-lg">Indicateurs de Santé</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-around items-center py-4">
                                <CircularGauge
                                    value={Math.max(0, rentabilite)}
                                    max={40}
                                    label="Rentabilité (EBE/CA)"
                                    formatValue={(v) => `${v.toFixed(0)}%`}
                                    thresholds={{ warning: 30, danger: 10 }}
                                    variant={rentabilite >= 15 ? 'success' : rentabilite >= 5 ? 'warning' : 'danger'}
                                />
                                <CircularGauge
                                    value={endettementScore}
                                    max={100}
                                    label="Score Solvabilité"
                                    formatValue={(v) => `${v.toFixed(0)}`}
                                    thresholds={{ warning: 40, danger: 20 }}
                                    variant={endettementScore >= 66 ? 'success' : endettementScore >= 33 ? 'warning' : 'danger'}
                                />
                            </div>
                            <div className="mt-6 space-y-4">
                                <ProgressGauge
                                    value={donnees.tauxMarge[donnees.tauxMarge.length - 1]}
                                    max={50}
                                    label="Taux de Marge (EBE/CA)"
                                    variant={donnees.tauxMarge[donnees.tauxMarge.length - 1] >= 15 ? 'success' : 'warning'}
                                />
                                <ProgressGauge
                                    value={Math.min(donnees.ratioEndettement[donnees.ratioEndettement.length - 1] * 33, 100)}
                                    max={100}
                                    label="Ratio Endettement"
                                    thresholds={{ warning: 33, danger: 66 }}
                                />
                            </div>
                        </CardContent>
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

                {/* Trésorerie détaillée et indicateurs */}
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

                    {/* Indicateurs de santé détaillés */}
                    <Card variant="bordered">
                        <CardHeader>
                            <CardTitle className="text-lg">Récapitulatif</CardTitle>
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
