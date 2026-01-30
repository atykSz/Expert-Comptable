import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export function Footer() {
    const navigation = {
        product: [
            { name: 'Nouveau prévisionnel', href: '/previsionnel/nouveau' },
            { name: 'Compte de Résultat', href: '/previsionnel/nouveau' },
            { name: 'Bilan Prévisionnel', href: '/previsionnel/nouveau' },
            { name: 'Plan de Trésorerie', href: '/previsionnel/nouveau' },
            { name: 'Déclaration 2035', href: '/previsionnel/nouveau' },
            { name: 'Connexion', href: '/login' },
        ],
        resources: [
            { name: 'Documentation', href: '/ressources' },
            { name: 'Guides', href: '/ressources' },
            { name: 'FAQ', href: '/ressources/faq' },
        ],
        legal: [
            { name: 'Politique de confidentialité', href: '/politique-confidentialite' },
            { name: 'CGU', href: '/cgu' },
            { name: 'Mentions Légales', href: '#' },
        ],
    }

    return (
        <footer className="py-12 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Expert-Comptable
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Solution SaaS complète pour les experts-comptables. Créez des prévisionnels financiers professionnels conformes aux normes françaises (PCG, 2035).
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Produit</h3>
                        <ul className="space-y-3">
                            {navigation.product.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Ressources</h3>
                        <ul className="space-y-3">
                            {navigation.resources.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Légal</h3>
                        <ul className="space-y-3">
                            {navigation.legal.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Expert-Comptable. Tous droits réservés.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                        <p className="text-slate-500 text-sm">
                            Conforme aux normes <span className="text-blue-400">PCG</span> et <span className="text-purple-400">RGPD</span>
                        </p>
                        <Link
                            href="mailto:contact@expert-comptable.app"
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            contact@expert-comptable.app
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
