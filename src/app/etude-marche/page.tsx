'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { PlusCircle, Search, TrendingUp, Store, Users, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/Input'

export default function EtudeMarchePage() {
    // Dans une version réelle, on récupérerait la liste des études depuis la BDD
    // Pour le MVP, on affiche l'état vide ou une liste simulée
    const etudes = [] as any[] // Placeholder

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Étude de Marché</h1>
                    <p className="text-muted-foreground mt-2">
                        Analysez votre zone de chalandise et évaluez la concurrence en quelques clics.
                    </p>
                </div>
                <Link href="/etude-marche/nouveau">
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Nouvelle Étude
                    </Button>
                </Link>
            </div>

            {etudes.length === 0 ? (
                <Card className="border-dashed bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucune étude de marché</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Commencez par créer votre première étude pour obtenir des données précieuses sur votre futur emplacement.
                        </p>
                        <Link href="/etude-marche/nouveau">
                            <Button>Lancer une analyse</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Liste des études */}
                    {etudes.map((etude) => (
                        <Card key={etude.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-lg">{etude.libelleNAF}</CardTitle>
                                <CardDescription>{etude.commune} ({etude.codePostal})</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Store className="h-4 w-4" />
                                        <span>{etude.nbConcurrents} concurrents</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{etude.populationZone.toLocaleString()} habitants</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground pt-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(etude.dateAnalyse).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Store className="h-5 w-5 text-blue-600" />
                            Analyse de la Concurrence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Identifiez tous les établissements concurrents dans votre zone (5 à 50km).
                        Visualisez leur ancienneté et leur taille.
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50/50 border-indigo-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-5 w-5 text-indigo-600" />
                            Données Démographiques
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Accédez aux données de l&apos;INSEE sur la population locale : revenus, catégories socio-professionnelles, âges.
                    </CardContent>
                </Card>
                <Card className="bg-green-50/50 border-green-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Potentiel de Marché
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Obtenez un score de potentiel calculé automatiquement en croisant offre et demande locale.
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
