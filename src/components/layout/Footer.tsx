import Link from 'next/link'

export function Footer() {
    return (
        <footer className="py-12 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                            Expert-Comptable
                        </h3>
                        <p className="text-slate-400 max-w-md">
                            Solution SaaS complète pour les experts-comptables.
                            Créez des prévisionnels financiers professionnels conformes aux normes françaises.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Produit</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/previsionnel/nouveau" className="text-slate-400 hover:text-white transition-colors">
                                    Nouveau prévisionnel
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                                    Connexion
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Légal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/politique-confidentialite" className="text-slate-400 hover:text-white transition-colors">
                                    Politique de confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link href="/cgu" className="text-slate-400 hover:text-white transition-colors">
                                    CGU
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Expert-Comptable. Tous droits réservés.
                    </p>
                    <p className="text-slate-500 text-sm">
                        Conforme aux normes <span className="text-blue-400">PCG</span> et <span className="text-purple-400">RGPD</span>
                    </p>
                </div>
            </div>
        </footer>
    )
}
