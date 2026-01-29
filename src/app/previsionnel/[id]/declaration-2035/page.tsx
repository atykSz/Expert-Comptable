'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    FileSpreadsheet,
    TrendingUp,
    PiggyBank,
    Calculator,
    ChevronDown,
    ChevronRight,
    Receipt,
    Wallet,
    Copy
} from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

interface LigneRecette {
    id: string
    rubrique: string
    libelle: string
    montantsMensuels: number[]
}

interface LigneDepense {
    id: string
    rubrique: string
    numeroLigne: number
    libelle: string
    montantsMensuels: number[]
}

// Rubriques de recettes 2035
const rubriquesRecettes = [
    { value: 'HONORAIRES', label: 'Honoraires encaissés', ligne: 1 },
    { value: 'DEBOURS', label: 'Débours payés pour le compte des clients', ligne: 2 },
    { value: 'GAINS_DIVERS', label: 'Gains divers', ligne: 6 },
]

// Rubriques de dépenses 2035
const rubriquesDepenses = [
    { value: 'ACHATS', label: 'Achats', ligne: 8 },
    { value: 'FRAIS_PERSONNEL', label: 'Frais de personnel (salaires)', ligne: 9 },
    { value: 'IMPOTS_TAXES', label: 'Impôts et taxes', ligne: 10 },
    { value: 'CSG_DEDUCTIBLE', label: 'CSG déductible', ligne: 14 },
    { value: 'LOYERS', label: 'Loyers et charges locatives', ligne: 20 },
    { value: 'LOCATION_MATERIEL', label: 'Location de matériel et mobilier', ligne: 21 },
    { value: 'ENTRETIEN', label: 'Entretien et réparations', ligne: 22 },
    { value: 'PERSONNEL_EXTERIEUR', label: 'Personnel intérimaire', ligne: 23 },
    { value: 'PETIT_OUTILLAGE', label: 'Petit outillage', ligne: 24 },
    { value: 'CHAUFFAGE_EAU', label: 'Chauffage, eau, gaz, électricité', ligne: 25 },
    { value: 'HONORAIRES_RETROCEDES', label: 'Honoraires rétrocédés', ligne: 26 },
    { value: 'FOURNITURES_BUREAU', label: 'Fournitures de bureau', ligne: 27 },
    { value: 'FRAIS_ACTES', label: 'Frais d\'actes et de contentieux', ligne: 28 },
    { value: 'COTISATIONS', label: 'Cotisations syndicales et professionnelles', ligne: 29 },
    { value: 'AUTRES_FRAIS', label: 'Autres frais divers de gestion', ligne: 30 },
    { value: 'FRAIS_FINANCIERS', label: 'Frais financiers', ligne: 31 },
    { value: 'PERTES_DIVERSES', label: 'Pertes diverses', ligne: 32 },
]

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

// Navigation latérale
function Sidebar({ previsionnelId }: { previsionnelId: string }) {
    const navItems = [
        { href: `/previsionnel/${previsionnelId}/declaration-2035`, label: 'Déclaration 2035', icon: FileSpreadsheet, active: true },
        { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan Simplifié', icon: Calculator },
        { href: `/previsionnel/${previsionnelId}/financement`, label: 'Plan de Financement', icon: TrendingUp },
        { href: `/previsionnel/${previsionnelId}/tresorerie`, label: 'Plan de Trésorerie', icon: PiggyBank },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                <span className="font-bold text-gray-900">Expert-Comptable</span>
            </Link>

            <div className="mb-4 px-3 py-2 bg-purple-50 rounded-lg">
                <span className="text-xs font-medium text-purple-700">Format 2035 - BNC</span>
            </div>

            <nav className="space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.active
                            ? 'bg-purple-50 text-purple-700'
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

// Ligne de recette
function LigneRecetteRow({
    ligne,
    onUpdate,
    onDelete,
    mois
}: {
    ligne: LigneRecette
    onUpdate: (id: string, field: keyof LigneRecette, value: unknown) => void
    onDelete: (id: string) => void
    mois: string[]
}) {
    const [expanded, setExpanded] = useState(false)
    const totalAnnuel = ligne.montantsMensuels.reduce((a, b) => a + b, 0)

    return (
        <div className="border border-gray-200 rounded-lg mb-2">
            <div className="flex items-center gap-4 p-3 bg-green-50">
                <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <Receipt className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                    <Input
                        value={ligne.libelle}
                        onChange={(e) => onUpdate(ligne.id, 'libelle', e.target.value)}
                        placeholder="Libellé de la recette"
                        className="bg-white"
                    />
                </div>
                <div className="w-32 text-right font-semibold text-green-700">
                    {formatCurrency(totalAnnuel)}
                </div>
                <button
                    onClick={() => onDelete(ligne.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {expanded && (
                <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                        {mois.map((m, index) => (
                            <div key={m}>
                                <label className="text-xs text-gray-500 block mb-1">{m}</label>
                                <Input
                                    type="number"
                                    value={ligne.montantsMensuels[index] || 0}
                                    onChange={(e) => {
                                        const newMontants = [...ligne.montantsMensuels]
                                        newMontants[index] = parseFloat(e.target.value) || 0
                                        onUpdate(ligne.id, 'montantsMensuels', newMontants)
                                    }}
                                    className="text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const janValue = ligne.montantsMensuels[0] || 0
                            const newMontants = Array(12).fill(janValue)
                            onUpdate(ligne.id, 'montantsMensuels', newMontants)
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        title="Copier le montant de Janvier sur tous les mois"
                    >
                        <Copy className="h-4 w-4" />
                        Répéter Janvier sur l'année
                    </button>
                </div>
            )}
        </div>
    )
}

// Ligne de dépense
function LigneDepenseRow({
    ligne,
    onUpdate,
    onDelete,
    mois
}: {
    ligne: LigneDepense
    onUpdate: (id: string, field: keyof LigneDepense, value: unknown) => void
    onDelete: (id: string) => void
    mois: string[]
}) {
    const [expanded, setExpanded] = useState(false)
    const totalAnnuel = ligne.montantsMensuels.reduce((a, b) => a + b, 0)

    return (
        <div className="border border-gray-200 rounded-lg mb-2">
            <div className="flex items-center gap-4 p-3 bg-red-50">
                <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <Wallet className="h-4 w-4 text-red-600" />
                <div className="w-12 text-sm text-gray-500 font-mono">L.{ligne.numeroLigne}</div>
                <div className="flex-1">
                    <Input
                        value={ligne.libelle}
                        onChange={(e) => onUpdate(ligne.id, 'libelle', e.target.value)}
                        placeholder="Libellé de la dépense"
                        className="bg-white"
                    />
                </div>
                <div className="w-32 text-right font-semibold text-red-600">
                    {formatCurrency(totalAnnuel)}
                </div>
                <button
                    onClick={() => onDelete(ligne.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {expanded && (
                <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                        {mois.map((m, index) => (
                            <div key={m}>
                                <label className="text-xs text-gray-500 block mb-1">{m}</label>
                                <Input
                                    type="number"
                                    value={ligne.montantsMensuels[index] || 0}
                                    onChange={(e) => {
                                        const newMontants = [...ligne.montantsMensuels]
                                        newMontants[index] = parseFloat(e.target.value) || 0
                                        onUpdate(ligne.id, 'montantsMensuels', newMontants)
                                    }}
                                    className="text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const janValue = ligne.montantsMensuels[0] || 0
                            const newMontants = Array(12).fill(janValue)
                            onUpdate(ligne.id, 'montantsMensuels', newMontants)
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Copier le montant de Janvier sur tous les mois"
                    >
                        <Copy className="h-4 w-4" />
                        Répéter Janvier sur l'année
                    </button>
                </div>
            )}
        </div>
    )
}

export default function Declaration2035Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const previsionnelId = 'demo'

    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    // État pour les lignes de recettes
    const [lignesRecettes, setLignesRecettes] = useState<LigneRecette[]>([
        {
            id: generateId(),
            rubrique: 'HONORAIRES',
            libelle: 'Honoraires consultations',
            montantsMensuels: Array(12).fill(8000),
        }
    ])

    // État pour les lignes de dépenses
    const [lignesDepenses, setLignesDepenses] = useState<LigneDepense[]>([
        {
            id: generateId(),
            rubrique: 'LOYERS',
            numeroLigne: 20,
            libelle: 'Loyer cabinet',
            montantsMensuels: Array(12).fill(1200),
        },
        {
            id: generateId(),
            rubrique: 'COTISATIONS',
            numeroLigne: 29,
            libelle: 'Cotisations ordre et syndicat',
            montantsMensuels: [500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
            id: generateId(),
            rubrique: 'FOURNITURES_BUREAU',
            numeroLigne: 27,
            libelle: 'Fournitures et consommables',
            montantsMensuels: Array(12).fill(100),
        },
    ])

    // Cotisations sociales
    const [cotisationsSociales, setCotisationsSociales] = useState(1800)
    const [csgDeductible, setCsgDeductible] = useState(500)

    // Ajouter une ligne de recette
    const addLigneRecette = () => {
        setLignesRecettes([...lignesRecettes, {
            id: generateId(),
            rubrique: 'HONORAIRES',
            libelle: '',
            montantsMensuels: Array(12).fill(0),
        }])
    }

    // Ajouter une ligne de dépense
    const addLigneDepense = (rubrique: typeof rubriquesDepenses[0]) => {
        setLignesDepenses([...lignesDepenses, {
            id: generateId(),
            rubrique: rubrique.value,
            numeroLigne: rubrique.ligne,
            libelle: rubrique.label,
            montantsMensuels: Array(12).fill(0),
        }])
    }

    // Mettre à jour une ligne
    const updateLigneRecette = (id: string, field: keyof LigneRecette, value: unknown) => {
        setLignesRecettes(lignesRecettes.map(l => l.id === id ? { ...l, [field]: value } : l))
    }

    const updateLigneDepense = (id: string, field: keyof LigneDepense, value: unknown) => {
        setLignesDepenses(lignesDepenses.map(l => l.id === id ? { ...l, [field]: value } : l))
    }

    // Supprimer une ligne
    const deleteLigneRecette = (id: string) => {
        setLignesRecettes(lignesRecettes.filter(l => l.id !== id))
    }

    const deleteLigneDepense = (id: string) => {
        setLignesDepenses(lignesDepenses.filter(l => l.id !== id))
    }

    // Calculs 2035
    const calculs = useMemo(() => {
        // Total des recettes (Ligne 7)
        const totalRecettes = lignesRecettes.reduce((sum, l) =>
            sum + l.montantsMensuels.reduce((a, b) => a + b, 0), 0
        )

        // Total des dépenses (Ligne 33)
        const totalDepenses = lignesDepenses.reduce((sum, l) =>
            sum + l.montantsMensuels.reduce((a, b) => a + b, 0), 0
        )

        // Cotisations sociales annuelles
        const cotisationsAnnuelles = cotisationsSociales * 12

        // CSG déductible annuelle
        const csgDeductibleAnnuelle = csgDeductible * 12

        // Total dépenses avec cotisations
        const totalDepensesGlobal = totalDepenses + cotisationsAnnuelles + csgDeductibleAnnuelle

        // Excédent ou insuffisance (Ligne 34)
        const excedent = totalRecettes - totalDepensesGlobal

        // Résultat fiscal (simplifié pour le prévisionnel)
        const resultatFiscal = excedent // Avant réintégrations/déductions

        // Estimation IR (barème simplifié)
        const estimationIR = resultatFiscal > 0 ? resultatFiscal * 0.30 : 0 // Estimation 30% moyen

        // Revenu net après IR
        const revenuNet = resultatFiscal - estimationIR

        return {
            totalRecettes,
            totalDepenses: totalDepensesGlobal,
            cotisationsAnnuelles,
            csgDeductibleAnnuelle,
            excedent,
            resultatFiscal,
            estimationIR,
            revenuNet,
        }
    }, [lignesRecettes, lignesDepenses, cotisationsSociales, csgDeductible])

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link
                            href="/previsionnel/nouveau"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Modifier les paramètres
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Prévisionnel 2035 - BNC</h1>
                        <p className="text-gray-600">Année 1 - Saisissez vos recettes et dépenses professionnelles</p>
                    </div>
                    <Button variant="primary" className="bg-purple-600 hover:bg-purple-700">
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                    </Button>
                </div>

                {/* Résumé 2035 */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card variant="bordered" className="p-4 border-green-200 bg-green-50">
                        <div className="text-sm text-green-600">Recettes (L.7)</div>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(calculs.totalRecettes)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4 border-red-200 bg-red-50">
                        <div className="text-sm text-red-600">Dépenses (L.33)</div>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(calculs.totalDepenses)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4 border-purple-200 bg-purple-50">
                        <div className="text-sm text-purple-600">Résultat fiscal</div>
                        <div className={`text-2xl font-bold ${calculs.resultatFiscal >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                            {formatCurrency(calculs.resultatFiscal)}
                        </div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Revenu net estimé</div>
                        <div className={`text-2xl font-bold ${calculs.revenuNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(calculs.revenuNet)}
                        </div>
                    </Card>
                </div>

                {/* Section Recettes */}
                <Card variant="bordered" className="mb-6 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between bg-green-50 border-b border-green-200">
                        <div>
                            <CardTitle className="text-lg text-green-800">Recettes (2035-A)</CardTitle>
                            <p className="text-sm text-green-600">Honoraires et autres recettes encaissées</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={addLigneRecette} className="border-green-300 text-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une recette
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {lignesRecettes.map(ligne => (
                            <LigneRecetteRow
                                key={ligne.id}
                                ligne={ligne}
                                onUpdate={updateLigneRecette}
                                onDelete={deleteLigneRecette}
                                mois={mois}
                            />
                        ))}

                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <div className="text-lg font-bold">
                                Total Recettes (L.7) : <span className="text-green-700">{formatCurrency(calculs.totalRecettes)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Dépenses */}
                <Card variant="bordered" className="mb-6 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between bg-red-50 border-b border-red-200">
                        <div>
                            <CardTitle className="text-lg text-red-800">Dépenses professionnelles (2035-A)</CardTitle>
                            <p className="text-sm text-red-600">Charges déductibles du résultat</p>
                        </div>
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-red-300 rounded-lg px-3 py-2 pr-8 text-sm text-red-700 cursor-pointer"
                                onChange={(e) => {
                                    const rubrique = rubriquesDepenses.find(r => r.value === e.target.value)
                                    if (rubrique) addLigneDepense(rubrique)
                                    e.target.value = ''
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Ajouter une dépense...</option>
                                {rubriquesDepenses.map(r => (
                                    <option key={r.value} value={r.value}>L.{r.ligne} - {r.label}</option>
                                ))}
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {lignesDepenses.map(ligne => (
                            <LigneDepenseRow
                                key={ligne.id}
                                ligne={ligne}
                                onUpdate={updateLigneDepense}
                                onDelete={deleteLigneDepense}
                                mois={mois}
                            />
                        ))}

                        {/* Cotisations sociales */}
                        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <h4 className="font-medium text-orange-800 mb-3">Cotisations sociales obligatoires</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    label="Cotisations URSSAF/CIPAV mensuelles"
                                    value={cotisationsSociales}
                                    onChange={(e) => setCotisationsSociales(parseFloat(e.target.value) || 0)}
                                    hint={`Annuel : ${formatCurrency(cotisationsSociales * 12)}`}
                                />
                                <Input
                                    type="number"
                                    label="CSG déductible mensuelle (L.14)"
                                    value={csgDeductible}
                                    onChange={(e) => setCsgDeductible(parseFloat(e.target.value) || 0)}
                                    hint={`Annuel : ${formatCurrency(csgDeductible * 12)}`}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <div className="text-lg font-bold">
                                Total Dépenses (L.33) : <span className="text-red-600">{formatCurrency(calculs.totalDepenses)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tableau récapitulatif 2035 */}
                <Card variant="bordered" className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200">
                        <CardTitle className="text-lg text-purple-800">Détermination du résultat fiscal (2035-B)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b bg-green-50">
                                    <td className="py-3 font-medium text-green-700">Ligne 7 - Total des recettes</td>
                                    <td className="py-3 text-right font-bold text-green-700">{formatCurrency(calculs.totalRecettes)}</td>
                                </tr>
                                <tr className="border-b bg-red-50">
                                    <td className="py-3 font-medium text-red-600">Ligne 33 - Total des dépenses</td>
                                    <td className="py-3 text-right font-bold text-red-600">- {formatCurrency(calculs.totalDepenses)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 pl-4 text-gray-600">↳ dont cotisations sociales</td>
                                    <td className="py-3 text-right text-gray-600">{formatCurrency(calculs.cotisationsAnnuelles)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 pl-4 text-gray-600">↳ dont CSG déductible (L.14)</td>
                                    <td className="py-3 text-right text-gray-600">{formatCurrency(calculs.csgDeductibleAnnuelle)}</td>
                                </tr>
                                <tr className="border-b bg-purple-100">
                                    <td className="py-3 font-bold text-lg text-purple-800">Ligne 34 - Excédent</td>
                                    <td className={`py-3 text-right font-bold text-lg ${calculs.excedent >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                                        {formatCurrency(calculs.excedent)}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 font-medium">Résultat fiscal (avant réintégrations)</td>
                                    <td className="py-3 text-right font-semibold">{formatCurrency(calculs.resultatFiscal)}</td>
                                </tr>
                                <tr className="border-b bg-gray-50">
                                    <td className="py-3 text-gray-600">IR estimé (≈ 30% moyen)</td>
                                    <td className="py-3 text-right text-gray-600">- {formatCurrency(calculs.estimationIR)}</td>
                                </tr>
                                <tr className="bg-gray-100">
                                    <td className="py-4 font-bold text-lg">💰 Revenu net disponible estimé</td>
                                    <td className={`py-4 text-right font-bold text-xl ${calculs.revenuNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(calculs.revenuNet)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                            <strong>Note :</strong> Ce prévisionnel est une estimation. Le résultat fiscal définitif
                            dépendra des réintégrations (amortissements excédentaires, frais non déductibles) et
                            déductions (plus-values étalées) à préciser avec votre expert-comptable.
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
