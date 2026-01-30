'use client'

import { DocSidebar } from '../sidebar'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui'
import { Info, Banknote, Landmark, FileCheck } from 'lucide-react'

export default function ProfessionsLiberalesPage() {
    return (
        <>
            <DocSidebar />
            <main className="flex-1 p-8 max-w-4xl mx-auto overflow-y-auto">
                <div className="mb-8">
                    <Badge variant="outline" className="mb-2 bg-purple-50 text-purple-700 border-purple-200">Statut Juridique</Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">Spécificités Professions Libérales (BNC)</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Médecins, consultants, architectes, avocats... Vous relevez souvent du régime des Bénéfices Non Commerciaux.
                        Voici ce qui change pour votre prévisionnel.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Section 1 : Compta de trésorerie */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-purple-600" />
                                Comptabilité de Trésorerie
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                À la différence des sociétés commerciales (SARL, SAS) qui fonctionnent en comptabilité d'engagement (créances-dettes),
                                les BNC fonctionnent généralement en <strong>comptabilité de trésorerie</strong>.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 my-4">
                                <div className="border border-border p-4 rounded-lg bg-card">
                                    <div className="text-sm font-semibold text-muted-foreground uppercase mb-2">Recettes</div>
                                    <p className="text-sm">On comptabilise uniquement ce qui est <strong>encaissé</strong> sur le compte bancaire au 31/12.</p>
                                </div>
                                <div className="border border-border p-4 rounded-lg bg-card">
                                    <div className="text-sm font-semibold text-muted-foreground uppercase mb-2">Dépenses</div>
                                    <p className="text-sm">On comptabilise uniquement ce qui est <strong>payé</strong> (chèque débité, virement parti) au 31/12.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>Conséquence pour le prévisionnel : les délais de paiement clients ont un impact direct sur votre bénéfice imposable, pas seulement sur votre trésorerie.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2 : Charges Sociales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-blue-600" />
                                Les Charges Sociales (TNS)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                En entreprise individuelle (EI) ou en SELARL (gérant majoritaire), vous êtes <strong>TNS (Travailleur Non Salarié)</strong>.
                                Vous ne payez pas de "charges patronales" sur un salaire, mais des cotisations sociales personnelles sur votre bénéfice.
                            </p>

                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Les principaux organismes :</h4>
                                <ul className="grid gap-2 sm:grid-cols-2">
                                    <li className="flex items-center gap-2 p-2 border rounded bg-slate-50">
                                        <span className="font-bold text-blue-700">URSSAF</span>
                                        <span className="text-sm">Maladie, Alloc. familiales, CSG/CRDS</span>
                                    </li>
                                    <li className="flex items-center gap-2 p-2 border rounded bg-slate-50">
                                        <span className="font-bold text-blue-700">CARMF/CIPAV/CNBF...</span>
                                        <span className="text-sm">Caisse de Retraite spécifique</span>
                                    </li>
                                </ul>
                            </div>

                            <p className="text-sm mt-2">
                                <strong>Règle d'or :</strong> Comptez environ <strong>45%</strong> de votre bénéfice net en charges sociales.
                                Attention au décalage : les premières années sont au forfait (faible), suivi d'une régularisation importante en N+2.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 3 : AGA */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-green-600" />
                                Adhésion à une AGA (facultatif mais utile)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">
                                Pour les professions libérales, l'adhésion à une <strong>Association de Gestion Agréée (AGA)</strong> permet de bénéficier :
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm marker:text-green-500">
                                <li>D'un contrôle formel de votre comptabilité (réduit le risque fiscal)</li>
                                <li>De formations et de statistiques professionnelles</li>
                                <li>De la dispense de majoration de 25% du bénéfice (selon années et réformes en cours)</li>
                            </ul>
                            <p className="mt-4 text-sm font-medium">Coût moyen à prévoir : 200 € à 300 € / an TTC.</p>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </>
    )
}
