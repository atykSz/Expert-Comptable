import { DonneesRapport } from '@/app/previsionnel/[id]/rapport/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TrendingUp, Users, MapPin, Target } from 'lucide-react'

export function EtudeMarcheSection({ donnees }: { donnees: DonneesRapport }) {
    if (!donnees.etudeMarche) return null

    const etude = donnees.etudeMarche

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Étude de Marché</h2>
                    <p className="text-sm text-gray-500">Analyse de la zone d&apos;implantation</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Localisation & Activité
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Adresse</span>
                            <span className="font-semibold text-right max-w-[200px] truncate">{etude.adresse}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Commune</span>
                            <span className="font-semibold">{etude.commune} ({etude.codePostal})</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Activité (NAF)</span>
                            <span className="font-semibold">{etude.codeNAF}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-500">Rayon analysé</span>
                            <span className="font-semibold">{etude.zoneChalandise} km</span>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Concurrence & Potentiel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Concurrents identifiés</span>
                            <span className="font-semibold">{etude.nbConcurrents}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Population de la zone</span>
                            <span className="font-semibold">{etude.population.toLocaleString()} hab.</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Densité concurrentielle</span>
                            <span className="font-semibold">
                                {etude.nbConcurrents > 0
                                    ? Math.round(etude.population / etude.nbConcurrents).toLocaleString() + ' hab/conc.'
                                    : 'N/A'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-500">Potentiel du marché</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${etude.potentielMarche === 'FORT' ? 'bg-green-100 text-green-700' :
                                    etude.potentielMarche === 'FAIBLE' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                {etude.potentielMarche}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 bg-[#1e3a5f]/5 rounded-xl p-4 text-sm text-gray-700">
                <Target className="h-4 w-4 inline-block mr-2 text-[#1e3a5f]" />
                L&apos;analyse de marché montre un potentiel <strong>{etude.potentielMarche.toLowerCase()}</strong> sur la zone de {etude.commune}.
                {etude.nbConcurrents > 0 ? ` Avec ${etude.nbConcurrents} concurrents directs, il est essentiel de se différencier.` : ' Aucune concurrence directe identifiée dans le rayon sélectionné.'}
            </div>
        </section>
    )
}
