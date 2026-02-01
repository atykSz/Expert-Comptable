'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    FileSpreadsheet,
    Building,
    Calculator,
    TrendingUp,
    PiggyBank,
    FileText,
    Table,
    BookOpen,
    Sparkles,
    Target,
    ChevronRight,
    ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui'

export function PrevisionnelSidebar({ previsionnelId }: { previsionnelId: string }) {
    const pathname = usePathname()

    const navItems = [
        { href: `/previsionnel/${previsionnelId}/dashboard`, label: 'Tableau de Bord', icon: BarChart3 },
        { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Resultat', icon: FileSpreadsheet },
        { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building },
        { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan Previsionnel', icon: Calculator },
        { href: `/previsionnel/${previsionnelId}/financement`, label: 'Plan de Financement', icon: TrendingUp },
        { href: `/previsionnel/${previsionnelId}/tresorerie`, label: 'Plan de Tresorerie', icon: PiggyBank },
        { href: `/previsionnel/${previsionnelId}/benchmarks`, label: 'Benchmarks', icon: Target },
        { href: `/previsionnel/${previsionnelId}/scenarios`, label: 'Scenarios', icon: Sparkles },
        { href: `/previsionnel/${previsionnelId}/etude-marche`, label: 'Etude de Marche', icon: TrendingUp },
    ]

    const isActive = (href: string) => pathname?.startsWith(href)

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto shrink-0 hidden md:flex">
            {/* Logo */}
            <div className="p-5 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-background" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight">Expert-Financement</span>
                </Link>
            </div>

            {/* Back to dashboard */}
            <div className="px-3 pt-3">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-accent hover:bg-accent/5 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Espace Client
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5">
                <div className="px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Navigation</span>
                </div>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(item.href)
                                ? 'bg-foreground text-background font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {!isActive(item.href) && (
                            <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Documents & Export */}
            <div className="p-3 border-t border-border">
                <div className="px-3 py-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Documents</span>
                </div>
                <div className="space-y-1">
                    <Link href={`/previsionnel/${previsionnelId}/rapport`}>
                        <Button variant="default" size="sm" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Rapport complet
                        </Button>
                    </Link>
                    <a href={`/api/exports/excel/${previsionnelId}`} download>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Table className="h-4 w-4 mr-2" />
                            Export Excel
                        </Button>
                    </a>
                </div>

                {/* Help */}
                <div className="mt-4 pt-4 border-t border-border">
                    <Link href="/ressources" target="_blank">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Documentation
                        </Button>
                    </Link>
                </div>
            </div>
        </aside>
    )
}
