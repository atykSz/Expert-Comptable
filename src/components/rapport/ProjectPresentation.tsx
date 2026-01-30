'use client'

import { Building2, Target, Users, Calendar, MapPin, Briefcase } from 'lucide-react'

interface ProjectPresentationProps {
    entreprise: {
        raisonSociale: string
        formeJuridique: string
        secteurActivite: string
        dateCreation: string
        adresse?: string
        effectif?: number
    }
    projet?: {
        description?: string
        objectifs?: string[]
        marche?: string
    }
}

export function ProjectPresentation({ entreprise, projet }: ProjectPresentationProps) {
    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Présentation du Projet</h2>
                    <p className="text-sm text-muted-foreground">Informations générales sur l'entreprise</p>
                </div>
            </div>

            {/* Company Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Building2 className="h-4 w-4" />
                        Raison sociale
                    </div>
                    <p className="font-semibold text-[#1e3a5f]">{entreprise.raisonSociale}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Briefcase className="h-4 w-4" />
                        Forme juridique
                    </div>
                    <p className="font-semibold text-[#1e3a5f]">{entreprise.formeJuridique}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Target className="h-4 w-4" />
                        Secteur d'activité
                    </div>
                    <p className="font-semibold text-[#1e3a5f]">{entreprise.secteurActivite}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        Date de création
                    </div>
                    <p className="font-semibold text-[#1e3a5f]">{entreprise.dateCreation}</p>
                </div>
                {entreprise.adresse && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <MapPin className="h-4 w-4" />
                            Siège social
                        </div>
                        <p className="font-semibold text-[#1e3a5f]">{entreprise.adresse}</p>
                    </div>
                )}
                {entreprise.effectif && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Users className="h-4 w-4" />
                            Effectif prévu
                        </div>
                        <p className="font-semibold text-[#1e3a5f]">{entreprise.effectif} personne(s)</p>
                    </div>
                )}
            </div>

            {/* Project Description */}
            {projet?.description && (
                <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-[#1e3a5f] mb-3">Description du projet</h3>
                    <p className="text-gray-700 leading-relaxed">{projet.description}</p>
                </div>
            )}

            {/* Objectives */}
            {projet?.objectifs && projet.objectifs.length > 0 && (
                <div className="bg-[#c9a227]/10 border border-[#c9a227]/20 rounded-xl p-6">
                    <h3 className="font-semibold text-[#1e3a5f] mb-3">Objectifs stratégiques</h3>
                    <ul className="space-y-2">
                        {projet.objectifs.map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <div className="w-5 h-5 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs text-white font-bold">{idx + 1}</span>
                                </div>
                                <span className="text-gray-700">{obj}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    )
}
