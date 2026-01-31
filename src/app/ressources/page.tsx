'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Calculator, CheckSquare, GraduationCap, Lightbulb, FileText, PieChart, Landmark, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui'

function DocSidebar() {
    const categories = [
        {
            title: "Guides Pratiques",
            items: [
                { title: "Vue d'ensemble", href: "/ressources", icon: BookOpen },
                { title: "Comprendre le prévisionnel", href: "/ressources/comprendre-previsionnel", icon: GraduationCap },
            ]
        },
        {
            title: "Outils & Checklists",
            items: [
                { title: "Checklist des charges", href: "/ressources/checklist-charges", icon: CheckSquare },
                { title: "Guide TVA & BNC", href: "/ressources/tva-bnc", icon: Calculator },
            ]
        },
        {
            title: "Dossiers Spéciaux",
            items: [
                { title: "Professions Libérales", href: "/ressources/professions-liberales", icon: Lightbulb },
            ]
        }
    ]

    return (
        <aside className="w-72 bg-slate-50 border-r border-slate-200 min-h-screen p-6 hidden lg:block shrink-0 sticky top-0 h-screen overflow-y-auto">
            <Link href="/" className="flex items-center gap-2 mb-10 text-slate-600 hover:text-slate-900 transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Retour à l'accueil</span>
            </Link>

            <div className="mb-8">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Centre de Ressources
                </h2>
                <p className="text-sm text-slate-500 mt-1">Documentation & Conseils</p>
            </div>

            <nav className="space-y-8">
                {categories.map((cat, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
                            {cat.title}
                        </h3>
                        <div className="space-y-1">
                            {cat.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{item.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    )
}

export default function RessourcesPage() {
    return (
        <div className="flex bg-white min-h-screen">
            <DocSidebar />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-[#1e3a5f] text-white py-16 px-8 sm:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-sm font-medium mb-6">
                            <GraduationCap className="h-4 w-4" />
                            Académie Expert-Financement
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                            Boostez vos chances d'obtenir un financement
                        </h1>
                        <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                            Parce qu'un bon dossier ne suffit pas toujours, découvrez nos conseils d'experts pour structurer votre démarche et convaincre vos interlocuteurs bancaires.
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-8 sm:px-12 py-12 space-y-16">

                    {/* Section 1: Fondamentaux */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            Les Fondamentaux du Dossier
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Link href="/ressources/comprendre-previsionnel">
                                <Card className="h-full hover:shadow-lg transition-all border-slate-200 cursor-pointer group">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-blue-600 group-hover:underline decoration-2 underline-offset-4">
                                            Comprendre le Prévisionnel
                                        </CardTitle>
                                        <CardDescription className="mt-2 text-slate-600">
                                            Pourquoi est-ce la pièce maîtresse du dossier ? Apprenez à lire et défendre vos tableaux.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>

                            <Card className="h-full hover:shadow-lg transition-all border-slate-200 bg-slate-50">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg text-slate-900">
                                            Checklist des pièces à fournir
                                        </CardTitle>
                                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md font-medium">Bientôt</span>
                                    </div>
                                    <CardDescription className="mt-2 text-slate-600">
                                        KBIS, statuts, devis... La liste complète pour ne rien oublier le jour J.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </section>

                    {/* Section 2: Convaincre la Banque */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Landmark className="h-5 w-5" />
                            </div>
                            Convaincre la Banque
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                                <h3 className="font-semibold text-slate-900 mb-2">L'apport personnel</h3>
                                <p className="text-sm text-slate-600">Combien faut-il mettre sur la table pour être crédible ? (10-20% minimum)</p>
                            </div>
                            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                                <h3 className="font-semibold text-slate-900 mb-2">Les garanties</h3>
                                <p className="text-sm text-slate-600">Caution personnelle, BPI, Nantissement... Comprendre les risques.</p>
                            </div>
                            <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                                <h3 className="font-semibold text-slate-900 mb-2">L'étude de marché</h3>
                                <p className="text-sm text-slate-600">Prouver qu'il y a des clients en face de vos chiffres.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Outils Spécifiques */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <Calculator className="h-5 w-5" />
                            </div>
                            Outils & Guides Métier
                        </h2>
                        <div className="space-y-4">
                            <Link href="/ressources/professions-liberales">
                                <div className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-4 shrink-0">
                                        <Lightbulb className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-900">Guide Spécial Professions Libérales (BNC)</h3>
                                        <p className="text-sm text-slate-500">Spécificités comptables et fiscales des médecins, avocats, consultants...</p>
                                    </div>
                                    <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180" />
                                </div>
                            </Link>

                            <Link href="/ressources/tva-bnc">
                                <div className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-4 shrink-0">
                                        <PieChart className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-900">Comprendre la TVA</h3>
                                        <p className="text-sm text-slate-500">Franchise en base, assujettissement... Tout ce qu'il faut savoir.</p>
                                    </div>
                                    <ArrowLeft className="h-4 w-4 text-slate-400 rotate-180" />
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
