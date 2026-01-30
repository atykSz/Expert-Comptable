'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Lightbulb, CheckSquare, GraduationCap, Calculator } from 'lucide-react'

// Composant Sidebar réutilisable (à extraire idéalement dans un composant partagé)
export function DocSidebar() {
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
