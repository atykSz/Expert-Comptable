import { getAuthenticatedUser, getUserPrevisionnels } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'
import { PlusCircle, FileSpreadsheet, BookOpen, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { PrevisionnelCard } from '@/components/dashboard/PrevisionnelCard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const authUser = await getAuthenticatedUser()

    if (!authUser) {
        redirect('/login')
    }

    const previsionnels = await getUserPrevisionnels(authUser.prismaUser.cabinetId)
    const userName = authUser.prismaUser.name || authUser.prismaUser.email?.split('@')[0] || 'Client'

    // Déterminer le message de salutation selon l'heure
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* En-tête avec salutation personnalisée */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-8 text-white animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{greeting}, {userName} !</h1>
                        <p className="text-white/80 mt-2">
                            {previsionnels.length === 0
                                ? "Bienvenue. Initiez votre premier dossier de financement pour la banque."
                                : `Vous avez ${previsionnels.length} dossier${previsionnels.length > 1 ? 's' : ''} de financement en cours.`
                            }
                        </p>
                    </div>
                    <Link href="/previsionnel/nouveau">
                        <Button className="bg-white text-[#1e3a5f] hover:bg-white/90 shadow-lg">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nouveau Dossier
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistiques rapides si l'utilisateur a des prévisionnels */}
            {previsionnels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-stagger">
                    <Card className="p-5 border-l-4 border-l-[#1e3a5f] animate-fade-in-up card-hover">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#1e3a5f]/10 rounded-xl">
                                <FileSpreadsheet className="h-6 w-6 text-[#1e3a5f]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{previsionnels.length}</p>
                                <p className="text-sm text-muted-foreground">Dossiers</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-5 border-l-4 border-l-green-500 animate-fade-in-up card-hover">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{previsionnels.filter(p => p.nombreMois >= 36).length}</p>
                                <p className="text-sm text-muted-foreground">Sur 3 ans</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-5 border-l-4 border-l-amber-500 animate-fade-in-up card-hover">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {previsionnels.length > 0
                                        ? new Date(previsionnels[0].dateDebut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                                        : '-'
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground">Dernier projet</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Section titre */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Mes Dossiers de Financement</h2>
                {previsionnels.length > 0 && (
                    <Link href="/ressources" className="text-sm text-[#1e3a5f] hover:underline flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Guides et ressources
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                )}
            </div>

            {previsionnels.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#1e3a5f]/20 to-[#2d5a87]/20 rounded-full flex items-center justify-center mb-6">
                            <FileSpreadsheet className="h-10 w-10 text-[#1e3a5f]" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">Commencer un nouveau dossier</h3>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Créez un dossier complet (Business Plan + Prévisionnel) pour présenter votre projet aux banques.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/previsionnel/nouveau">
                                <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Créer mon Dossier
                                </Button>
                            </Link>
                            <Link href="/ressources/comprendre-previsionnel">
                                <Button variant="outline">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    En savoir plus
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {previsionnels.map((prev) => (
                        <PrevisionnelCard
                            key={prev.id}
                            id={prev.id}
                            titre={prev.titre}
                            description={prev.description}
                            dateDebut={prev.dateDebut}
                            nombreMois={prev.nombreMois}
                            clientName={prev.client?.raisonSociale}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
