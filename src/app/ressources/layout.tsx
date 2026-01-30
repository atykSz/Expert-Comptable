import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Ressources & Documentation',
    description: 'Guides et outils pour votre prévisionnel comptable',
}

export default function RessourcesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background">
            {children}
        </div>
    )
}
