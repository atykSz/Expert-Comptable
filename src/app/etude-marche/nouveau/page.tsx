'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { SelecteurNAF } from '@/components/etude-marche/SelecteurNAF'
import { AdresseAutocomplete } from '@/components/etude-marche/AdresseAutocomplete'
import { Loader2, ArrowRight, TrendingUp } from 'lucide-react'
import { useSuccessToast, useErrorToast } from '@/components/ui'

export default function NouvelleEtudePage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>}>
            <NouvelleEtudeForm />
        </Suspense>
    )
}

function NouvelleEtudeForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const previsionnelId = searchParams.get('previsionnelId')

    const [loading, setLoading] = useState(false)
    const successToast = useSuccessToast()
    const errorToast = useErrorToast()

    const [formData, setFormData] = useState({
        previsionnelId: previsionnelId || undefined,
        codeNAF: '',
        libelleNAF: '',
        adresse: '',
        codePostal: '',
        commune: '',
        lat: undefined as number | undefined,
        lng: undefined as number | undefined,
        rayonKm: 10
    })

    const handleAnalyze = async () => {
        if (!formData.codeNAF || !formData.codePostal) {
            errorToast("Veuillez remplir tous les champs obligatoires")
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/etude-marche/analyse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error("Erreur lors de l'analyse")

            const data = await res.json()
            successToast("Analyse terminée avec succès !")

            // Si on venait d'un prévisionnel, on retourne au prévisionnel avec l'étude affichée
            if (previsionnelId) {
                router.push(`/previsionnel/${previsionnelId}/etude-marche`)
            } else {
                router.push(`/etude-marche/${data.id}`)
            }

        } catch (error) {
            console.error(error)
            errorToast("Une erreur est survenue lors de l'analyse")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nouvelle Étude de Marché</h1>
                <p className="text-muted-foreground mt-2">
                    Définissez votre activité et votre zone d'implantation pour obtenir une analyse détaillée.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Paramètres de l'étude</CardTitle>
                                <CardDescription>Ces informations serviront à identifier vos concurrents et votre clientèle cible.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Activité */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Activité principale (Code NAF)</label>
                            <SelecteurNAF
                                value={formData.codeNAF}
                                onSelect={(value, label) => setFormData({ ...formData, codeNAF: value, libelleNAF: label })}
                            />
                        </div>

                        {/* Localisation */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Adresse d'implantation</label>
                            <AdresseAutocomplete
                                onSelect={(adresse) => setFormData({
                                    ...formData,
                                    adresse: adresse.label,
                                    codePostal: adresse.codePostal,
                                    commune: adresse.commune,
                                    lat: adresse.coordinates[1], // Latitude
                                    lng: adresse.coordinates[0]  // Longitude
                                })}
                            />
                        </div>

                        {/* Rayon */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rayon de chalandise</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[0.3, 0.5, 1, 2, 5, 10, 20].map((km) => (
                                    <Button
                                        key={km}
                                        type="button"
                                        variant={formData.rayonKm === km ? "default" : "outline"}
                                        onClick={() => setFormData({ ...formData, rayonKm: km })}
                                        className="text-sm"
                                    >
                                        {km < 1 ? `${km * 1000} m` : `${km} km`}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.rayonKm < 1 ? "Hyper-proximité" : formData.rayonKm <= 5 ? "Quartier / Ville" : "Zone large"}
                            </p>
                        </div>

                        <Button
                            className="w-full md:w-auto"
                            size="lg"
                            onClick={handleAnalyze}
                            disabled={loading || !formData.codeNAF || !formData.lat}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyse en cours...
                                </>
                            ) : (
                                <>
                                    Lancer l'analyse
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
