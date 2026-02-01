import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui'
import { PlusCircle, TrendingUp, Info } from 'lucide-react'
import Link from 'next/link'
import { EtudeResultats } from '@/components/etude-marche/EtudeResultats'
import { Card, CardContent } from '@/components/ui/Card'

export default async function PrevisionnelEtudePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const authUser = await getAuthenticatedUser()
    if (!authUser) redirect('/login')

    const { id } = await params

    // Fetch prévisionnel et étude(s) liée(s)
    const previsionnel = await prisma.previsionnel.findUnique({
        where: { id },
        include: {
            etudes: {
                orderBy: { dateAnalyse: 'desc' },
                take: 1
            }
        }
    })

    if (!previsionnel) {
        return <div className="p-8">Prévisionnel introuvable</div>
    }

    const etude = previsionnel.etudes[0]

    if (!etude) {
        return (
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Étude de Marché</h1>
                </div>

                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-6">
                            <TrendingUp className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Aucune étude associée</h3>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Réalisez une étude de marché pour ce projet afin d'analyser la concurrence
                            et valider vos hypothèses de chiffre d'affaires.
                        </p>
                        <Link href={`/etude-marche/nouveau?previsionnelId=${id}`}>
                            <Button size="lg">
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Lancer une étude de marché
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-700">
                    <Info className="h-5 w-5 shrink-0" />
                    <p>
                        L'étude de marché vous permet d'obtenir des données précises sur les concurrents (CA, résultat)
                        et la population locale pour affiner votre Business Plan.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Étude de Marché</h1>
                <Link href={`/etude-marche/nouveau?previsionnelId=${id}`}>
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouvelle analyse
                    </Button>
                </Link>
            </div>

            <EtudeResultats etude={etude} />
        </div>
    )
}
