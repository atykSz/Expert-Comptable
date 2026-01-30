'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Calendar,
    Settings,
    FileText,
    AlertCircle,
    Check
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

    // Previsionnel
    titrePrevisionnel: string
    dateDebut: string
    nombreMois: number
    formatDocument: FormatDocument

    // Hypotheses
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
    { value: 'SCM', label: 'SCM (Societe Civile de Moyens)' },
    { value: 'SELARL', label: 'SELARL (Profession liberale)' },
]

// Regimes fiscaux groupes par categorie
const regimesFiscaux = [
    // Societes
    { value: 'IS', label: 'Impot sur les Societes (IS)' },

    // BIC - Benefices Industriels et Commerciaux
    { value: 'MICRO_BIC', label: 'Micro-BIC (< 188 700 EUR / 77 700 EUR)' },
    { value: 'BIC_REEL', label: 'BIC Reel (simplifie ou normal)' },

    // BNC - Benefices Non Commerciaux
    { value: 'MICRO_BNC', label: 'Micro-BNC (< 77 700 EUR)' },
    { value: 'BNC_REEL', label: 'BNC Declaration controlee - 2035' },

    // IR generique
    { value: 'IR', label: 'IR - Impot sur le Revenu (autre)' },
]

const dureesPrevisionnel = [
    { value: '12', label: '12 mois (1 an)' },
    { value: '24', label: '24 mois (2 ans)' },
    { value: '36', label: '36 mois (3 ans)' },
]

// Determine le format de document adapte au regime fiscal
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

// Determine si le regime est un BNC
function isBNC(regimeFiscal: RegimeFiscal): boolean {
    return regimeFiscal === 'MICRO_BNC' || regimeFiscal === 'BNC_REEL'
}

// Determine si le regime est un BIC
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
        delaiPaiementClients: 0, // Comptant pour professions liberales
        delaiPaiementFournisseurs: 30,
        tauxChargesSociales: 22, // URSSAF profession liberale
        tauxIS: 25,
    })

    // Met a jour automatiquement le format quand le regime change
    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value }

            // Mise a jour automatique du format de document
            if (field === 'regimeFiscal') {
                newData.formatDocument = getFormatDocument(value as RegimeFiscal)

                // Ajuster les hypotheses selon le regime
                if (isBNC(value as RegimeFiscal)) {
                    // Profession liberale : pas de stock, delai client court
                    newData.delaiPaiementClients = 0
                    newData.tauxChargesSociales = 22 // URSSAF
                } else if (isBIC(value as RegimeFiscal)) {
                    newData.delaiPaiementClients = 30
                    newData.tauxChargesSociales = 45 // Salaries
                }
            }

            return newData
        })
    }

    // Infos sur le format selectionne
    const formatInfo = useMemo(() => {
        switch (formData.formatDocument) {
            case 'LIASSE_2035':
                return {
                    label: 'Declaration 2035',
                    description: 'Format adapte aux professions liberales (BNC). Structure Recettes/Depenses conforme a la liasse fiscale 2035.',
                    color: 'bg-accent/10 text-accent border-accent/20',
                }
            case 'LIASSE_2031':
                return {
                    label: 'Liasse 2031 (BIC)',
                    description: 'Format adapte aux activites commerciales et artisanales au regime reel.',
                    color: 'bg-warning/10 text-warning border-warning/20',
                }
            default:
                return {
                    label: 'Compte de resultat PCG',
                    description: 'Format standard conforme au Plan Comptable General, adapte aux societes.',
                    color: 'bg-foreground/5 text-foreground border-border',
                }
        }
    }, [formData.formatDocument])

    const handleSubmit = async () => {
        setIsLoading(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Mode connecté : Sauvegarde en BDD via API
                const response = await fetch('/api/previsionnels', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        titre: formData.titrePrevisionnel,
                        dateDebut: formData.dateDebut,
                        nombreMois: formData.nombreMois,
                        regimeFiscal: formData.regimeFiscal,
                        formatDocument: formData.formatDocument,
                        hypotheses: {
                            tauxTVAVentes: formData.tauxTVAVentes,
                            tauxTVAAchats: formData.tauxTVAAchats,
                            delaiPaiementClients: formData.delaiPaiementClients,
                            delaiPaiementFournisseurs: formData.delaiPaiementFournisseurs,
                            tauxChargesSocialesPatronales: isBNC(formData.regimeFiscal) ? 0 : 45, // TODO: Rendre editable
                            tauxChargesSocialesSalariales: formData.tauxChargesSociales, // Utiliser la valeur du formulaire (simplifié en une seule valeur pour l'instant)
                            tauxIS: formData.tauxIS,
                        }
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    console.error('API Error:', response.status, errorData)
                    throw new Error(errorData.error || `Erreur lors de la création (${response.status})`)
                }

                const newPrevisionnel = await response.json()

                // Redirection
                if (formData.formatDocument === 'LIASSE_2035') {
                    router.push(`/previsionnel/${newPrevisionnel.id}/declaration-2035`)
                } else {
                    router.push(`/previsionnel/${newPrevisionnel.id}/compte-resultat`)
                }

            } else {
                // Mode non connecté : LocalStorage (Demo)
                // Simuler la creation
                await new Promise(resolve => setTimeout(resolve, 500))

                const tempId = 'demo-' + Date.now()
                localStorage.setItem(`previsionnel-${tempId}`, JSON.stringify(formData))

                if (formData.formatDocument === 'LIASSE_2035') {
                    router.push(`/previsionnel/${tempId}/declaration-2035`)
                } else {
                    router.push(`/previsionnel/${tempId}/compte-resultat`)
                }
            }
        } catch (error) {
            console.error(error)
            const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
            alert(`Une erreur est survenue :\n${errorMsg}`)
        } finally {
            setIsLoading(false)
        }
    }

    const steps = [
        { number: 1, title: 'Entreprise', icon: Building2 },
        { number: 2, title: 'Previsionnel', icon: Calendar },
        { number: 3, title: 'Hypotheses', icon: Settings },
    ]



    return (
        <div className="min-h-screen bg-background">


            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour a l&apos;accueil
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Titre */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-semibold tracking-tight mb-3">
                        Nouveau Previsionnel
                    </h1>
                    <p className="text-muted-foreground">
                        Creez votre previsionnel comptable en quelques etapes
                    </p>
                </div>

                {/* Stepper */}
                <div className="flex justify-center mb-10">
                    <div className="flex items-center gap-2">
                        {steps.map((s, index) => (
                            <div key={s.number} className="flex items-center">
                                <button
                                    onClick={() => setStep(s.number)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${step === s.number
                                        ? 'bg-foreground text-background'
                                        : step > s.number
                                            ? 'bg-success/10 text-success'
                                            : 'bg-secondary text-muted-foreground'
                                        }`}
                                >
                                    {step > s.number ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <s.icon className="h-4 w-4" />
                                    )}
                                    <span className="font-medium text-sm">{s.title}</span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-2 rounded-full ${step > s.number ? 'bg-success' : 'bg-border'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formulaire */}
                <Card variant="bordered">
                    {/* Etape 1: Entreprise */}
                    {step === 1 && (
                        <>
                            <CardHeader>
                                <CardTitle>Informations de l&apos;entreprise</CardTitle>
                                <CardDescription>
                                    Renseignez les informations de base de votre entreprise ou activite
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
                                        label="Regime fiscal"
                                        options={regimesFiscaux}
                                        value={formData.regimeFiscal}
                                        onChange={(e) => updateField('regimeFiscal', e.target.value as RegimeFiscal)}
                                    />
                                </div>

                                {/* Badge du format detecte */}
                                <div className={`p-4 rounded-xl border ${formatInfo.color}`}>
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 mt-0.5" />
                                        <div>
                                            <div className="font-semibold">{formatInfo.label}</div>
                                            <div className="text-sm opacity-90 mt-1">{formatInfo.description}</div>
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label="Secteur d'activite / Profession"
                                    placeholder="Medecin, Avocat, Architecte, Commerce..."
                                    value={formData.secteurActivite}
                                    onChange={(e) => updateField('secteurActivite', e.target.value)}
                                    hint={isBNC(formData.regimeFiscal) ? "Ex: Medecin, Avocat, Consultant, Architecte..." : undefined}
                                />

                                <div className="flex justify-end pt-4">
                                    <Button
                                        variant="default"
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

                    {/* Etape 2: Previsionnel */}
                    {step === 2 && (
                        <>
                            <CardHeader>
                                <CardTitle>Parametres du previsionnel</CardTitle>
                                <CardDescription>
                                    Definissez la periode et les caracteristiques de votre previsionnel
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Input
                                    label="Titre du previsionnel"
                                    placeholder={formData.formatDocument === 'LIASSE_2035'
                                        ? "Previsionnel 2035 - 2026-2028"
                                        : "Business Plan 2026-2028"
                                    }
                                    value={formData.titrePrevisionnel}
                                    onChange={(e) => updateField('titrePrevisionnel', e.target.value)}
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Date de debut d'exercice"
                                        value={formData.dateDebut}
                                        onChange={(e) => updateField('dateDebut', e.target.value)}
                                    />

                                    <Select
                                        label="Duree du previsionnel"
                                        options={dureesPrevisionnel}
                                        value={formData.nombreMois.toString()}
                                        onChange={(e) => updateField('nombreMois', parseInt(e.target.value))}
                                    />
                                </div>

                                {/* Info specifique BNC */}
                                {formData.formatDocument === 'LIASSE_2035' && (
                                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-accent mb-1">Previsionnel au format 2035</p>
                                                <p className="text-accent/80">
                                                    Votre previsionnel suivra la structure de la declaration 2035 (BNC) :
                                                    recettes encaissees, depenses professionnelles, et determination du resultat fiscal.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => setStep(1)}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Precedent
                                    </Button>
                                    <Button
                                        variant="default"
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

                    {/* Etape 3: Hypotheses */}
                    {step === 3 && (
                        <>
                            <CardHeader>
                                <CardTitle>Hypotheses financieres</CardTitle>
                                <CardDescription>
                                    Ces parametres seront utilises pour les calculs automatiques
                                    {isBNC(formData.regimeFiscal) && " (adaptes aux BNC)"}
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
                                            ? "20% standard, 0% si franchise en base (< 36 800 EUR)"
                                            : "20% = taux normal, 10% = intermediaire, 5.5% = reduit"
                                        }
                                    />

                                    <Input
                                        type="number"
                                        label="Taux TVA Depenses (%)"
                                        value={formData.tauxTVAAchats}
                                        onChange={(e) => updateField('tauxTVAAchats', parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label={isBNC(formData.regimeFiscal)
                                            ? "Delai encaissement honoraires (jours)"
                                            : "Delai paiement clients (jours)"
                                        }
                                        value={formData.delaiPaiementClients}
                                        onChange={(e) => updateField('delaiPaiementClients', parseInt(e.target.value))}
                                        hint={isBNC(formData.regimeFiscal) ? "0 = paiement comptant (habituel en liberal)" : "30, 45 ou 60 jours"}
                                    />

                                    <Input
                                        type="number"
                                        label="Delai paiement fournisseurs (jours)"
                                        value={formData.delaiPaiementFournisseurs}
                                        onChange={(e) => updateField('delaiPaiementFournisseurs', parseInt(e.target.value))}
                                        hint="30 jours = delai standard"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Taux charges sociales (%)"
                                        value={formData.tauxChargesSociales}
                                        onChange={(e) => updateField('tauxChargesSociales', parseFloat(e.target.value))}
                                        hint={isBNC(formData.regimeFiscal)
                                            ? "22% URSSAF (profession liberale classique)"
                                            : "45% charges employeur moyennes"
                                        }
                                    />

                                    {(formData.regimeFiscal === 'IS') && (
                                        <Input
                                            type="number"
                                            label="Taux IS (%)"
                                            value={formData.tauxIS}
                                            onChange={(e) => updateField('tauxIS', parseFloat(e.target.value))}
                                            hint="15% jusqu'a 42 500 EUR, puis 25%"
                                        />
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => setStep(2)}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Precedent
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={handleSubmit}
                                        isLoading={isLoading}
                                    >
                                        Creer le previsionnel
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>

                {/* Resume */}
                {step > 1 && (
                    <div className="mt-8 p-6 rounded-xl bg-secondary/50 border border-border">
                        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Resume</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Entreprise:</span>
                                <span className="ml-2 font-medium">{formData.raisonSociale || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Format:</span>
                                <span className="ml-2 font-medium">{formatInfo.label}</span>
                            </div>
                            {step > 2 && (
                                <>
                                    <div>
                                        <span className="text-muted-foreground">Duree:</span>
                                        <span className="ml-2 font-medium">{formData.nombreMois} mois</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Debut:</span>
                                        <span className="ml-2 font-medium">{formData.dateDebut}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
