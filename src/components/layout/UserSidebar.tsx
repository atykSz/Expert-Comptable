'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    LayoutDashboard,
    PlusCircle,
    User,
    LogOut
} from 'lucide-react'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function UserSidebar() { // Suppression de { user } car non utilisé pour l'instant
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
        { href: '/previsionnel/nouveau', label: 'Nouveau Projet', icon: PlusCircle },
    ]

    const isActive = (href: string) => pathname === href

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen p-5 shrink-0 hidden md:flex flex-col sticky top-0 h-screen">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-background" />
                </div>
                <span className="font-semibold tracking-tight">Expert-Comptable</span>
            </Link>

            <nav className="space-y-1 flex-1">
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

            <div className="border-t border-border pt-4 mt-auto">
                <Link href="/profile" className="flex items-center gap-3 px-3 py-3 mb-2 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Mon Compte</p>
                    </div>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                </Button>
            </div>
        </aside>
    )
}
