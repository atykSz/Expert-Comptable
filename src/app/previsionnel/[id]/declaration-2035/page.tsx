'use client'

import { useState, useMemo, useEffect, use } from 'react'
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
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'

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

// Ligne de recette
function LigneRecetteRow({
    ligne,
    onUpdate,
    onDelete,
    mois,
    yearOffset
}: {
    ligne: LigneRecette
    onUpdate: (id: string, field: keyof LigneRecette, value: unknown) => void
    onDelete: (id: string) => void
    mois: string[]
    yearOffset: number
}) {
    const [expanded, setExpanded] = useState(false)
    // Total pour l'année sélectionnée
    const totalAnnuel = ligne.montantsMensuels.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + b, 0)

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
                        {mois.map((m, index) => {
                            const actualIndex = yearOffset + index
                            return (
                                <div key={m}>
                                    <label className="text-xs text-gray-500 block mb-1">{m}</label>
                                    <Input
                                        type="number"
                                        value={ligne.montantsMensuels[actualIndex] || 0}
                                        onChange={(e) => {
                                            const newMontants = [...ligne.montantsMensuels]
                                            newMontants[actualIndex] = parseFloat(e.target.value) || 0
                                            onUpdate(ligne.id, 'montantsMensuels', newMontants)
                                        }}
                                        className="text-sm"
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <button
                        onClick={() => {
                            const janValue = ligne.montantsMensuels[yearOffset] || 0
                            const newMontants = [...ligne.montantsMensuels]
                            // Copier sur les 12 mois de l'année sélectionnée
                            for (let i = 0; i < 12; i++) {
                                newMontants[yearOffset + i] = janValue
                            }
                            onUpdate(ligne.id, 'montantsMensuels', newMontants)
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        title="Copier le montant de Janvier sur tous les mois de l'année"
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
    mois,
    yearOffset
}: {
    ligne: LigneDepense
    onUpdate: (id: string, field: keyof LigneDepense, value: unknown) => void
    onDelete: (id: string) => void
    mois: string[]
    yearOffset: number
}) {
    const [expanded, setExpanded] = useState(false)
    // Total pour l'année sélectionnée
    const totalAnnuel = ligne.montantsMensuels.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + b, 0)

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
                        {mois.map((m, index) => {
                            const actualIndex = yearOffset + index
                            return (
                                <div key={m}>
                                    <label className="text-xs text-gray-500 block mb-1">{m}</label>
                                    <Input
                                        type="number"
                                        value={ligne.montantsMensuels[actualIndex] || 0}
                                        onChange={(e) => {
                                            const newMontants = [...ligne.montantsMensuels]
                                            newMontants[actualIndex] = parseFloat(e.target.value) || 0
                                            onUpdate(ligne.id, 'montantsMensuels', newMontants)
                                        }}
                                        className="text-sm"
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <button
                        onClick={() => {
                            const janValue = ligne.montantsMensuels[yearOffset] || 0
                            const newMontants = [...ligne.montantsMensuels]
                            // Copier sur les 12 mois de l'année sélectionnée
                            for (let i = 0; i < 12; i++) {
                                newMontants[yearOffset + i] = janValue
                            }
                            onUpdate(ligne.id, 'montantsMensuels', newMontants)
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Copier le montant de Janvier sur tous les mois de l'année"
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
    const { id: previsionnelId } = use(params)

    // Année sélectionnée (1, 2 ou 3)
    const [selectedYear, setSelectedYear] = useState(1)

    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    // Calcule l'offset pour les montants mensuels selon l'année
    const yearOffset = (selectedYear - 1) * 12

    // État pour les lignes de recettes (36 mois pour 3 ans)
    const [lignesRecettes, setLignesRecettes] = useState<LigneRecette[]>([])

    // État pour les lignes de dépenses (36 mois pour 3 ans)
    const [lignesDepenses, setLignesDepenses] = useState<LigneDepense[]>([])

    // État de sauvegarde
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Chargement des données
    useEffect(() => {
        if (!previsionnelId || previsionnelId === 'demo') {
            // Mock data fallback - 36 mois pour 3 ans
            setLignesRecettes([{
                id: generateId(),
                rubrique: 'HONORAIRES',
                libelle: 'Honoraires consultations',
                montantsMensuels: Array(36).fill(8000),
            }])
            setLignesDepenses([{
                id: generateId(),
                rubrique: 'LOYERS',
                numeroLigne: 20,
                libelle: 'Loyer cabinet',
                montantsMensuels: Array(36).fill(1200),
            }])
            return
        }

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/previsionnels/${previsionnelId}`)
                if (!res.ok) throw new Error('Erreur chargement')
                const data = await res.json()

                // Mapper les données API vers le format local
                if (data.lignesCA?.length) {
                    setLignesRecettes(data.lignesCA.map((l: any) => {
                        // S'assurer qu'on a 36 mois
                        const montants = l.montantsMensuels || []
                        const normalizedMontants = [...montants, ...Array(36 - montants.length).fill(0)].slice(0, 36)
                        return {
                            id: l.id || generateId(),
                            rubrique: l.categorie || 'HONORAIRES',
                            libelle: l.libelle,
                            montantsMensuels: normalizedMontants
                        }
                    }))
                } else {
                    setLignesRecettes([{
                        id: generateId(),
                        rubrique: 'HONORAIRES',
                        libelle: 'Honoraires consultations',
                        montantsMensuels: Array(36).fill(8000),
                    }])
                }

                if (data.lignesCharge?.length) {
                    setLignesDepenses(data.lignesCharge.map((l: any) => {
                        // S'assurer qu'on a 36 mois
                        const montants = l.montantsMensuels || []
                        const normalizedMontants = [...montants, ...Array(36 - montants.length).fill(0)].slice(0, 36)
                        return {
                            id: l.id || generateId(),
                            rubrique: l.categorie || 'AUTRES_FRAIS',
                            numeroLigne: rubriquesDepenses.find(r => r.value === l.categorie)?.ligne || 0,
                            libelle: l.libelle,
                            montantsMensuels: normalizedMontants
                        }
                    }))
                } else {
                    setLignesDepenses([{
                        id: generateId(),
                        rubrique: 'LOYERS',
                        numeroLigne: 20,
                        libelle: 'Loyer cabinet',
                        montantsMensuels: Array(36).fill(1200),
                    }])
                }

            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [previsionnelId])


    // Cotisations sociales
    const [cotisationsSociales, setCotisationsSociales] = useState(1800)
    const [csgDeductible, setCsgDeductible] = useState(500)

    // Ajouter une ligne de recette (36 mois)
    const addLigneRecette = () => {
        setLignesRecettes([...lignesRecettes, {
            id: generateId(),
            rubrique: 'HONORAIRES',
            libelle: '',
            montantsMensuels: Array(36).fill(0),
        }])
    }

    // Ajouter une ligne de dépense (36 mois)
    const addLigneDepense = (rubrique: typeof rubriquesDepenses[0]) => {
        setLignesDepenses([...lignesDepenses, {
            id: generateId(),
            rubrique: rubrique.value,
            numeroLigne: rubrique.ligne,
            libelle: rubrique.label,
            montantsMensuels: Array(36).fill(0),
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

    // Calculs 2035 pour l'année sélectionnée
    const calculs = useMemo(() => {
        // Total des recettes pour l'année sélectionnée (Ligne 7)
        const totalRecettes = lignesRecettes.reduce((sum, l) => {
            const yearMontants = l.montantsMensuels.slice(yearOffset, yearOffset + 12)
            return sum + yearMontants.reduce((a, b) => a + b, 0)
        }, 0)

        // Total des dépenses pour l'année sélectionnée (Ligne 33)
        const totalDepenses = lignesDepenses.reduce((sum, l) => {
            const yearMontants = l.montantsMensuels.slice(yearOffset, yearOffset + 12)
            return sum + yearMontants.reduce((a, b) => a + b, 0)
        }, 0)

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
    }, [lignesRecettes, lignesDepenses, cotisationsSociales, csgDeductible, yearOffset])

    // Mapping des rubriques 2035 vers les catégories Prisma
    const mapRubriqueToCategorieCA = (rubrique: string): string => {
        // Pour BNC, on utilise principalement PRESTATIONS_SERVICES
        return 'PRESTATIONS_SERVICES'
    }

    const mapRubriqueToCategorieCharge = (rubrique: string): string => {
        const mapping: Record<string, string> = {
            'ACHATS': 'ACHATS_FOURNITURES',
            'FRAIS_PERSONNEL': 'ACHATS_FOURNITURES', // Simplifié, devrait être dans effectifs
            'IMPOTS_TAXES': 'IMPOTS_TAXES',
            'CSG_DEDUCTIBLE': 'IMPOTS_TAXES',
            'LOYERS': 'LOCATIONS',
            'LOCATION_MATERIEL': 'LOCATIONS',
            'ENTRETIEN': 'ENTRETIEN_REPARATIONS',
            'PERSONNEL_EXTERIEUR': 'AUTRES_SERVICES',
            'PETIT_OUTILLAGE': 'ACHATS_FOURNITURES',
            'CHAUFFAGE_EAU': 'AUTRES_SERVICES',
            'HONORAIRES_RETROCEDES': 'HONORAIRES',
            'FOURNITURES_BUREAU': 'ACHATS_FOURNITURES',
            'FRAIS_ACTES': 'AUTRES_SERVICES',
            'COTISATIONS': 'AUTRES_SERVICES',
            'AUTRES_FRAIS': 'AUTRES_SERVICES',
            'FRAIS_FINANCIERS': 'INTERETS_EMPRUNTS',
            'PERTES_DIVERSES': 'CHARGES_EXCEPTIONNELLES',
        }
        return mapping[rubrique] || 'AUTRES_SERVICES'
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveMessage(null)

        try {
            const response = await fetch(`/api/previsionnels/${previsionnelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lignesCA: lignesRecettes.map(l => ({
                        libelle: l.libelle,
                        categorie: mapRubriqueToCategorieCA(l.rubrique),
                        comptePCG: '706000',
                        montantsMensuels: l.montantsMensuels,
                        evolutionAn2: 0,
                        evolutionAn3: 0,
                        tauxTVA: 0 // BNC souvent exonéré ou franchise
                    })),
                    lignesCharge: lignesDepenses.map(l => ({
                        libelle: l.libelle,
                        categorie: mapRubriqueToCategorieCharge(l.rubrique),
                        comptePCG: '6' + l.numeroLigne.toString().padStart(5, '0'),
                        typeCharge: 'FIXE',
                        montantsMensuels: l.montantsMensuels,
                        evolutionAn2: 0,
                        evolutionAn3: 0,
                        tauxTVA: 20,
                        deductibleTVA: true,
                        recurrence: 'MENSUEL'
                    }))
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
            }

            setSaveMessage({ type: 'success', text: 'Données enregistrées avec succès !' })
            setTimeout(() => setSaveMessage(null), 3000)
        } catch (error) {
            console.error(error)
            setSaveMessage({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <PrevisionnelSidebar previsionnelId={previsionnelId} />

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
                        <p className="text-gray-600">Saisissez vos recettes et dépenses professionnelles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveMessage && (
                            <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {saveMessage.text}
                            </div>
                        )}
                        <Button
                            variant="primary"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </div>

                {/* Sélecteur d'année */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border ${selectedYear === year
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Année {year}
                        </button>
                    ))}
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
                                yearOffset={yearOffset}
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
                                yearOffset={yearOffset}
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
