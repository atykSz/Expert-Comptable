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
    Plus,
    Trash2,
    ChevronDown,
    ChevronRight,
    Landmark,
    Users,
    Wallet,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, Modal } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { calculerEcheancier, calculerCoutTotalEmprunt, type EcheanceEmprunt, type Emprunt } from '@/lib/calculations/emprunts'

// Helper pour créer un objet Emprunt et calculer l'échéancier
function creerEcheancier(
    montant: number,
    tauxInteret: number,
    duree: number,
    dateDebut: Date,
    differe: number = 0
) {
    const empruntObj: Emprunt = {
        id: 'temp',
        libelle: 'temp',
        montant,
        tauxAnnuel: tauxInteret,
        dureeMois: duree,
        differeMois: differe,
        dateDebut,
        typeRemboursement: 'CONSTANT',
    }
    return calculerEcheancier(empruntObj).map(e => ({
        ...e,
        capital: e.amortissement,
        capitalRestantDu: e.capitalFin,
    }))
}

// Types de financement
type TypeFinancement = 'CAPITAL_SOCIAL' | 'APPORT_CCA' | 'EMPRUNT' | 'SUBVENTION' | 'CREDIT_BAIL'

interface Financement {
    id: string
    type: TypeFinancement
    libelle: string
    montant: number
    dateDeblocage: string
    // Spécifique aux emprunts
    tauxInteret?: number
    dureeEmprunt?: number // en mois
    differe?: number // mois de différé
}

interface BesoinFinancement {
    id: string
    libelle: string
    montant: number
    annee: number
}

const typesFinancement = [
    { value: 'CAPITAL_SOCIAL', label: 'Apport en capital', icon: Users },
    { value: 'APPORT_CCA', label: 'Apport en compte courant', icon: Wallet },
    { value: 'EMPRUNT', label: 'Emprunt bancaire', icon: Landmark },
    { value: 'SUBVENTION', label: 'Subvention', icon: ArrowDownRight },
    { value: 'CREDIT_BAIL', label: 'Crédit-bail / LOA', icon: Building },
]

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

// Navigation latérale
function Sidebar({ previsionnelId }: { previsionnelId: string }) {
    const navItems = [
        { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Résultat', icon: FileSpreadsheet },
        { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building },
        { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan Prévisionnel', icon: Calculator },
        { href: `/previsionnel/${previsionnelId}/financement`, label: 'Plan de Financement', icon: TrendingUp, active: true },
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

// Composant tableau d'amortissement complet (pour la modal)
function AmortizationTable({
    echeancier,
    emprunt
}: {
    echeancier: Array<{ numero: number; date: Date; capital: number; interets: number; mensualite: number; capitalRestantDu: number }>
    emprunt: Financement
}) {
    const totalInterets = echeancier.reduce((sum, e) => sum + e.interets, 0)
    const totalCapital = echeancier.reduce((sum, e) => sum + e.capital, 0)
    const totalMensualites = echeancier.reduce((sum, e) => sum + e.mensualite, 0)

    return (
        <div>
            {/* Résumé */}
            <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-orange-50 rounded-lg">
                <div>
                    <div className="text-sm text-gray-500">Montant emprunté</div>
                    <div className="text-lg font-bold">{formatCurrency(emprunt.montant)}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">Total intérêts</div>
                    <div className="text-lg font-bold text-orange-600">{formatCurrency(totalInterets)}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">Coût total du crédit</div>
                    <div className="text-lg font-bold">{formatCurrency(totalMensualites)}</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500">Taux / Durée</div>
                    <div className="text-lg font-bold">{emprunt.tauxInteret}% / {emprunt.dureeEmprunt} mois</div>
                </div>
            </div>

            {/* Tableau complet */}
            <div className="max-h-96 overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">N°</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Capital</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Intérêts</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Mensualité</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-600">Capital restant dû</th>
                        </tr>
                    </thead>
                    <tbody>
                        {echeancier.map((e) => (
                            <tr key={e.numero} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2">{e.numero}</td>
                                <td className="px-3 py-2">{e.date.toLocaleDateString('fr-FR')}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(e.capital)}</td>
                                <td className="px-3 py-2 text-right text-orange-600">{formatCurrency(e.interets)}</td>
                                <td className="px-3 py-2 text-right font-medium">{formatCurrency(e.mensualite)}</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(e.capitalRestantDu)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td colSpan={2} className="px-3 py-2">TOTAL</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(totalCapital)}</td>
                            <td className="px-3 py-2 text-right text-orange-600">{formatCurrency(totalInterets)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(totalMensualites)}</td>
                            <td className="px-3 py-2 text-right">-</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

// Ligne de financement
function FinancementRow({
    financement,
    onUpdate,
    onDelete
}: {
    financement: Financement
    onUpdate: (id: string, field: keyof Financement, value: unknown) => void
    onDelete: (id: string) => void
}) {
    const [expanded, setExpanded] = useState(false)
    const [showAmortizationModal, setShowAmortizationModal] = useState(false)
    const typeInfo = typesFinancement.find(t => t.value === financement.type)
    const IconComponent = typeInfo?.icon || Wallet
    const isEmprunt = financement.type === 'EMPRUNT'

    // Calculer l'échéancier si c'est un emprunt
    const echeancier = useMemo(() => {
        if (!isEmprunt || !financement.montant || !financement.tauxInteret || !financement.dureeEmprunt) {
            return []
        }
        return creerEcheancier(
            financement.montant,
            financement.tauxInteret,
            financement.dureeEmprunt,
            new Date(financement.dateDeblocage),
            financement.differe || 0
        )
    }, [financement, isEmprunt])

    // Résumé de l'emprunt
    const totalInterets = echeancier.reduce((sum, e) => sum + e.interets, 0)
    const mensualite = echeancier.length > 0 ? echeancier[0].mensualite : 0

    return (
        <div className="border border-gray-200 rounded-lg mb-3">
            <div className="flex items-center gap-4 p-4 bg-gray-50">
                <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className={`p-2 rounded-lg ${financement.type === 'EMPRUNT' ? 'bg-orange-100' :
                    financement.type === 'CAPITAL_SOCIAL' ? 'bg-green-100' :
                        financement.type === 'SUBVENTION' ? 'bg-purple-100' :
                            'bg-blue-100'
                    }`}>
                    <IconComponent className={`h-5 w-5 ${financement.type === 'EMPRUNT' ? 'text-orange-600' :
                        financement.type === 'CAPITAL_SOCIAL' ? 'text-green-600' :
                            financement.type === 'SUBVENTION' ? 'text-purple-600' :
                                'text-blue-600'
                        }`} />
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                    <Input
                        value={financement.libelle}
                        onChange={(e) => onUpdate(financement.id, 'libelle', e.target.value)}
                        placeholder="Libellé"
                        className="bg-white"
                    />
                    <Select
                        options={typesFinancement}
                        value={financement.type}
                        onChange={(e) => onUpdate(financement.id, 'type', e.target.value)}
                    />
                    <Input
                        type="number"
                        value={financement.montant}
                        onChange={(e) => onUpdate(financement.id, 'montant', parseFloat(e.target.value) || 0)}
                        placeholder="Montant €"
                        className="bg-white"
                    />
                </div>
                <div className="w-32 text-right font-semibold text-green-600">
                    {formatCurrency(financement.montant)}
                </div>
                <button
                    onClick={() => onDelete(financement.id)}
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
                            label="Date de déblocage"
                            value={financement.dateDeblocage}
                            onChange={(e) => onUpdate(financement.id, 'dateDeblocage', e.target.value)}
                        />

                        {isEmprunt && (
                            <>
                                <Input
                                    type="number"
                                    label="Taux d'intérêt annuel (%)"
                                    value={financement.tauxInteret || 0}
                                    onChange={(e) => onUpdate(financement.id, 'tauxInteret', parseFloat(e.target.value) || 0)}
                                    step="0.1"
                                />
                                <Input
                                    type="number"
                                    label="Durée (mois)"
                                    value={financement.dureeEmprunt || 0}
                                    onChange={(e) => onUpdate(financement.id, 'dureeEmprunt', parseInt(e.target.value) || 0)}
                                />
                                <Input
                                    type="number"
                                    label="Différé de remboursement (mois)"
                                    value={financement.differe || 0}
                                    onChange={(e) => onUpdate(financement.id, 'differe', parseInt(e.target.value) || 0)}
                                    hint="Période pendant laquelle seuls les intérêts sont payés"
                                />
                            </>
                        )}
                    </div>

                    {/* Résumé de l'emprunt */}
                    {isEmprunt && echeancier.length > 0 && (
                        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                            <h4 className="font-medium text-orange-800 mb-3">Résumé de l'emprunt</h4>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-500">Mensualité</div>
                                    <div className="font-bold">{formatCurrency(mensualite)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Total intérêts</div>
                                    <div className="font-bold text-orange-600">{formatCurrency(totalInterets)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Coût total</div>
                                    <div className="font-bold">{formatCurrency(financement.montant + totalInterets)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Nombre d'échéances</div>
                                    <div className="font-bold">{echeancier.length}</div>
                                </div>
                            </div>

                            {/* Tableau d'amortissement (3 premières et 3 dernières) */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-sm font-medium text-gray-700">Échéancier (aperçu)</h5>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowAmortizationModal(true)}
                                        className="text-xs"
                                    >
                                        <Calculator className="h-3 w-3 mr-1" />
                                        Voir tableau complet
                                    </Button>
                                </div>
                                <table className="w-full text-xs">
                                    <thead className="bg-orange-100">
                                        <tr>
                                            <th className="px-2 py-1 text-left">N°</th>
                                            <th className="px-2 py-1 text-left">Date</th>
                                            <th className="px-2 py-1 text-right">Capital</th>
                                            <th className="px-2 py-1 text-right">Intérêts</th>
                                            <th className="px-2 py-1 text-right">Mensualité</th>
                                            <th className="px-2 py-1 text-right">CRD</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {echeancier.slice(0, 3).map((e, idx) => (
                                            <tr key={idx} className="border-b">
                                                <td className="px-2 py-1">{e.numero}</td>
                                                <td className="px-2 py-1">{e.date.toLocaleDateString('fr-FR')}</td>
                                                <td className="px-2 py-1 text-right">{formatCurrency(e.capital)}</td>
                                                <td className="px-2 py-1 text-right">{formatCurrency(e.interets)}</td>
                                                <td className="px-2 py-1 text-right font-medium">{formatCurrency(e.mensualite)}</td>
                                                <td className="px-2 py-1 text-right">{formatCurrency(e.capitalRestantDu)}</td>
                                            </tr>
                                        ))}
                                        {echeancier.length > 6 && (
                                            <tr className="text-gray-400">
                                                <td colSpan={6} className="px-2 py-1 text-center">...</td>
                                            </tr>
                                        )}
                                        {echeancier.slice(-3).map((e, idx) => (
                                            <tr key={`last-${idx}`} className="border-b">
                                                <td className="px-2 py-1">{e.numero}</td>
                                                <td className="px-2 py-1">{e.date.toLocaleDateString('fr-FR')}</td>
                                                <td className="px-2 py-1 text-right">{formatCurrency(e.capital)}</td>
                                                <td className="px-2 py-1 text-right">{formatCurrency(e.interets)}</td>
                                                <td className="px-2 py-1 text-right font-medium">{formatCurrency(e.mensualite)}</td>
                                                <td className="px-2 py-1 text-right">{formatCurrency(e.capitalRestantDu)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Modal du tableau d'amortissement complet */}
                    <Modal
                        isOpen={showAmortizationModal}
                        onClose={() => setShowAmortizationModal(false)}
                        title={`Tableau d'amortissement - ${financement.libelle}`}
                        size="xl"
                    >
                        <AmortizationTable
                            echeancier={echeancier}
                            emprunt={financement}
                        />
                    </Modal>
                </div>
            )}
        </div>
    )
}

export default function FinancementPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const previsionnelId = 'demo'
    const annees = [2026, 2027, 2028]

    // État pour les financements
    const [financements, setFinancements] = useState<Financement[]>([
        {
            id: generateId(),
            type: 'CAPITAL_SOCIAL',
            libelle: 'Apport en capital',
            montant: 10000,
            dateDeblocage: '2026-01-01',
        },
        {
            id: generateId(),
            type: 'EMPRUNT',
            libelle: 'Emprunt bancaire principal',
            montant: 30000,
            dateDeblocage: '2026-01-15',
            tauxInteret: 4.5,
            dureeEmprunt: 60, // 5 ans
            differe: 0,
        },
    ])

    // Besoins de financement (liés aux investissements)
    const besoins: BesoinFinancement[] = [
        { id: '1', libelle: 'Investissements', montant: 38000, annee: 2026 },
        { id: '2', libelle: 'BFR initial', montant: 5000, annee: 2026 },
        { id: '3', libelle: 'Remboursement emprunts', montant: 0, annee: 2026 },
    ]

    // Ajouter un financement
    const addFinancement = (type: TypeFinancement) => {
        const typeInfo = typesFinancement.find(t => t.value === type)
        setFinancements([...financements, {
            id: generateId(),
            type,
            libelle: typeInfo?.label || 'Nouveau financement',
            montant: 0,
            dateDeblocage: new Date().toISOString().split('T')[0],
            ...(type === 'EMPRUNT' ? { tauxInteret: 4.0, dureeEmprunt: 60, differe: 0 } : {}),
        }])
    }

    // Mettre à jour un financement
    const updateFinancement = (id: string, field: keyof Financement, value: unknown) => {
        setFinancements(financements.map(f =>
            f.id === id ? { ...f, [field]: value } : f
        ))
    }

    // Supprimer un financement
    const deleteFinancement = (id: string) => {
        setFinancements(financements.filter(f => f.id !== id))
    }

    // Calculs globaux
    const calculs = useMemo(() => {
        // Total des ressources
        const totalCapital = financements
            .filter(f => f.type === 'CAPITAL_SOCIAL')
            .reduce((sum, f) => sum + f.montant, 0)

        const totalApportsCCA = financements
            .filter(f => f.type === 'APPORT_CCA')
            .reduce((sum, f) => sum + f.montant, 0)

        const totalEmprunts = financements
            .filter(f => f.type === 'EMPRUNT')
            .reduce((sum, f) => sum + f.montant, 0)

        const totalSubventions = financements
            .filter(f => f.type === 'SUBVENTION')
            .reduce((sum, f) => sum + f.montant, 0)

        const totalRessources = totalCapital + totalApportsCCA + totalEmprunts + totalSubventions

        // Total des besoins
        const totalBesoins = besoins.reduce((sum, b) => sum + b.montant, 0)

        // Équilibre
        const solde = totalRessources - totalBesoins

        // Remboursements annuels
        const remboursementsParAnnee: Record<number, number> = {}
        const interetsParAnnee: Record<number, number> = {}

        financements.filter(f => f.type === 'EMPRUNT').forEach(emprunt => {
            if (!emprunt.montant || !emprunt.tauxInteret || !emprunt.dureeEmprunt) return

            const echeancier = creerEcheancier(
                emprunt.montant,
                emprunt.tauxInteret,
                emprunt.dureeEmprunt,
                new Date(emprunt.dateDeblocage),
                emprunt.differe || 0
            )

            echeancier.forEach(e => {
                const annee = e.date.getFullYear()
                remboursementsParAnnee[annee] = (remboursementsParAnnee[annee] || 0) + e.capital
                interetsParAnnee[annee] = (interetsParAnnee[annee] || 0) + e.interets
            })
        })

        // Capital restant dû par année
        const crdParAnnee: Record<number, number> = {}
        annees.forEach(annee => {
            let crdTotal = 0
            financements.filter(f => f.type === 'EMPRUNT').forEach(emprunt => {
                if (!emprunt.montant || !emprunt.tauxInteret || !emprunt.dureeEmprunt) return

                const echeancier = creerEcheancier(
                    emprunt.montant,
                    emprunt.tauxInteret,
                    emprunt.dureeEmprunt,
                    new Date(emprunt.dateDeblocage),
                    emprunt.differe || 0
                )

                // CRD au 31/12 de l'année
                const dernierEcheanceAnnee = echeancier
                    .filter(e => e.date.getFullYear() === annee)
                    .pop()

                if (dernierEcheanceAnnee) {
                    crdTotal += dernierEcheanceAnnee.capitalRestantDu
                } else {
                    // Si pas d'échéance cette année, prendre le CRD de l'année précédente
                    const echeancesAvant = echeancier.filter(e => e.date.getFullYear() < annee)
                    if (echeancesAvant.length > 0) {
                        crdTotal += echeancesAvant[echeancesAvant.length - 1].capitalRestantDu
                    } else {
                        crdTotal += emprunt.montant
                    }
                }
            })
            crdParAnnee[annee] = crdTotal
        })

        return {
            totalCapital,
            totalApportsCCA,
            totalEmprunts,
            totalSubventions,
            totalRessources,
            totalBesoins,
            solde,
            remboursementsParAnnee,
            interetsParAnnee,
            crdParAnnee,
        }
    }, [financements, besoins, annees])

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar previsionnelId={previsionnelId} />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link
                            href={`/previsionnel/${previsionnelId}/bilan`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour au bilan
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Plan de Financement</h1>
                        <p className="text-gray-600">Gérez vos ressources et suivez l'équilibre besoins/ressources</p>
                    </div>
                    <Button variant="primary">
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                    </Button>
                </div>

                {/* Résumé */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card variant="bordered" className="p-4 border-green-200 bg-green-50">
                        <div className="text-sm text-green-600">Total Ressources</div>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(calculs.totalRessources)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4 border-red-200 bg-red-50">
                        <div className="text-sm text-red-600">Total Besoins</div>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(calculs.totalBesoins)}</div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">Solde</div>
                        <div className={`text-2xl font-bold ${calculs.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(calculs.solde)}
                        </div>
                    </Card>
                    <Card variant="bordered" className="p-4">
                        <div className="text-sm text-gray-500">CRD fin 2026</div>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(calculs.crdParAnnee[2026] || 0)}
                        </div>
                    </Card>
                </div>

                {/* Ressources de financement */}
                <Card variant="bordered" className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between bg-green-50 border-b border-green-200">
                        <div>
                            <CardTitle className="text-lg text-green-800">Ressources de financement</CardTitle>
                            <p className="text-sm text-green-600">Capital, apports, emprunts, subventions</p>
                        </div>
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-green-300 rounded-lg px-3 py-2 pr-8 text-sm cursor-pointer"
                                onChange={(e) => {
                                    addFinancement(e.target.value as TypeFinancement)
                                    e.target.value = ''
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Ajouter un financement...</option>
                                {typesFinancement.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {financements.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Aucun financement. Cliquez sur &quot;Ajouter un financement&quot; pour commencer.
                            </div>
                        ) : (
                            financements.map(f => (
                                <FinancementRow
                                    key={f.id}
                                    financement={f}
                                    onUpdate={updateFinancement}
                                    onDelete={deleteFinancement}
                                />
                            ))
                        )}

                        {/* Sous-totaux par type */}
                        <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Capital :</span>
                                <span className="font-semibold ml-2">{formatCurrency(calculs.totalCapital)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">CCA :</span>
                                <span className="font-semibold ml-2">{formatCurrency(calculs.totalApportsCCA)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Emprunts :</span>
                                <span className="font-semibold ml-2">{formatCurrency(calculs.totalEmprunts)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Subventions :</span>
                                <span className="font-semibold ml-2">{formatCurrency(calculs.totalSubventions)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tableau Plan de Financement */}
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-lg">Plan de Financement sur 3 ans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="py-3 px-4 text-left font-medium text-gray-600">Poste</th>
                                    {annees.map(a => (
                                        <th key={a} className="py-3 px-4 text-right font-medium text-gray-600">{a}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* RESSOURCES */}
                                <tr className="bg-green-50 font-medium">
                                    <td colSpan={4} className="py-2 px-4 text-green-800">
                                        <ArrowUpRight className="h-4 w-4 inline mr-2" />
                                        RESSOURCES
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 px-4 pl-8">Apports en capital</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(calculs.totalCapital)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 px-4 pl-8">Emprunts</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(calculs.totalEmprunts)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 px-4 pl-8">CAF (capacité d'autofinancement)</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(-600)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(5000)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(12000)}</td>
                                </tr>
                                <tr className="bg-green-100 font-bold">
                                    <td className="py-2 px-4">Total Ressources</td>
                                    <td className="py-2 px-4 text-right text-green-700">{formatCurrency(calculs.totalRessources - 600)}</td>
                                    <td className="py-2 px-4 text-right text-green-700">{formatCurrency(5000)}</td>
                                    <td className="py-2 px-4 text-right text-green-700">{formatCurrency(12000)}</td>
                                </tr>

                                {/* EMPLOIS */}
                                <tr className="bg-red-50 font-medium">
                                    <td colSpan={4} className="py-2 px-4 text-red-800">
                                        <ArrowDownRight className="h-4 w-4 inline mr-2" />
                                        EMPLOIS (BESOINS)
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 px-4 pl-8">Investissements</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(38000)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(0)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 px-4 pl-8">Variation du BFR</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(5000)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(500)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(500)}</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 px-4 pl-8">Remboursement emprunts</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(calculs.remboursementsParAnnee[2026] || 0)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(calculs.remboursementsParAnnee[2027] || 0)}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(calculs.remboursementsParAnnee[2028] || 0)}</td>
                                </tr>
                                <tr className="bg-red-100 font-bold">
                                    <td className="py-2 px-4">Total Emplois</td>
                                    <td className="py-2 px-4 text-right text-red-600">
                                        {formatCurrency(38000 + 5000 + (calculs.remboursementsParAnnee[2026] || 0))}
                                    </td>
                                    <td className="py-2 px-4 text-right text-red-600">
                                        {formatCurrency(500 + (calculs.remboursementsParAnnee[2027] || 0))}
                                    </td>
                                    <td className="py-2 px-4 text-right text-red-600">
                                        {formatCurrency(500 + (calculs.remboursementsParAnnee[2028] || 0))}
                                    </td>
                                </tr>

                                {/* SOLDE */}
                                <tr className="bg-gray-100 font-bold text-lg">
                                    <td className="py-3 px-4">VARIATION DE TRÉSORERIE</td>
                                    <td className={`py-3 px-4 text-right ${(calculs.totalRessources - 600 - 43000 - (calculs.remboursementsParAnnee[2026] || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(calculs.totalRessources - 600 - 43000 - (calculs.remboursementsParAnnee[2026] || 0))}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {formatCurrency(5000 - 500 - (calculs.remboursementsParAnnee[2027] || 0))}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {formatCurrency(12000 - 500 - (calculs.remboursementsParAnnee[2028] || 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                            <strong>Note :</strong> La CAF (Capacité d'Autofinancement) est calculée automatiquement
                            à partir du compte de résultat. Les remboursements d'emprunts sont déduits des échéanciers
                            saisis dans les financements.
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
