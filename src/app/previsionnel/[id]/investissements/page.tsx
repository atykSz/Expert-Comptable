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
    Car,
    Monitor,
    Wrench,
    ChevronDown,
    ChevronRight,
    Trash2
} from 'lucide-react'
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import {
    calculerAmortissement,
    getDotationPourAnnee,
    type LigneAmortissement,
    type Investissement as InvestissementType
} from '@/lib/calculations/amortissements'

interface Investissement {
    id: string
    libelle: string
    categorie: CategorieInvestissement
    montantHT: number
    tauxTVA: number
    dateAcquisition: string
    modeAmortissement: 'LINEAIRE' | 'DEGRESSIF' | 'NON_AMORTISSABLE'
    dureeAmortissement: number // en années (converti en mois pour le calcul)
}

type CategorieInvestissement =
    | 'CONSTRUCTIONS'
    | 'INSTALLATIONS_TECHNIQUES'
    | 'MATERIEL_TRANSPORT'
    | 'MATERIEL_BUREAU'
    | 'MATERIEL_INFORMATIQUE'
    | 'MOBILIER'
    | 'AGENCEMENTS'
    | 'LOGICIELS'
    | 'FONDS_COMMERCE'
    | 'DROIT_AU_BAIL'

const categoriesInvestissement = [
    { value: 'CONSTRUCTIONS', label: 'Constructions', icon: Building, dureeDefaut: 20, compte: '213' },
    { value: 'INSTALLATIONS_TECHNIQUES', label: 'Installations techniques', icon: Wrench, dureeDefaut: 10, compte: '215' },
    { value: 'MATERIEL_TRANSPORT', label: 'Matériel de transport', icon: Car, dureeDefaut: 5, compte: '2182' },
    { value: 'MATERIEL_BUREAU', label: 'Matériel de bureau', icon: Monitor, dureeDefaut: 5, compte: '2183' },
    { value: 'MATERIEL_INFORMATIQUE', label: 'Matériel informatique', icon: Monitor, dureeDefaut: 3, compte: '2183' },
    { value: 'MOBILIER', label: 'Mobilier', icon: Building, dureeDefaut: 10, compte: '2184' },
    { value: 'AGENCEMENTS', label: 'Agencements et aménagements', icon: Building, dureeDefaut: 10, compte: '2181' },
    { value: 'LOGICIELS', label: 'Logiciels', icon: Monitor, dureeDefaut: 3, compte: '205' },
    { value: 'FONDS_COMMERCE', label: 'Fonds de commerce', icon: Building, dureeDefaut: 0, compte: '207' },
    { value: 'DROIT_AU_BAIL', label: 'Droit au bail', icon: Building, dureeDefaut: 0, compte: '206' },
]

const modesAmortissement = [
    { value: 'LINEAIRE', label: 'Linéaire' },
    { value: 'DEGRESSIF', label: 'Dégressif' },
]

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

// Convertir investissement local vers le format du calcul
function toInvestissementCalc(inv: Investissement): InvestissementType {
    return {
        id: inv.id,
        libelle: inv.libelle,
        montantHT: inv.montantHT,
        dateAcquisition: new Date(inv.dateAcquisition),
        dureeAmortissement: inv.dureeAmortissement * 12, // Converti en mois
        modeAmortissement: inv.modeAmortissement,
    }
}

// Navigation latérale
function Sidebar({ previsionnelId }: { previsionnelId: string }) {
    const navItems = [
        { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Résultat', icon: FileSpreadsheet },
        { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building, active: true },
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
        </aside>
    )
}

// Ligne d'investissement avec tableau d'amortissement
function InvestissementRow({
    investissement,
    onUpdate,
    onDelete,
}: {
    investissement: Investissement
    onUpdate: (id: string, field: keyof Investissement, value: unknown) => void
    onDelete: (id: string) => void
}) {
    const [expanded, setExpanded] = useState(false)

    // Calcul du tableau d'amortissement
    const tableauAmortissement = useMemo((): LigneAmortissement[] => {
        if (!investissement.montantHT || !investissement.dureeAmortissement) return []

        const invCalc = toInvestissementCalc(investissement)
        return calculerAmortissement(invCalc)
    }, [investissement])

    const vncFin = tableauAmortissement.length > 0
        ? tableauAmortissement[tableauAmortissement.length - 1].valeurNetteComptable
        : investissement.montantHT

    const categorieInfo = categoriesInvestissement.find(c => c.value === investissement.categorie)
    const IconComponent = categorieInfo?.icon || Building

    return (
        <div className="border border-gray-200 rounded-lg mb-3">
            <div className="flex items-center gap-4 p-4 bg-gray-50">
                <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 grid grid-cols-4 gap-4">
                    <Input
                        value={investissement.libelle}
                        onChange={(e) => onUpdate(investissement.id, 'libelle', e.target.value)}
                        placeholder="Libellé"
                        className="bg-white"
                    />
                    <Input
                        type="number"
                        value={investissement.montantHT}
                        onChange={(e) => onUpdate(investissement.id, 'montantHT', parseFloat(e.target.value) || 0)}
                        placeholder="Montant HT"
                        className="bg-white"
                    />
                    <Select
                        options={modesAmortissement}
                        value={investissement.modeAmortissement}
                        onChange={(e) => onUpdate(investissement.id, 'modeAmortissement', e.target.value)}
                    />
                    <Input
                        type="number"
                        value={investissement.dureeAmortissement}
                        onChange={(e) => onUpdate(investissement.id, 'dureeAmortissement', parseInt(e.target.value) || 0)}
                        placeholder="Durée (ans)"
                        className="bg-white"
                    />
                </div>
                <div className="w-32 text-right">
                    <div className="text-sm text-gray-500">VNC finale</div>
                    <div className="font-semibold">{formatCurrency(vncFin)}</div>
                </div>
                <button
                    onClick={() => onDelete(investissement.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {expanded && (
                <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input
                            type="date"
                            label="Date d'acquisition"
                            value={investissement.dateAcquisition}
                            onChange={(e) => onUpdate(investissement.id, 'dateAcquisition', e.target.value)}
                        />
                        <Select
                            label="Catégorie d'immobilisation"
                            options={categoriesInvestissement}
                            value={investissement.categorie}
                            onChange={(e) => {
                                const cat = categoriesInvestissement.find(c => c.value === e.target.value)
                                onUpdate(investissement.id, 'categorie', e.target.value)
                                if (cat && cat.dureeDefaut > 0) {
                                    onUpdate(investissement.id, 'dureeAmortissement', cat.dureeDefaut)
                                }
                            }}
                        />
                    </div>

                    {/* Tableau d'amortissement */}
                    {tableauAmortissement.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Tableau d'amortissement</h4>
                            <table className="w-full text-sm border rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Année</th>
                                        <th className="px-3 py-2 text-right">Base amortissable</th>
                                        <th className="px-3 py-2 text-right">Dotation</th>
                                        <th className="px-3 py-2 text-right">Cumul</th>
                                        <th className="px-3 py-2 text-right">VNC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableauAmortissement.map((ligne, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-3 py-2">{ligne.annee}</td>
                                            <td className="px-3 py-2 text-right">{formatCurrency(ligne.baseAmortissable)}</td>
                                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(ligne.dotation)}</td>
                                            <td className="px-3 py-2 text-right">{formatCurrency(ligne.amortissementCumule)}</td>
                                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(ligne.valeurNetteComptable)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function InvestissementsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const previsionnelId = 'demo'
    const annees = [2026, 2027, 2028]

    // État pour les investissements
    const [investissements, setInvestissements] = useState<Investissement[]>([
        {
            id: generateId(),
            libelle: 'Matériel informatique',
            categorie: 'MATERIEL_INFORMATIQUE',
            montantHT: 5000,
            tauxTVA: 20,
            dateAcquisition: '2026-01-01',
            modeAmortissement: 'LINEAIRE',
            dureeAmortissement: 3,
        },
        {
            id: generateId(),
            libelle: 'Véhicule utilitaire',
            categorie: 'MATERIEL_TRANSPORT',
            montantHT: 25000,
            tauxTVA: 20,
            dateAcquisition: '2026-01-01',
            modeAmortissement: 'DEGRESSIF',
            dureeAmortissement: 5,
        },
        {
            id: generateId(),
            libelle: 'Mobilier de bureau',
            categorie: 'MOBILIER',
            montantHT: 8000,
            tauxTVA: 20,
            dateAcquisition: '2026-01-01',
            modeAmortissement: 'LINEAIRE',
            dureeAmortissement: 10,
        },
    ])

    // Ajouter un investissement
    const addInvestissement = (categorie: typeof categoriesInvestissement[0]) => {
        setInvestissements([...investissements, {
            id: generateId(),
            libelle: categorie.label,
            categorie: categorie.value as CategorieInvestissement,
            montantHT: 0,
            tauxTVA: 20,
            dateAcquisition: new Date().toISOString().split('T')[0],
            modeAmortissement: 'LINEAIRE',
            dureeAmortissement: categorie.dureeDefaut,
        }])
    }

    // Mettre à jour un investissement
    const updateInvestissement = (id: string, field: keyof Investissement, value: unknown) => {
        setInvestissements(investissements.map(i =>
            i.id === id ? { ...i, [field]: value } : i
        ))
    }

    // Supprimer un investissement
    const deleteInvestissement = (id: string) => {
        setInvestissements(investissements.filter(i => i.id !== id))
    }

    // Calculs globaux
    const calculs = useMemo(() => {
        const totalInvestissements = investissements.reduce((sum, i) => sum + i.montantHT, 0)
        const totalTVA = investissements.reduce((sum, i) => sum + (i.montantHT * i.tauxTVA / 100), 0)

        // Calcul des dotations par année
        const dotationsParAnnee: Record<number, number> = {}

        investissements.forEach(inv => {
            if (!inv.montantHT || !inv.dureeAmortissement) return

            const invCalc = toInvestissementCalc(inv)
            const tableau = calculerAmortissement(invCalc)

            tableau.forEach(ligne => {
                dotationsParAnnee[ligne.annee] = (dotationsParAnnee[ligne.annee] || 0) + ligne.dotation
            })
        })

        // VNC totale à la fin de la période
        const vncFinPeriode = investissements.reduce((sum, inv) => {
            if (!inv.montantHT || !inv.dureeAmortissement) return sum + inv.montantHT

            const invCalc = toInvestissementCalc(inv)
            const tableau = calculerAmortissement(invCalc)

            // VNC après 3 ans (fin du prévisionnel)
            const ligneAn3 = tableau.find(l => l.annee === 2028)
            return sum + (ligneAn3?.valeurNetteComptable ?? inv.montantHT)
        }, 0)

        return {
            totalInvestissements,
            totalTVA,
            totalTTC: totalInvestissements + totalTVA,
            dotationsParAnnee,
            vncFinPeriode,
        }
    }, [investissements])

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link
                            href={`/previsionnel/${previsionnelId}/compte-resultat`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour au compte de résultat
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Investissements & Amortissements</h1>
                        <p className="text-gray-600">Gérez vos immobilisations et leur amortissement</p>
                    </div>
                    <Button variant="primary">
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                    </Button>
                </div>

                {/* Résumé */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Total investissements HT</div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(calculs.totalInvestissements)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">TVA récupérable</div>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(calculs.totalTVA)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Dotations Année 1</div>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(calculs.dotationsParAnnee[2026] || 0)}
                        </div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">VNC fin période</div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(calculs.vncFinPeriode)}</div>
                    </Card>
                </div>

                {/* Liste des investissements */}
                <Card variant="bordered" className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Immobilisations</CardTitle>
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm cursor-pointer"
                                onChange={(e) => {
                                    const cat = categoriesInvestissement.find(c => c.value === e.target.value)
                                    if (cat) addInvestissement(cat)
                                    e.target.value = ''
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Ajouter une immobilisation...</option>
                                {categoriesInvestissement.map(c => (
                                    <option key={c.value} value={c.value}>{c.label} ({c.dureeDefaut} ans)</option>
                                ))}
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {investissements.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Aucun investissement. Cliquez sur &quot;Ajouter une immobilisation&quot; pour commencer.
                            </div>
                        ) : (
                            investissements.map(inv => (
                                <InvestissementRow
                                    key={inv.id}
                                    investissement={inv}
                                    onUpdate={updateInvestissement}
                                    onDelete={deleteInvestissement}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Tableau récapitulatif des dotations */}
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-lg">Récapitulatif des dotations aux amortissements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="py-3 px-4 text-left font-medium text-gray-600">Immobilisation</th>
                                    <th className="py-3 px-4 text-right font-medium text-gray-600">Valeur brute</th>
                                    {annees.map(annee => (
                                        <th key={annee} className="py-3 px-4 text-right font-medium text-gray-600">
                                            Dotation {annee}
                                        </th>
                                    ))}
                                    <th className="py-3 px-4 text-right font-medium text-gray-600">VNC fin 2028</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investissements.map(inv => {
                                    const invCalc = toInvestissementCalc(inv)
                                    const tableau = calculerAmortissement(invCalc)

                                    const getDotation = (annee: number) => getDotationPourAnnee(tableau, annee)
                                    const vncFin = tableau.find(l => l.annee === 2028)?.valeurNetteComptable ?? inv.montantHT

                                    return (
                                        <tr key={inv.id} className="border-b">
                                            <td className="py-3 px-4">{inv.libelle}</td>
                                            <td className="py-3 px-4 text-right">{formatCurrency(inv.montantHT)}</td>
                                            {annees.map(annee => (
                                                <td key={annee} className="py-3 px-4 text-right">
                                                    {formatCurrency(getDotation(annee))}
                                                </td>
                                            ))}
                                            <td className="py-3 px-4 text-right font-medium">{formatCurrency(vncFin)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-100 font-bold">
                                    <td className="py-3 px-4">TOTAL</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(calculs.totalInvestissements)}</td>
                                    {annees.map(annee => (
                                        <td key={annee} className="py-3 px-4 text-right text-orange-600">
                                            {formatCurrency(calculs.dotationsParAnnee[annee] || 0)}
                                        </td>
                                    ))}
                                    <td className="py-3 px-4 text-right">{formatCurrency(calculs.vncFinPeriode)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                            <strong>Note :</strong> Les dotations aux amortissements sont automatiquement intégrées
                            au compte de résultat (ligne &quot;Dotations aux amortissements&quot;) et impactent le bilan
                            (diminution de la valeur nette comptable des immobilisations).
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
