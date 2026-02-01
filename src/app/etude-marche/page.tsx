import Link from 'next/link'
import { Button } from '@/components/ui'
import { PlusCircle, MapPin, TrendingUp, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function EtudeMarcheListPage() {
    const etudes = await prisma.etudeMarche.findMany({
        orderBy: { dateAnalyse: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Étude de Marché</h1>
                    <p className="text-muted-foreground mt-2">
                        Analysez la concurrence et la démographie de votre zone d'implantation.
                    </p>
                </div>
                <Link href="/etude-marche/nouveau">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouvelle Étude
                    </Button>
                </Link>
            </div>

            {etudes.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucune étude réalisée</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Lancez votre première analyse de marché pour identifier vos concurrents
                            et comprendre votre zone de chalandise.
                        </p>
                        <Link href="/etude-marche/nouveau">
                            <Button variant="outline">
                                Commencer une analyse
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {etudes.map((etude) => (
                        <Link key={etude.id} href={`/etude-marche/${etude.id}`}>
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full border-l-4 border-l-primary/50">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg truncate pr-2">{etude.libelleNAF}</CardTitle>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${etude.potentielMarche === 'FORT' ? 'bg-green-100 text-green-700' :
                                            etude.potentielMarche === 'FAIBLE' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {etude.potentielMarche}
                                        </div>
                                    </div>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {etude.commune} ({etude.codePostal})
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{etude.nbConcurrents}</span>
                                            <span className="text-xs">Concurrents</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="font-semibold text-foreground">
                                                {Math.round(etude.ratioHabConcurrent || 0).toLocaleString()}
                                            </span>
                                            <span className="text-xs">Hab/Conc.</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="text-xs text-muted-foreground pt-0 flex gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(etude.dateAnalyse), 'd MMM yyyyy', { locale: fr })}
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
