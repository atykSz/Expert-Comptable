'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Calendar,
    Settings,
    FileText,
    AlertCircle
} from 'lucide-react'
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'

type FormeJuridique = 'SARL' | 'SAS' | 'SASU' | 'EURL' | 'EI' | 'AUTO_ENTREPRENEUR' | 'SA' | 'SCI' | 'SCM' | 'SELARL'
type RegimeFiscal = 'IS' | 'IR' | 'MICRO_BIC' | 'MICRO_BNC' | 'BIC_REEL' | 'BNC_REEL'
type FormatDocument = 'PCG_STANDARD' | 'LIASSE_2035' | 'LIASSE_2031'

interface FormData {
    // Informations entreprise
    raisonSociale: string
    formeJuridique: FormeJuridique
    regimeFiscal: RegimeFiscal
    secteurActivite: string

    // Prévisionnel
    titrePrevisionnel: string
    dateDebut: string
    nombreMois: number
    formatDocument: FormatDocument

    // Hypothèses
    tauxTVAVentes: number
    tauxTVAAchats: number
    delaiPaiementClients: number
    delaiPaiementFournisseurs: number
    tauxChargesSociales: number
    tauxIS: number
}

const formesJuridiques = [
    { value: 'EI', label: 'Entreprise Individuelle (EI)' },
    { value: 'AUTO_ENTREPRENEUR', label: 'Micro-entrepreneur / Auto-entrepreneur' },
    { value: 'EURL', label: 'EURL' },
    { value: 'SARL', label: 'SARL' },
    { value: 'SASU', label: 'SASU' },
    { value: 'SAS', label: 'SAS' },
    { value: 'SA', label: 'SA' },
    { value: 'SCI', label: 'SCI' },
    { value: 'SCM', label: 'SCM (Société Civile de Moyens)' },
    { value: 'SELARL', label: 'SELARL (Profession libérale)' },
]

// Régimes fiscaux groupés par catégorie
const regimesFiscaux = [
    // Sociétés
    { value: 'IS', label: 'Impôt sur les Sociétés (IS)', category: 'societes' },

    // BIC - Bénéfices Industriels et Commerciaux
    { value: 'MICRO_BIC', label: 'Micro-BIC (< 188 700 € / 77 700 €)', category: 'bic' },
    { value: 'BIC_REEL', label: 'BIC Réel (simplifié ou normal)', category: 'bic' },

    // BNC - Bénéfices Non Commerciaux
    { value: 'MICRO_BNC', label: 'Micro-BNC (< 77 700 €)', category: 'bnc' },
    { value: 'BNC_REEL', label: 'BNC Déclaration contrôlée - 2035', category: 'bnc' },

    // IR générique
    { value: 'IR', label: 'IR - Impôt sur le Revenu (autre)', category: 'ir' },
]

const dureesPrevisionnel = [
    { value: '12', label: '12 mois (1 an)' },
    { value: '24', label: '24 mois (2 ans)' },
    { value: '36', label: '36 mois (3 ans)' },
]

// Détermine le format de document adapté au régime fiscal
function getFormatDocument(regimeFiscal: RegimeFiscal): FormatDocument {
    switch (regimeFiscal) {
        case 'BNC_REEL':
            return 'LIASSE_2035'
        case 'BIC_REEL':
            return 'LIASSE_2031'
        default:
            return 'PCG_STANDARD'
    }
}

// Détermine si le régime est un BNC
function isBNC(regimeFiscal: RegimeFiscal): boolean {
    return regimeFiscal === 'MICRO_BNC' || regimeFiscal === 'BNC_REEL'
}

// Détermine si le régime est un BIC
function isBIC(regimeFiscal: RegimeFiscal): boolean {
    return regimeFiscal === 'MICRO_BIC' || regimeFiscal === 'BIC_REEL'
}

export default function NouveauPrevisionnelPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState<FormData>({
        raisonSociale: '',
        formeJuridique: 'EI',
        regimeFiscal: 'BNC_REEL',
        secteurActivite: '',
        titrePrevisionnel: '',
        dateDebut: new Date().toISOString().split('T')[0],
        nombreMois: 36,
        formatDocument: 'LIASSE_2035',
        tauxTVAVentes: 20,
        tauxTVAAchats: 20,
        delaiPaiementClients: 0, // Comptant pour professions libérales
        delaiPaiementFournisseurs: 30,
        tauxChargesSociales: 22, // URSSAF profession libérale
        tauxIS: 25,
    })

    // Met à jour automatiquement le format quand le régime change
    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value }

            // Mise à jour automatique du format de document
            if (field === 'regimeFiscal') {
                newData.formatDocument = getFormatDocument(value as RegimeFiscal)

                // Ajuster les hypothèses selon le régime
                if (isBNC(value as RegimeFiscal)) {
                    // Profession libérale : pas de stock, délai client court
                    newData.delaiPaiementClients = 0
                    newData.tauxChargesSociales = 22 // URSSAF
                } else if (isBIC(value as RegimeFiscal)) {
                    newData.delaiPaiementClients = 30
                    newData.tauxChargesSociales = 45 // Salariés
                }
            }

            return newData
        })
    }

    // Infos sur le format sélectionné
    const formatInfo = useMemo(() => {
        switch (formData.formatDocument) {
            case 'LIASSE_2035':
                return {
                    label: 'Déclaration 2035',
                    description: 'Format adapté aux professions libérales (BNC). Structure Recettes/Dépenses conforme à la liasse fiscale 2035.',
                    color: 'bg-purple-100 text-purple-700 border-purple-200',
                }
            case 'LIASSE_2031':
                return {
                    label: 'Liasse 2031 (BIC)',
                    description: 'Format adapté aux activités commerciales et artisanales au régime réel.',
                    color: 'bg-orange-100 text-orange-700 border-orange-200',
                }
            default:
                return {
                    label: 'Compte de résultat PCG',
                    description: 'Format standard conforme au Plan Comptable Général, adapté aux sociétés.',
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                }
        }
    }, [formData.formatDocument])

    const handleSubmit = async () => {
        setIsLoading(true)

        // Simuler la création (en attendant l'API)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Générer un ID temporaire
        const tempId = 'demo-' + Date.now()

        // Sauvegarder dans localStorage pour la démo
        localStorage.setItem(`previsionnel-${tempId}`, JSON.stringify(formData))

        // Redirection vers la page adaptée au format
        if (formData.formatDocument === 'LIASSE_2035') {
            router.push(`/previsionnel/${tempId}/declaration-2035`)
        } else {
            router.push(`/previsionnel/${tempId}/compte-resultat`)
        }
    }

    const steps = [
        { number: 1, title: 'Entreprise', icon: Building2 },
        { number: 2, title: 'Prévisionnel', icon: Calendar },
        { number: 3, title: 'Hypothèses', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à l'accueil
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Titre */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Nouveau Prévisionnel
                    </h1>
                    <p className="text-gray-600">
                        Créez votre prévisionnel comptable en quelques étapes
                    </p>
                </div>

                {/* Stepper */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-4">
                        {steps.map((s, index) => (
                            <div key={s.number} className="flex items-center">
                                <button
                                    onClick={() => setStep(s.number)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${step === s.number
                                            ? 'bg-blue-600 text-white'
                                            : step > s.number
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    <s.icon className="h-4 w-4" />
                                    <span className="font-medium">{s.title}</span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 h-0.5 mx-2 ${step > s.number ? 'bg-green-400' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formulaire */}
                <Card variant="bordered" className="shadow-sm">
                    {/* Étape 1: Entreprise */}
                    {step === 1 && (
                        <>
                            <CardHeader>
                                <CardTitle>Informations de l'entreprise</CardTitle>
                                <CardDescription>
                                    Renseignez les informations de base de votre entreprise ou activité
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Input
                                    label="Raison sociale / Nom du cabinet"
                                    placeholder="Cabinet Dr Dupont"
                                    value={formData.raisonSociale}
                                    onChange={(e) => updateField('raisonSociale', e.target.value)}
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Select
                                        label="Forme juridique"
                                        options={formesJuridiques}
                                        value={formData.formeJuridique}
                                        onChange={(e) => updateField('formeJuridique', e.target.value as FormeJuridique)}
                                    />

                                    <Select
                                        label="Régime fiscal"
                                        options={regimesFiscaux}
                                        value={formData.regimeFiscal}
                                        onChange={(e) => updateField('regimeFiscal', e.target.value as RegimeFiscal)}
                                    />
                                </div>

                                {/* Badge du format détecté */}
                                <div className={`p-4 rounded-lg border ${formatInfo.color}`}>
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 mt-0.5" />
                                        <div>
                                            <div className="font-semibold">{formatInfo.label}</div>
                                            <div className="text-sm opacity-90">{formatInfo.description}</div>
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label="Secteur d'activité / Profession"
                                    placeholder="Médecin, Avocat, Architecte, Commerce..."
                                    value={formData.secteurActivite}
                                    onChange={(e) => updateField('secteurActivite', e.target.value)}
                                    hint={isBNC(formData.regimeFiscal) ? "Ex: Médecin, Avocat, Consultant, Architecte..." : undefined}
                                />

                                <div className="flex justify-end pt-4">
                                    <Button
                                        variant="primary"
                                        onClick={() => setStep(2)}
                                        disabled={!formData.raisonSociale}
                                    >
                                        Suivant
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* Étape 2: Prévisionnel */}
                    {step === 2 && (
                        <>
                            <CardHeader>
                                <CardTitle>Paramètres du prévisionnel</CardTitle>
                                <CardDescription>
                                    Définissez la période et les caractéristiques de votre prévisionnel
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Input
                                    label="Titre du prévisionnel"
                                    placeholder={formData.formatDocument === 'LIASSE_2035'
                                        ? "Prévisionnel 2035 - 2026-2028"
                                        : "Business Plan 2026-2028"
                                    }
                                    value={formData.titrePrevisionnel}
                                    onChange={(e) => updateField('titrePrevisionnel', e.target.value)}
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Date de début d'exercice"
                                        value={formData.dateDebut}
                                        onChange={(e) => updateField('dateDebut', e.target.value)}
                                    />

                                    <Select
                                        label="Durée du prévisionnel"
                                        options={dureesPrevisionnel}
                                        value={formData.nombreMois.toString()}
                                        onChange={(e) => updateField('nombreMois', parseInt(e.target.value))}
                                    />
                                </div>

                                {/* Info spécifique BNC */}
                                {formData.formatDocument === 'LIASSE_2035' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                                            <div className="text-sm text-purple-900">
                                                <p className="font-medium mb-1">Prévisionnel au format 2035</p>
                                                <p className="text-purple-700">
                                                    Votre prévisionnel suivra la structure de la déclaration 2035 (BNC) :
                                                    recettes encaissées, dépenses professionnelles, et détermination du résultat fiscal.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => setStep(1)}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Précédent
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => setStep(3)}
                                        disabled={!formData.titrePrevisionnel}
                                    >
                                        Suivant
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* Étape 3: Hypothèses */}
                    {step === 3 && (
                        <>
                            <CardHeader>
                                <CardTitle>Hypothèses financières</CardTitle>
                                <CardDescription>
                                    Ces paramètres seront utilisés pour les calculs automatiques
                                    {isBNC(formData.regimeFiscal) && " (adaptés aux BNC)"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Taux TVA Recettes (%)"
                                        value={formData.tauxTVAVentes}
                                        onChange={(e) => updateField('tauxTVAVentes', parseFloat(e.target.value))}
                                        hint={isBNC(formData.regimeFiscal)
                                            ? "20% standard, 0% si franchise en base (< 36 800 €)"
                                            : "20% = taux normal, 10% = intermédiaire, 5.5% = réduit"
                                        }
                                    />

                                    <Input
                                        type="number"
                                        label="Taux TVA Dépenses (%)"
                                        value={formData.tauxTVAAchats}
                                        onChange={(e) => updateField('tauxTVAAchats', parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label={isBNC(formData.regimeFiscal)
                                            ? "Délai encaissement honoraires (jours)"
                                            : "Délai paiement clients (jours)"
                                        }
                                        value={formData.delaiPaiementClients}
                                        onChange={(e) => updateField('delaiPaiementClients', parseInt(e.target.value))}
                                        hint={isBNC(formData.regimeFiscal)
                                            ? "0 = comptant (cas général professions libérales)"
                                            : "En moyenne 30-45 jours pour les pros"
                                        }
                                    />

                                    <Input
                                        type="number"
                                        label="Délai paiement fournisseurs (jours)"
                                        value={formData.delaiPaiementFournisseurs}
                                        onChange={(e) => updateField('delaiPaiementFournisseurs', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label={isBNC(formData.regimeFiscal)
                                            ? "Taux cotisations sociales (%)"
                                            : "Taux charges sociales patronales (%)"
                                        }
                                        value={formData.tauxChargesSociales}
                                        onChange={(e) => updateField('tauxChargesSociales', parseFloat(e.target.value))}
                                        hint={isBNC(formData.regimeFiscal)
                                            ? "Environ 20-25% pour TNS/profession libérale"
                                            : "Environ 40-45% pour les salariés"
                                        }
                                    />

                                    {formData.regimeFiscal === 'IS' && (
                                        <Input
                                            type="number"
                                            label="Taux IS (%)"
                                            value={formData.tauxIS}
                                            onChange={(e) => updateField('tauxIS', parseFloat(e.target.value))}
                                            hint="15% jusqu'à 42 500€, puis 25%"
                                        />
                                    )}
                                </div>

                                {/* Info CSG déductible pour BNC */}
                                {isBNC(formData.regimeFiscal) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="text-sm text-blue-900">
                                            <p className="font-medium mb-1">💡 Rappel BNC</p>
                                            <p className="text-blue-700">
                                                La CSG déductible (6,8%) sera automatiquement prise en compte dans les calculs
                                                de votre résultat fiscal.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => setStep(2)}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Précédent
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        isLoading={isLoading}
                                    >
                                        {formData.formatDocument === 'LIASSE_2035'
                                            ? "Créer le prévisionnel 2035"
                                            : "Créer le prévisionnel"
                                        }
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </main>
        </div>
    )
}
