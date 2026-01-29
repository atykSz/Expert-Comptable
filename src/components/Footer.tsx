import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        <span className="font-semibold text-gray-900">Expert-Comptable</span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link
                            href="/politique-confidentialite"
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Politique de Confidentialité
                        </Link>
                        <Link
                            href="/cgu"
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            CGU
                        </Link>
                        <Link
                            href="mailto:contact@expert-comptable.app"
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Contact
                        </Link>
                    </nav>

                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Expert-Comptable
                    </div>
                </div>
            </div>
        </footer>
    )
}
