'use client'

import { DocSidebar } from '../sidebar'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { CheckSquare, Building, CreditCard, Shield, Users, Truck } from 'lucide-react'

export default function ChecklistChargesPage() {
    return (
        <>
            <DocSidebar />
            <main className="flex-1 p-8 max-w-4xl mx-auto overflow-y-auto">
                <div className="mb-8">
                    <Badge variant="outline" className="mb-2 bg-purple-50 text-purple-700 border-purple-200">Pratique</Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">Checklist des Charges</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Pour un prévisionnel fiable, n'oubliez aucune dépense ! Voici la liste des postes les plus courants.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* LOCAUX */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building className="h-5 w-5 text-gray-500" />
                                Locaux & Bureau
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Loyer professionnel (ou domiciliation)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Charges locatives (entretien, eau...)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Électricité / Chauffage</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Assurance des locaux</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Entretien / Ménage</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* ASSURANCES & BANQUE */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Shield className="h-5 w-5 text-blue-500" />
                                Assurances & Banque
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Responsabilité Civile Pro (RCP) <span className="text-xs text-red-500 font-bold">*OBLIGATOIRE</span></span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Prévoyance "Madelin" (santé/retraite)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Frais de tenue de compte bancaire</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Commissions TPE (carte bancaire)</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* HONORAIRES & SERVICES */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-5 w-5 text-green-500" />
                                Honoraires & Services
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Expert-Comptable</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Adhésion AGA / CGA</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Logiciel métier / SaaS</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Téléphone / Internet</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Publicité / Site web</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* MOBILITÉ & DIVERS */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Truck className="h-5 w-5 text-amber-500" />
                                Mobilité & Divers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Carburant / Péage / Parking</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Entretien véhicule / Assurance auto</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Repas d'affaires / Déplacements</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Fournitures de bureau / Petit matériel</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>CFE (Impôt, minimum ~200€)</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}
