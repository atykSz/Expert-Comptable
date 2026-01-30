'use client'

import { DocSidebar } from '../sidebar'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { Lightbulb, Target, TrendingUp, AlertTriangle } from 'lucide-react'

export default function ComprendrePrevisionnelPage() {
    return (
        <>
            <DocSidebar />
            <main className="flex-1 p-8 max-w-4xl mx-auto overflow-y-auto">
                <div className="mb-8">
                    <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">Fondamentaux</Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">Comprendre le Prévisionnel</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Le prévisionnel financier n'est pas qu'un document administratif pour la banque.
                        C'est la feuille de route financière de votre projet.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Section 1 : C'est quoi ? */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-blue-600" />
                                Qu'est-ce qu'un prévisionnel ?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Le prévisionnel financier est un ensemble de tableaux qui traduisent votre projet en chiffres.
                                Il permet de vérifier la viabilité économique de votre future entreprise.
                            </p>
                            <p>Il répond à 3 questions fondamentales :</p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
                                <li><strong>Mon activité sera-t-elle rentable ?</strong> (Compte de résultat)</li>
                                <li><strong>Mon projet est-il finançable ?</strong> (Plan de financement)</li>
                                <li><strong>Aurai-je assez d'argent pour payer mes factures ?</strong> (Plan de trésorerie)</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Section 2 : Pourquoi 3 ans ? */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-amber-600" />
                                Pourquoi un horizon de 3 ans ?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                La règle standard est d'établir des prévisions sur 3 exercices comptables (souvent 36 mois).
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 mt-4">
                                <div className="bg-secondary/30 p-4 rounded-lg">
                                    <div className="font-semibold mb-1">Année 1</div>
                                    <div className="text-sm text-muted-foreground">Lancement et montée en charge progressive. Souvent déficitaire ou à l'équilibre.</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg">
                                    <div className="font-semibold mb-1">Année 2</div>
                                    <div className="text-sm text-muted-foreground">Année de "croisière". L'activité atteint son rythme normal.</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-lg">
                                    <div className="font-semibold mb-1">Année 3</div>
                                    <div className="text-sm text-muted-foreground">Consolidation et développement. Renouvellement de matériel possible.</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3 : Pièges à éviter */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-800 mb-3">
                            <AlertTriangle className="h-5 w-5" />
                            Les pièges fréquents
                        </h3>
                        <ul className="space-y-2 text-amber-900">
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <div>Sous-estimer les délais de paiement clients (BFR).</div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <div>Oublier la TVA à décaisser (décalage de trésorerie).</div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <div>Être trop optimiste sur le Chiffre d'Affaires de la 1ère année.</div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <div>Oublier les régularisations de charges sociales (pour les TNS).</div>
                            </li>
                        </ul>
                    </div>

                    {/* Conseil Expert */}
                    <div className="bg-blue-900 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-800 p-2 rounded-lg">
                                <Lightbulb className="h-6 w-6 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Le conseil de l'Expert-Comptable</h3>
                                <p className="text-blue-100 leading-relaxed">
                                    Ne cherchez pas à "faire plaisir" au banquier en gonflant les chiffres.
                                    Un prévisionnel réaliste, voire prudent, inspirera beaucoup plus confiance qu'un
                                    tableau excel aux courbes exponentielles injustifiées. Prévoyez toujours une
                                    marge de sécurité en trésorerie.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
