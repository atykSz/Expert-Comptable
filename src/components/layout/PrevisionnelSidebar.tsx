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
    BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui'

export function PrevisionnelSidebar({ previsionnelId }: { previsionnelId: string }) {
    const pathname = usePathname()

    const navItems = [
        { href: `/previsionnel/${previsionnelId}/dashboard`, label: 'Tableau de Bord', icon: BarChart3 },
        { href: `/previsionnel/${previsionnelId}/compte-resultat`, label: 'Compte de Résultat', icon: FileSpreadsheet },
        { href: `/previsionnel/${previsionnelId}/investissements`, label: 'Investissements', icon: Building },
        { href: `/previsionnel/${previsionnelId}/bilan`, label: 'Bilan Prévisionnel', icon: Calculator },
        { href: `/previsionnel/${previsionnelId}/financement`, label: 'Plan de Financement', icon: TrendingUp },
        { href: `/previsionnel/${previsionnelId}/tresorerie`, label: 'Plan de Trésorerie', icon: PiggyBank },
    ]

    // Determine active item
    const isActive = (href: string) => pathname?.startsWith(href)

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen p-5 shrink-0 hidden md:block sticky top-0 h-screen overflow-y-auto">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-background" />
                </div>
                <span className="font-semibold tracking-tight">Expert-Comptable</span>
            </Link>

            <nav className="space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive(item.href)
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Documents & Export */}
            <div className="mt-8 pt-8 border-t border-border">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Documents</div>
                <div className="space-y-2">
                    <Link href={`/previsionnel/${previsionnelId}/rapport`}>
                        <Button variant="default" size="sm" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Rapport complet
                        </Button>
                    </Link>
                    <a href={`/api/export/excel?id=${previsionnelId}`} download>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                            <Table className="h-4 w-4 mr-2" />
                            Export Excel
                        </Button>
                    </a>
                </div>

                {/* Aide Expert */}
                <div className="mt-8">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Aide Expert</div>
                    <Link href="/ressources" target="_blank">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Documentation
                        </Button>
                    </Link>
                </div>
            </div>
        </aside>
    )
}
