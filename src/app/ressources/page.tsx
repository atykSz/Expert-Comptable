'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Lightbulb, FileText, CheckSquare, GraduationCap, Calculator, PieChart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

// Composant Sidebar pour la documentation
function DocSidebar() {
    const items = [
        { title: "Vue d'ensemble", href: "/ressources", icon: BookOpen },
        { title: "Comprendre le prévisionnel", href: "/ressources/comprendre-previsionnel", icon: GraduationCap },
        { title: "Professions Libérales (BNC)", href: "/ressources/professions-liberales", icon: Lightbulb },
        { title: "Guide TVA & BNC", href: "/ressources/tva-bnc", icon: Calculator },
        { title: "Checklist des charges", href: "/ressources/checklist-charges", icon: CheckSquare },
    ]

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen p-5 hidden md:block shrink-0 sticky top-0 h-screen">
            <Link href="/" className="flex items-center gap-2.5 mb-8 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium text-sm">Retour à l'accueil</span>
            </Link>

            <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight px-3 mb-1">Ressources</h2>
                <p className="text-sm text-muted-foreground px-3">Centre de documentation</p>
            </div>

            <nav className="space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    )
}

export default function RessourcesPage() {
    const guides = [
        {
            title: "Comprendre le Prévisionnel",
            description: "Découvrez pourquoi et comment construire un prévisionnel financier solide sur 3 ans.",
            href: "/ressources/comprendre-previsionnel",
            icon: GraduationCap,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Spécificités Professions Libérales",
            description: "Tout savoir sur le régime BNC : comptabilité de trésorerie, charges sociales et fiscalité.",
            href: "/ressources/professions-liberales",
            icon: Lightbulb,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10"
        },
        {
            title: "Guide TVA & BNC",
            description: "Votre activité est-elle soumise à la TVA ? Tableau récapitulatif par profession.",
            href: "/ressources/tva-bnc",
            icon: Calculator,
            color: "text-green-500",
            bgColor: "bg-green-500/10"
        },
        {
            title: "Checklist des Charges",
            description: "La liste exhaustive des dépenses professionnelles à ne pas oublier dans votre budget.",
            href: "/ressources/checklist-charges",
            icon: CheckSquare,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10"
        }
    ]

    return (
        <>
            <DocSidebar />
            <main className="flex-1 p-8 max-w-5xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Centre de Ressources</h1>
                    <p className="text-muted-foreground text-lg">
                        Guides pratiques et outils pour réussir votre installation et votre gestion
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {guides.map((guide, idx) => (
                        <Link key={idx} href={guide.href}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border/50 hover:border-border">
                                <CardHeader className="flex flex-row gap-4 space-y-0">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${guide.bgColor}`}>
                                        <guide.icon className={`h-6 w-6 ${guide.color}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl mb-2">{guide.title}</CardTitle>
                                        <CardDescription className="text-base leading-relaxed">
                                            {guide.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 bg-secondary/30 rounded-2xl p-8 border border-border">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Besoin d'aide pour démarrer ?</h2>
                            <p className="text-muted-foreground mb-4 max-w-2xl">
                                Notre assistant de création vous guide étape par étape pour construire votre premier prévisionnel
                                adapté à votre statut juridique.
                            </p>
                            <Link href="/previsionnel/nouveau">
                                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                                    Créer mon prévisionnel
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
