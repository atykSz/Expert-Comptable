import { getAuthenticatedUser, getUserPrevisionnels } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { PlusCircle, FileSpreadsheet, Calendar, ArrowRight, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const authUser = await getAuthenticatedUser()

    if (!authUser) {
        redirect('/login')
    }

    const previsionnels = await getUserPrevisionnels(authUser.prismaUser.cabinetId)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mon Espace</h1>
                    <p className="text-muted-foreground mt-1">
                        Bienvenue, {authUser.prismaUser.name || authUser.prismaUser.email}
                    </p>
                </div>
                <Link href="/previsionnel/nouveau">
                    <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouveau Prévisionnel
                    </Button>
                </Link>
            </div>

            {previsionnels.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-blue-100/50 rounded-full flex items-center justify-center mb-4">
                            <FileSpreadsheet className="h-8 w-8 text-[#1e3a5f]" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Aucun prévisionnel</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Vous n'avez pas encore créé de prévisionnel. Commencez dès maintenant votre premier projet.
                        </p>
                        <Link href="/previsionnel/nouveau">
                            <Button>Créer mon premier prévisionnel</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {previsionnels.map((prev) => (
                        <Link key={prev.id} href={`/previsionnel/${prev.id}/dashboard`} className="group">
                            <Card className="h-full transition-all hover:shadow-md border-gray-200 group-hover:border-[#1e3a5f]/50">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-blue-50 rounded-lg text-[#1e3a5f] group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        {prev.client && (
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                                {prev.client.raisonSociale}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="mt-4 text-lg font-semibold line-clamp-1 group-hover:text-[#1e3a5f] transition-colors">
                                        {prev.titre}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {prev.description || "Aucune description"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{new Date(prev.dateDebut).getFullYear()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{prev.nombreMois} mois</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm font-medium text-[#1e3a5f]">
                                        Accéder au tableau de bord
                                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
