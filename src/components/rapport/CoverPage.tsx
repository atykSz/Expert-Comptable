'use client'

import { BarChart3 } from 'lucide-react'

interface CoverPageProps {
    entreprise: {
        raisonSociale: string
        formeJuridique: string
        secteurActivite: string
    }
    previsionnel: {
        titre: string
        dateDebut: string
        duree: number
        dateGeneration: string
    }
}

export function CoverPage({ entreprise, previsionnel }: CoverPageProps) {
    return (
        <div className="page-break-after-always min-h-[800px] flex flex-col bg-gradient-to-b from-[#1e3a5f] to-[#0f1f35] text-white rounded-xl overflow-hidden print:rounded-none print:min-h-screen">
            {/* Header Pattern */}
            <div className="relative flex-1 flex flex-col justify-center items-center p-12">
                {/* Decorative hexagon pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="hexagons" width="10" height="10" patternUnits="userSpaceOnUse">
                            <polygon points="5,0 10,2.5 10,7.5 5,10 0,7.5 0,2.5" fill="none" stroke="white" strokeWidth="0.2" />
                        </pattern>
                        <rect width="100" height="100" fill="url(#hexagons)" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="relative z-10 mb-8">
                    <div className="w-24 h-24 bg-[#c9a227] rounded-2xl flex items-center justify-center shadow-2xl">
                        <BarChart3 className="w-12 h-12 text-[#1e3a5f]" />
                    </div>
                </div>

                {/* Main Title */}
                <div className="relative z-10 text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-wide mb-4">
                        PRÉVISIONNEL FINANCIER
                    </h1>
                    <div className="w-32 h-1 bg-[#c9a227] mx-auto rounded-full" />
                </div>

                {/* Company Info */}
                <div className="relative z-10 text-center">
                    <h2 className="text-2xl md:text-3xl font-semibold text-[#c9a227] mb-2">
                        {entreprise.raisonSociale}
                    </h2>
                    <p className="text-lg text-white/70">
                        {entreprise.formeJuridique} • {entreprise.secteurActivite}
                    </p>
                </div>
            </div>

            {/* Footer - White section */}
            <div className="bg-white text-[#1e3a5f] px-12 py-10">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Exercice</p>
                        <p className="text-2xl font-bold">{previsionnel.titre}</p>
                        <p className="text-gray-600">{previsionnel.duree} mois à partir du {previsionnel.dateDebut}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Document Confidentiel</p>
                        <p className="text-gray-600">Édité le {previsionnel.dateGeneration}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
