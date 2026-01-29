import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export function Footer() {
    const navigation = {
        product: [
            { name: 'Compte de Resultat', href: '/previsionnel/nouveau' },
            { name: 'Bilan Previsionnel', href: '/previsionnel/nouveau' },
            { name: 'Plan de Tresorerie', href: '/previsionnel/nouveau' },
            { name: 'Declaration 2035', href: '/previsionnel/nouveau' },
        ],
        resources: [
            { name: 'Documentation', href: '#' },
            { name: 'Guides', href: '#' },
            { name: 'FAQ', href: '#' },
        ],
        legal: [
            { name: 'Politique de Confidentialite', href: '/politique-confidentialite' },
            { name: 'CGU', href: '/cgu' },
            { name: 'Mentions Legales', href: '#' },
        ],
    }

    return (
        <footer className="border-t border-border bg-card">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-background" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">Expert-Comptable</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Solution de previsionnels comptables aux normes francaises pour entrepreneurs et professionnels.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Produit</h3>
                        <ul className="space-y-3">
                            {navigation.product.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Ressources</h3>
                        <ul className="space-y-3">
                            {navigation.resources.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {navigation.legal.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        {new Date().getFullYear()} Expert-Comptable. Tous droits reserves.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link
                            href="mailto:contact@expert-comptable.app"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            contact@expert-comptable.app
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
