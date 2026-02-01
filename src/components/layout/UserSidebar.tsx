'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    LayoutDashboard,
    PlusCircle,
    TrendingUp,
    User,
    LogOut,
    ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function UserSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    const navItems = [
        { href: '/dashboard', label: 'Espace Client', icon: LayoutDashboard },
        { href: '/previsionnel/nouveau', label: 'Nouveau Dossier', icon: PlusCircle },
        { href: '/etude-marche', label: 'Etude de Marche', icon: TrendingUp },
    ]

    const isActive = (href: string) => pathname === href

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col sticky top-0 h-screen shrink-0 hidden md:flex">
            {/* Logo */}
            <div className="p-5 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-background" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight">Expert-Financement</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive(item.href)
                                ? 'bg-foreground text-background'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {!isActive(item.href) && (
                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* User section */}
            <div className="p-3 border-t border-border mt-auto">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Mon Compte</p>
                    </div>
                </Link>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-danger hover:bg-danger/5 mt-1"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Deconnexion
                </Button>
            </div>
        </aside>
    )
}
