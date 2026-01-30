'use client'

import { DocSidebar } from '../sidebar'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { CheckCircle, XCircle, Calculator, Info } from 'lucide-react'

export default function TvaBncPage() {
    const activites = [
        {
            secteur: "Santé",
            exemples: "Médecin, Dentiste, Infirmier, Kiné, Sage-femme",
            tva: false,
            details: "Exonération de TVA pour les soins aux personnes."
        },
        {
            secteur: "Juridique",
            exemples: "Avocat, Notaire, Huissier",
            tva: true,
            details: "Soumis à la TVA (20%) sauf si franchise en base."
        },
        {
            secteur: "Technique / Conseil",
            exemples: "Consultant, Architecte, Ingénieur, Développeur freelance",
            tva: true,
            details: "Soumis à la TVA (20%) sauf si franchise en base."
        },
        {
            secteur: "Enseignement",
            exemples: "Professeur particulier (indépendant)",
            tva: false,
            details: "Exonération possible sous conditions strictes (dispense de cours dans le cadre scolaire/universitaire)."
        },
        {
            secteur: "Artistique",
            exemples: "Auteur, Compositeur",
            tva: true,
            details: "Souvent taux réduit (10%) ou retenue à la source spécifique. Franchise possible."
        }
    ]

    return (
        <>
            <DocSidebar />
            <main className="flex-1 p-8 max-w-4xl mx-auto overflow-y-auto">
                <div className="mb-8">
                    <Badge variant="outline" className="mb-2 bg-green-50 text-green-700 border-green-200">Fiscalité</Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">TVA & Professions Libérales</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Le principe est simple : tout le monde est assujetti à la TVA, sauf exonération spécifique par la loi (notamment la Santé).
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Section 1 : La Franchise en Base */}
                    <Card className="bg-green-50/50 border-green-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <Info className="h-5 w-5" />
                                Le Joker : La Franchise en Base de TVA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-green-900">
                            <p className="mb-3">
                                Même si votre activité est théoriquement soumise à la TVA, vous pouvez être <strong>exonéré</strong> si votre chiffre d'affaires est faible.
                            </p>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <span className="font-semibold block mb-1">Seuils 2025 (pour prestation de services) :</span>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>En dessous de <strong>36 800 €</strong> de CA : Pas de TVA à facturer (mention "TVA non applicable, art. 293 B du CGI").</li>
                                    <li>Attention : En contrepartie, vous ne pouvez pas récupérer la TVA sur vos achats.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2 : Tableau des activités */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-gray-600" />
                                Tableau récapitulatif par activité
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-border">
                                <table className="w-full text-sm">
                                    <thead className="bg-secondary/50">
                                        <tr>
                                            <th className="p-3 text-left font-medium">Secteur</th>
                                            <th className="p-3 text-left font-medium">Exemples</th>
                                            <th className="p-3 text-center font-medium w-32">Assujetti TVA ?</th>
                                            <th className="p-3 text-left font-medium">Détails</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {activites.map((act, i) => (
                                            <tr key={i} className="hover:bg-secondary/20">
                                                <td className="p-3 font-medium">{act.secteur}</td>
                                                <td className="p-3 text-muted-foreground">{act.exemples}</td>
                                                <td className="p-3 text-center">
                                                    {act.tva ? (
                                                        <div className="inline-flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-full text-xs">
                                                            <CheckCircle className="h-3 w-3" /> OUI
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1 text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full text-xs">
                                                            <XCircle className="h-3 w-3" /> NON
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-muted-foreground italic">{act.details}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                * Ce tableau est indicatif. Le régime fiscal réel dépend de votre situation précise. Consultez votre expert-comptable pour confirmation.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}
