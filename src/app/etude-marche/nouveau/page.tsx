'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { SelecteurNAF } from '@/components/etude-marche/SelecteurNAF'
import { AdresseAutocomplete } from '@/components/etude-marche/AdresseAutocomplete'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Select } from '@/components/ui/Select'

export default function NouvelleEtudePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        codeNAF: '',
        libelleNAF: '',
        adresse: '',
        codePostal: '',
        commune: '',
        rayonKm: '10'
    })

    const handleSubmit = async () => {
        if (!formData.codeNAF || !formData.codePostal) return

        setLoading(true)
        try {
            // Appel à l'API d'analyse
            const response = await fetch('/api/etude-marche/analyse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codeNAF: formData.codeNAF,
                    codePostal: formData.codePostal,
                    rayonKm: parseInt(formData.rayonKm)
                })
            })

            if (!response.ok) throw new Error('Erreur analyse')

            const data = await response.json()

            // Pour le MVP, on passe les résultats via le localStorage ou URL
            // car on n'a pas encore implémenté la persistance BDD complète avec ID
            // Dans une vraie app, l'API retournerait l'ID de l'étude créée

            // Simuler un ID
            const tempId = Date.now().toString()
            localStorage.setItem(`etude_${tempId}`, JSON.stringify({
                ...formData,
                ...data
            }))

            router.push(`/etude-marche/${tempId}`)

        } catch (error) {
            console.error(error)
            alert('Une erreur est survenue lors de l\'analyse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/etude-marche">
                    <Button variant="ghost" size="sm" className="w-9 px-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nouvelle Étude</h1>
                    <p className="text-muted-foreground">
                        Définissez votre activité et votre zone pour lancer l&apos;analyse
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Paramètres de l&apos;étude</CardTitle>
                    <CardDescription>
                        Renseignez les informations clés de votre projet
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Activité (Code NAF)</label>
                        <SelecteurNAF
                            value={formData.codeNAF}
                            onSelect={(val, label) => setFormData({ ...formData, codeNAF: val, libelleNAF: label })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Adresse d&apos;implantation</label>
                        <AdresseAutocomplete
                            onSelect={(addr) => setFormData({
                                ...formData,
                                adresse: addr.label,
                                codePostal: addr.codePostal,
                                commune: addr.commune
                            })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Select
                            label="Rayon d'analyse"
                            options={[
                                { value: "5", label: "5 km (Quartier)" },
                                { value: "10", label: "10 km (Ville)" },
                                { value: "20", label: "20 km (Agglomération)" },
                                { value: "50", label: "50 km (Région)" },
                            ]}
                            value={formData.rayonKm}
                            onChange={(e) => setFormData({ ...formData, rayonKm: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!formData.codeNAF || !formData.codePostal || loading}
                            className="w-full md:w-auto"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lancer l&apos;analyse du marché
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
