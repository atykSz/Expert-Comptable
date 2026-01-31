'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    ChevronDown,
    ChevronRight,
    Copy,
    Calendar,
    TrendingUp,
    ArrowDownToLine
} from 'lucide-react'
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { calculerSIG, type DonneesCompteResultat } from '@/lib/calculations/compte-resultat'
import { PrevisionnelSidebar } from '@/components/layout/PrevisionnelSidebar'

interface LigneCA {
    id: string
    libelle: string
    categorie: string
    montantsMensuels: number[] // 36 mois (3 années)
    tauxTVA: number
}

interface LigneCharge {
    id: string
    libelle: string
    categorie: string
    comptePCG: string
    montantsMensuels: number[] // 36 mois (3 années)
    tauxTVA: number
}

// Onglets d'année
function YearTabs({ selectedYear, onYearChange }: { selectedYear: number, onYearChange: (year: number) => void }) {
    return (
        <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(year => (
                <button
                    key={year}
                    onClick={() => onYearChange(year)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${selectedYear === year
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <Calendar className="h-4 w-4" />
                    Année {year}
                </button>
            ))}
        </div>
    )
}

const categoriesCA = [
    { value: 'VENTE_MARCHANDISES', label: 'Ventes de marchandises' },
    { value: 'PRODUCTION_VENDUE_SERVICES', label: 'Prestations de services' },
    { value: 'PRODUCTION_VENDUE_BIENS', label: 'Production de biens' },
]

const categoriesCharges = [
    { value: 'ACHATS_MARCHANDISES', label: 'Achats de marchandises', compte: '607' },
    { value: 'ACHATS_MATIERES', label: 'Achats matières premières', compte: '601' },
    { value: 'LOCATIONS', label: 'Locations', compte: '613' },
    { value: 'ENTRETIEN', label: 'Entretien et réparations', compte: '615' },
    { value: 'ASSURANCES', label: 'Assurances', compte: '616' },
    { value: 'HONORAIRES', label: 'Honoraires', compte: '622' },
    { value: 'PUBLICITE', label: 'Publicité', compte: '623' },
    { value: 'DEPLACEMENTS', label: 'Déplacements', compte: '625' },
    { value: 'TELECOM', label: 'Télécom et internet', compte: '626' },
    { value: 'SERVICES_BANCAIRES', label: 'Services bancaires', compte: '627' },
    { value: 'AUTRES', label: 'Autres charges', compte: '628' },
]

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}


// Local Sidebar removed in favor of shared component

// Composant pour une ligne de CA
function LigneCARow({
    ligne,
    onUpdate,
    onDelete,
    mois,
    yearOffset,
    defaultExpanded
}: {
    ligne: LigneCA
    onUpdate: (id: string, field: keyof LigneCA, value: unknown) => void
    onDelete: (id: string) => void
    mois: string[]
    yearOffset: number // 0, 12, ou 24 selon l'année
    defaultExpanded?: boolean
}) {
    const [expanded, setExpanded] = useState(defaultExpanded || false)
    const yearMontants = ligne.montantsMensuels.slice(yearOffset, yearOffset + 12)
    const totalYear = yearMontants.reduce((a, b) => a + b, 0)
    const totalAnnuel = ligne.montantsMensuels.reduce((a, b) => a + b, 0)

    return (
        <div className="border border-gray-200 rounded-lg mb-2">
            <div className="flex items-center gap-4 p-3 bg-gray-50">
                <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                    <Input
                        value={ligne.libelle}
                        onChange={(e) => onUpdate(ligne.id, 'libelle', e.target.value)}
                        placeholder="Libellé du produit/service"
                        className="bg-white"
                    />
                </div>
                <div className="w-48">
                    <Select
                        options={categoriesCA}
                        value={ligne.categorie}
                        onChange={(e) => onUpdate(ligne.id, 'categorie', e.target.value)}
                    />
                </div>
                <div className="w-32 text-right font-semibold text-gray-900">
                    {formatCurrency(totalYear)}
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
                                    value={ligne.montantsMensuels[index + yearOffset] || 0}
                                    onChange={(e) => {
                                        const newMontants = [...ligne.montantsMensuels]
                                        newMontants[index + yearOffset] = parseFloat(e.target.value) || 0
                                        onUpdate(ligne.id, 'montantsMensuels', newMontants)
                                    }}
                                    className="text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const janValue = ligne.montantsMensuels[yearOffset] || 0
                            const newMontants = [...ligne.montantsMensuels]
                            for (let i = 0; i < 12; i++) {
                                newMontants[yearOffset + i] = janValue
                            }
                            onUpdate(ligne.id, 'montantsMensuels', newMontants)
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        title="Copier le montant de Janvier sur tous les mois de cette année"
                    >
                        <Copy className="h-4 w-4" />
                        Répéter Janvier sur l'année
                    </button>
                </div>
            )}
        </div>
    )
}

// Composant pour une ligne de charge
function LigneChargeRow({
    ligne,
    onUpdate,
    onDelete,
    mois,
    yearOffset
}: {
    ligne: LigneCharge
    onUpdate: (id: string, field: keyof LigneCharge, value: unknown) => void
    onDelete: (id: string) => void
    mois: string[]
    yearOffset: number
}) {
    const [expanded, setExpanded] = useState(false)
    const totalAnnuel = ligne.montantsMensuels.reduce((a, b) => a + b, 0)

    return (
        <div className="border border-gray-200 rounded-lg mb-2">
            <div className="flex items-center gap-4 p-3 bg-gray-50">
                <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="w-16 text-sm text-gray-500 font-mono">{ligne.comptePCG}</div>
                <div className="flex-1">
                    <Input
                        value={ligne.libelle}
                        onChange={(e) => onUpdate(ligne.id, 'libelle', e.target.value)}
                        placeholder="Libellé de la charge"
                        className="bg-white"
                    />
                </div>
                <div className="w-48">
                    <Select
                        options={categoriesCharges}
                        value={ligne.categorie}
                        onChange={(e) => {
                            const cat = categoriesCharges.find(c => c.value === e.target.value)
                            onUpdate(ligne.id, 'categorie', e.target.value)
                            if (cat) onUpdate(ligne.id, 'comptePCG', cat.compte)
                        }}
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
                                    value={ligne.montantsMensuels[index + yearOffset] || 0}
                                    onChange={(e) => {
                                        const newMontants = [...ligne.montantsMensuels]
                                        newMontants[index + yearOffset] = parseFloat(e.target.value) || 0
                                        onUpdate(ligne.id, 'montantsMensuels', newMontants)
                                    }}
                                    className="text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const janValue = ligne.montantsMensuels[yearOffset] || 0
                            const newMontants = [...ligne.montantsMensuels]
                            for (let i = 0; i < 12; i++) {
                                newMontants[yearOffset + i] = janValue
                            }
                            onUpdate(ligne.id, 'montantsMensuels', newMontants)
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        title="Copier le montant de Janvier sur tous les mois de cette année"
                    >
                        <Copy className="h-4 w-4" />
                        Répéter Janvier sur l'année
                    </button>
                </div>
            )}
        </div>
    )
}

export default function CompteResultatPage() {
    const params = useParams()
    const previsionnelId = params.id as string
    const [selectedYear, setSelectedYear] = useState(1)
    const yearOffset = (selectedYear - 1) * 12
    const [isSaving, setIsSaving] = useState(false)
    const { addToast } = useToast()

    // Mois pour la première année
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    // État pour les lignes de CA
    const [lignesCA, setLignesCA] = useState<LigneCA[]>([])

    // État pour les lignes de charges
    const [lignesCharges, setLignesCharges] = useState<LigneCharge[]>([])

    // État pour les salaires (salariés)
    const [salairesBruts, setSalairesBruts] = useState(0)
    const [nombreSalaries, setNombreSalaries] = useState(0)
    const [tauxChargesPatronales, setTauxChargesPatronales] = useState(45)

    // État pour la rémunération des associés/gérants
    const [remunerationAssocies, setRemunerationAssocies] = useState(0)
    const [tauxChargesSocialesAssocies, setTauxChargesSocialesAssocies] = useState(45)

    // Chargement des données
    useEffect(() => {
        // Mode demo uniquement - sinon on charge depuis l'API
        if (previsionnelId === 'demo') {
            setLignesCA([{
                id: generateId(),
                libelle: 'Ventes de produits',
                categorie: 'VENTE_MARCHANDISES',
                montantsMensuels: Array(36).fill(0),
                tauxTVA: 20,
            }])
            setLignesCharges([{
                id: generateId(),
                libelle: 'Loyer',
                categorie: 'LOCATIONS',
                comptePCG: '613',
                montantsMensuels: Array(36).fill(0),
                tauxTVA: 20,
            }])
            return
        }

        if (!previsionnelId) return

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/previsionnels/${previsionnelId}`)
                if (!res.ok) throw new Error('Erreur chargement')
                const data = await res.json()

                if (data.lignesCA) {
                    setLignesCA(data.lignesCA.map((l: any) => ({
                        id: l.id,
                        libelle: l.libelle,
                        categorie: l.categorie,
                        montantsMensuels: l.montantsMensuels || Array(36).fill(0),
                        tauxTVA: l.tauxTVA || 20,
                    })))
                } else {
                    setLignesCA([])
                }

                if (data.lignesCharge) {
                    setLignesCharges(data.lignesCharge.map((l: any) => ({
                        id: l.id,
                        libelle: l.libelle,
                        categorie: l.categorie,
                        comptePCG: l.comptePCG || '',
                        montantsMensuels: l.montantsMensuels || Array(36).fill(0),
                        tauxTVA: l.tauxTVA || 20,
                    })))
                } else {
                    setLignesCharges([])
                }

                // Load salaries/effectifs logic could be added here if API provides it easy summary
            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [previsionnelId])

    // Fonction de sauvegarde
    const handleSave = async () => {
        if (!previsionnelId || previsionnelId === 'demo') {
            addToast('Mode démo - sauvegarde désactivée', 'warning')
            return
        }

        setIsSaving(true)

        try {
            const response = await fetch(`/api/previsionnels/${previsionnelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lignesCA: lignesCA.map(l => ({
                        id: l.id.startsWith('temp-') ? undefined : l.id, // Nouvelles lignes n'ont pas d'ID DB
                        libelle: l.libelle,
                        categorie: l.categorie,
                        montantsMensuels: l.montantsMensuels,
                        tauxTVA: l.tauxTVA,
                    })),
                    lignesCharge: lignesCharges.map(l => ({
                        id: l.id.startsWith('temp-') ? undefined : l.id,
                        libelle: l.libelle,
                        categorie: l.categorie,
                        comptePCG: l.comptePCG,
                        montantsMensuels: l.montantsMensuels,
                        tauxTVA: l.tauxTVA,
                    })),
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
            }

            addToast('Données enregistrées avec succès !', 'success')

            // Recharger les données pour obtenir les IDs des nouvelles lignes
            const res = await fetch(`/api/previsionnels/${previsionnelId}`)
            if (res.ok) {
                const data = await res.json()
                if (data.lignesCA) {
                    setLignesCA(data.lignesCA.map((l: { id: string; libelle: string; categorie: string; montantsMensuels: number[]; tauxTVA: number }) => ({
                        id: l.id,
                        libelle: l.libelle,
                        categorie: l.categorie,
                        montantsMensuels: l.montantsMensuels || Array(36).fill(0),
                        tauxTVA: l.tauxTVA || 20,
                    })))
                }
                if (data.lignesCharge) {
                    setLignesCharges(data.lignesCharge.map((l: { id: string; libelle: string; categorie: string; comptePCG: string; montantsMensuels: number[]; tauxTVA: number }) => ({
                        id: l.id,
                        libelle: l.libelle,
                        categorie: l.categorie,
                        comptePCG: l.comptePCG || '',
                        montantsMensuels: l.montantsMensuels || Array(36).fill(0),
                        tauxTVA: l.tauxTVA || 20,
                    })))
                }
            }
        } catch (error) {
            console.error('Erreur sauvegarde:', error)
            addToast(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    // Ajouter une ligne de CA
    const addLigneCA = () => {
        setLignesCA([...lignesCA, {
            id: generateId(),
            libelle: '',
            categorie: 'PRODUCTION_VENDUE_SERVICES',
            montantsMensuels: Array(12).fill(0),
            tauxTVA: 20,
        }])
    }

    // Ajouter une ligne de charge
    const addLigneCharge = () => {
        setLignesCharges([...lignesCharges, {
            id: generateId(),
            libelle: '',
            categorie: 'AUTRES',
            comptePCG: '628',
            montantsMensuels: Array(12).fill(0),
            tauxTVA: 20,
        }])
    }

    // Mettre à jour une ligne de CA
    const updateLigneCA = (id: string, field: keyof LigneCA, value: unknown) => {
        setLignesCA(lignesCA.map(l => l.id === id ? { ...l, [field]: value } : l))
    }

    // Mettre à jour une ligne de charge
    const updateLigneCharge = (id: string, field: keyof LigneCharge, value: unknown) => {
        setLignesCharges(lignesCharges.map(l => l.id === id ? { ...l, [field]: value } : l))
    }

    // Supprimer une ligne
    const deleteLigneCA = (id: string) => {
        setLignesCA(lignesCA.filter(l => l.id !== id))
    }

    const deleteLigneCharge = (id: string) => {
        setLignesCharges(lignesCharges.filter(l => l.id !== id))
    }

    // Calculs
    const calculs = useMemo(() => {
        // Fonction pour sommer les montants d'une ligne sur l'année sélectionnée seulement
        const sumYear = (montants: number[]) => {
            return montants.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + b, 0)
        }

        const totalCA = lignesCA.reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0)

        const totalCharges = lignesCharges.reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0)

        // Calcul détaillé des charges de personnel (salariés)
        const totalSalairesBruts = salairesBruts * nombreSalaries * 12
        const totalChargesPatronales = totalSalairesBruts * tauxChargesPatronales / 100
        const totalMasseSalariale = totalSalairesBruts + totalChargesPatronales

        // Calcul rémunération associés
        const totalRemunerationAssocies = remunerationAssocies * 12
        const totalChargesSocialesAssocies = totalRemunerationAssocies * tauxChargesSocialesAssocies / 100
        const totalCoutAssocies = totalRemunerationAssocies + totalChargesSocialesAssocies

        // Total charges de personnel (salariés + associés)
        const totalChargesPersonnel = totalMasseSalariale + totalCoutAssocies

        // Séparer les achats des autres charges
        const achats = lignesCharges
            .filter(l => l.categorie.includes('ACHATS'))
            .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0)

        const servicesExterieurs = lignesCharges
            .filter(l => !l.categorie.includes('ACHATS'))
            .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0)

        // Données pour le calcul des SIG
        const donnees: DonneesCompteResultat = {
            venteMarchandises: lignesCA
                .filter(l => l.categorie === 'VENTE_MARCHANDISES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            productionVendueBiens: lignesCA
                .filter(l => l.categorie === 'PRODUCTION_VENDUE_BIENS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            productionVendueServices: lignesCA
                .filter(l => l.categorie === 'PRODUCTION_VENDUE_SERVICES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            subventionsExploitation: 0,
            autresProduits: 0,
            produitsFin: 0,
            produitsExceptionnels: 0,
            achatsMarchandises: achats,
            variationStockMarchandises: 0,
            achatsMatieresPrem: 0,
            variationStockMatieres: 0,
            autresAchats: 0,
            servicesExterieurs: servicesExterieurs * 0.5,
            autresServicesExterieurs: servicesExterieurs * 0.5,
            impotsTaxes: totalCA * 0.01, // Estimation 1% du CA
            chargesPersonnel: totalChargesPersonnel,
            dotationsAmortissements: 0,
            dotationsProvisions: 0,
            chargesFinancieres: 0,
            chargesExceptionnelles: 0,
            participationSalaries: 0,
            impotSurBenefices: 0, // Calculé ensuite
        }

        const sig = calculerSIG(donnees)

        return {
            totalCA,
            totalCharges: totalCharges + totalChargesPersonnel,
            achats,
            servicesExterieurs,
            // Détail salariés
            totalSalairesBruts,
            totalChargesPatronales,
            totalMasseSalariale,
            // Détail associés
            totalRemunerationAssocies,
            totalChargesSocialesAssocies,
            totalCoutAssocies,
            // Total personnel
            totalChargesPersonnel,
            sig,
        }
    }, [lignesCA, lignesCharges, salairesBruts, nombreSalaries, tauxChargesPatronales, remunerationAssocies, tauxChargesSocialesAssocies, yearOffset])

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
                        <h1 className="text-2xl font-bold text-gray-900">Compte de Résultat Prévisionnel</h1>
                        <p className="text-gray-600">Saisissez vos produits et charges pour les 3 années</p>
                    </div>
                    <Button variant="primary" onClick={handleSave} disabled={isSaving} className="btn-press">
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>


                <YearTabs selectedYear={selectedYear} onYearChange={setSelectedYear} />

                {/* Résumé SIG */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Chiffre d'affaires</div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(calculs.totalCA)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Valeur Ajoutée</div>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(calculs.sig.valeurAjoutee)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">EBE</div>
                        <div className={`text-2xl font-bold ${calculs.sig.excedentBrutExploitation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(calculs.sig.excedentBrutExploitation)}
                        </div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Résultat Net</div>
                        <div className={`text-2xl font-bold ${calculs.sig.resultatNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(calculs.sig.resultatNet)}
                        </div>
                    </Card>
                </div>

                {/* Section Chiffre d'affaires */}
                <Card variant="bordered" className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Chiffre d'affaires</CardTitle>
                            {selectedYear > 1 && (
                                <button
                                    onClick={() => {
                                        const prevOffset = (selectedYear - 2) * 12
                                        setLignesCA(lignesCA.map(l => {
                                            const newMontants = [...l.montantsMensuels]
                                            for (let i = 0; i < 12; i++) {
                                                newMontants[yearOffset + i] = l.montantsMensuels[prevOffset + i]
                                            }
                                            return { ...l, montantsMensuels: newMontants }
                                        }))
                                        addToast(`Valeurs de l'année ${selectedYear - 1} copiées`, 'success')
                                    }}
                                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                >
                                    <ArrowDownToLine className="h-3.5 w-3.5" />
                                    Reprendre Année {selectedYear - 1}
                                </button>
                            )}
                        </div>
                        <Button variant="outline" size="sm" onClick={addLigneCA}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une ligne
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {lignesCA.map((ligne, index) => (
                            <LigneCARow
                                key={ligne.id}
                                ligne={ligne}
                                onUpdate={updateLigneCA}
                                onDelete={deleteLigneCA}
                                mois={mois}
                                yearOffset={yearOffset}
                                defaultExpanded={index === 0}
                            />
                        ))}

                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <div className="text-lg font-bold">
                                Total CA : <span className="text-blue-600">{formatCurrency(calculs.totalCA)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Charges */}
                <Card variant="bordered" className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Charges externes</CardTitle>
                            {selectedYear > 1 && (
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => {
                                            const prevOffset = (selectedYear - 2) * 12
                                            setLignesCharges(lignesCharges.map(l => {
                                                const newMontants = [...l.montantsMensuels]
                                                for (let i = 0; i < 12; i++) {
                                                    newMontants[yearOffset + i] = l.montantsMensuels[prevOffset + i]
                                                }
                                                return { ...l, montantsMensuels: newMontants }
                                            }))
                                            addToast(`Valeurs de l'année ${selectedYear - 1} copiées`, 'success')
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                    >
                                        <ArrowDownToLine className="h-3.5 w-3.5" />
                                        Reprendre Année {selectedYear - 1}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const taux = prompt('Taux d\'inflation à appliquer (en %) :', '2')
                                            if (taux === null) return
                                            const tauxNum = parseFloat(taux) / 100
                                            const prevOffset = (selectedYear - 2) * 12
                                            setLignesCharges(lignesCharges.map(l => {
                                                const newMontants = [...l.montantsMensuels]
                                                for (let i = 0; i < 12; i++) {
                                                    newMontants[yearOffset + i] = Math.round(l.montantsMensuels[prevOffset + i] * (1 + tauxNum))
                                                }
                                                return { ...l, montantsMensuels: newMontants }
                                            }))
                                            addToast(`+${taux}% appliqué sur les charges`, 'success')
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                                    >
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        Inflation +%
                                    </button>
                                </div>
                            )}
                        </div>
                        <Button variant="outline" size="sm" onClick={addLigneCharge}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une ligne
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {lignesCharges.map(ligne => (
                            <LigneChargeRow
                                key={ligne.id}
                                ligne={ligne}
                                onUpdate={updateLigneCharge}
                                onDelete={deleteLigneCharge}
                                mois={mois}
                                yearOffset={yearOffset}
                            />
                        ))}

                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <div className="text-lg font-bold">
                                Total charges externes : <span className="text-red-600">{formatCurrency(calculs.achats + calculs.servicesExterieurs)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Charges de personnel - Salariés */}
                <Card variant="bordered" className="mb-6">
                    <CardHeader className="bg-purple-50 border-b border-purple-200">
                        <CardTitle className="text-lg text-purple-800">Salariés</CardTitle>
                        <p className="text-sm text-purple-600">Salaires bruts hors charges patronales</p>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <Input
                                type="number"
                                label="Nombre de salariés"
                                value={nombreSalaries}
                                onChange={(e) => setNombreSalaries(parseInt(e.target.value) || 0)}
                            />
                            <Input
                                type="number"
                                label="Salaire brut mensuel moyen"
                                value={salairesBruts}
                                onChange={(e) => setSalairesBruts(parseFloat(e.target.value) || 0)}
                                hint="Salaire brut hors charges patronales"
                            />
                            <Input
                                type="number"
                                label="Taux charges patronales (%)"
                                value={tauxChargesPatronales}
                                onChange={(e) => setTauxChargesPatronales(parseFloat(e.target.value) || 0)}
                                hint="Entre 40% et 50% en général"
                            />
                            <div className="flex flex-col justify-end">
                                <div className="text-sm text-gray-500">Coût total mensuel</div>
                                <div className="text-lg font-bold text-purple-600">
                                    {formatCurrency((salairesBruts * nombreSalaries * (1 + tauxChargesPatronales / 100)))}
                                </div>
                            </div>
                        </div>

                        {/* Récapitulatif annuel salariés */}
                        <div className="bg-purple-50 rounded-lg p-4 mt-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-600">Salaires bruts annuels</div>
                                    <div className="text-lg font-bold">{formatCurrency(calculs.totalSalairesBruts)}</div>
                                    <div className="text-xs text-gray-400">Compte 641</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Charges patronales annuelles</div>
                                    <div className="text-lg font-bold text-orange-600">{formatCurrency(calculs.totalChargesPatronales)}</div>
                                    <div className="text-xs text-gray-400">Compte 645</div>
                                </div>
                                <div className="bg-white rounded p-2">
                                    <div className="text-gray-600">Total masse salariale</div>
                                    <div className="text-xl font-bold text-purple-700">{formatCurrency(calculs.totalMasseSalariale)}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rémunération des associés/gérants */}
                <Card variant="bordered" className="mb-6">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200">
                        <CardTitle className="text-lg text-indigo-800">Rémunération des Associés / Gérants</CardTitle>
                        <p className="text-sm text-indigo-600">Rémunération brute du dirigeant + charges sociales TNS</p>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <Input
                                type="number"
                                label="Rémunération brute mensuelle"
                                value={remunerationAssocies}
                                onChange={(e) => setRemunerationAssocies(parseFloat(e.target.value) || 0)}
                                hint="Montant versé au dirigeant"
                            />
                            <Input
                                type="number"
                                label="Taux charges sociales TNS (%)"
                                value={tauxChargesSocialesAssocies}
                                onChange={(e) => setTauxChargesSocialesAssocies(parseFloat(e.target.value) || 0)}
                                hint="URSSAF, RSI... (~45% en moyenne)"
                            />
                            <div className="flex flex-col justify-end">
                                <div className="text-sm text-gray-500">Coût total mensuel</div>
                                <div className="text-lg font-bold text-indigo-600">
                                    {formatCurrency(remunerationAssocies * (1 + tauxChargesSocialesAssocies / 100))}
                                </div>
                            </div>
                        </div>

                        {/* Récapitulatif annuel associés */}
                        <div className="bg-indigo-50 rounded-lg p-4 mt-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-600">Rémunération brute annuelle</div>
                                    <div className="text-lg font-bold">{formatCurrency(calculs.totalRemunerationAssocies)}</div>
                                    <div className="text-xs text-gray-400">Compte 644</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Charges sociales TNS annuelles</div>
                                    <div className="text-lg font-bold text-orange-600">{formatCurrency(calculs.totalChargesSocialesAssocies)}</div>
                                    <div className="text-xs text-gray-400">Compte 646</div>
                                </div>
                                <div className="bg-white rounded p-2">
                                    <div className="text-gray-600">Coût total associés</div>
                                    <div className="text-xl font-bold text-indigo-700">{formatCurrency(calculs.totalCoutAssocies)}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total des charges de personnel */}
                <Card variant="bordered" className="mb-6 border-2 border-red-200">
                    <CardContent className="py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-lg font-semibold text-gray-700">Total Charges de Personnel</div>
                                <div className="text-sm text-gray-500">
                                    Masse salariale ({formatCurrency(calculs.totalMasseSalariale)}) +
                                    Rémunération associés ({formatCurrency(calculs.totalCoutAssocies)})
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(calculs.totalChargesPersonnel)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tableau récapitulatif SIG */}
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-lg">Soldes Intermédiaires de Gestion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-3 font-medium">Marge commerciale</td>
                                    <td className="py-3 text-right font-semibold">{formatCurrency(calculs.sig.margeCommerciale)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 font-medium">Production de l'exercice</td>
                                    <td className="py-3 text-right font-semibold">{formatCurrency(calculs.sig.productionExercice)}</td>
                                </tr>
                                <tr className="border-b bg-blue-50">
                                    <td className="py-3 font-medium text-blue-700">Valeur Ajoutée</td>
                                    <td className="py-3 text-right font-bold text-blue-700">{formatCurrency(calculs.sig.valeurAjoutee)}</td>
                                </tr>
                                <tr className="border-b bg-green-50">
                                    <td className="py-3 font-medium text-green-700">Excédent Brut d'Exploitation (EBE)</td>
                                    <td className="py-3 text-right font-bold text-green-700">{formatCurrency(calculs.sig.excedentBrutExploitation)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 font-medium">Résultat d'exploitation</td>
                                    <td className="py-3 text-right font-semibold">{formatCurrency(calculs.sig.resultatExploitation)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 font-medium">Résultat courant avant impôts</td>
                                    <td className="py-3 text-right font-semibold">{formatCurrency(calculs.sig.resultatCourantAvantImpots)}</td>
                                </tr>
                                <tr className="bg-gray-100">
                                    <td className="py-3 font-bold text-lg">Résultat Net</td>
                                    <td className={`py-3 text-right font-bold text-lg ${calculs.sig.resultatNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(calculs.sig.resultatNet)}
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="py-3 font-medium">Capacité d'Autofinancement (CAF)</td>
                                    <td className="py-3 text-right font-semibold">{formatCurrency(calculs.sig.capaciteAutofinancement)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
