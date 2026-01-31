import Link from 'next/link'
import { ArrowLeft, Shield, Lock, EyeOff, Server } from 'lucide-react'

export const metadata = {
    title: 'Politique de Confidentialité | Expert-Financement',
    description: 'Engagement de confidentialité et protection des données personnelles.',
}

export default function PolitiqueConfidentialite() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à l'accueil
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#1e3a5f] p-8 sm:p-12 text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
                        </div>
                        <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                            La protection de vos données financières et stratégiques est notre priorité absolue.
                            Nous garantissons une confidentialité totale : vos données ne sont ni partagées, ni vendues.
                        </p>
                    </div>

                    <div className="p-8 sm:p-12 space-y-12">
                        {/* Engagement Fort */}
                        <section className="bg-blue-50/50 border border-blue-100 rounded-xl p-8">
                            <h2 className="text-xl font-bold text-[#1e3a5f] flex items-center gap-3 mb-4">
                                <EyeOff className="h-5 w-5" />
                                Notre Engagement Fondamental
                            </h2>
                            <p className="text-gray-700 leading-relaxed font-medium">
                                Expert-Financement s'engage formellement à ce que **vos données ne soient jamais communiquées, échangées ou vendues à des tiers**.
                                Aucune entreprise partenaire, banque ou démarcheur commercial n'a accès à vos informations financières.
                                Vous restez le seul propriétaire et maître de vos données.
                            </p>
                        </section>

                        <div className="prose prose-slate max-w-none text-gray-600">
                            <h3>1. Collecte et Minimisation</h3>
                            <p>
                                Nous ne collectons que les données strictement nécessaires au fonctionnement de l'outil de création de dossiers financiers :
                            </p>
                            <ul>
                                <li><strong>Identité</strong> : Email et nom (gestion de compte).</li>
                                <li><strong>Données Métier</strong> : Chiffres clés, hypothèses et textes saisis dans vos dossiers.</li>
                            </ul>
                            <p>Nous ne collectons aucune donnée sensible (santé, opinions, etc.) ni aucune donnée bancaire directe (pas de connexion aux comptes bancaires).</p>

                            <h3>2. Finalités du Traitement</h3>
                            <p>Vos données sont traitées uniquement pour :</p>
                            <ul>
                                <li>Générer vos documents (Business Plan, Prévisionnels) au format PDF/Excel.</li>
                                <li>Vous permettre de retrouver vos dossiers lors de vos prochaines connexions.</li>
                                <li>Assurer la sécurité de votre compte.</li>
                            </ul>

                            <h3>3. Hébergement et Sécurité</h3>
                            <p>
                                Vos données sont hébergées sur des serveurs sécurisés situés en Europe (ou bénéficiant de clauses de protection équivalentes).
                                Nous appliquons des protocoles de sécurité stricts :
                            </p>
                            <ul className="not-prose grid sm:grid-cols-2 gap-4 my-6">
                                <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                                    <Lock className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">Chiffrement SSL (HTTPS)</span>
                                </li>
                                <li className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                                    <Server className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">Base de données isolée</span>
                                </li>
                            </ul>

                            <h3>4. Vos Droits (RGPD)</h3>
                            <p>
                                Conformément au Règlement Général sur la Protection des Données, vous disposez d'un droit d'accès, de rectification et d'effacement total de vos données.
                                Vous pouvez exercer ce droit à tout moment via votre espace client ou en contactant notre DPO :
                                <a href="mailto:dpo@expert-financement.app" className="text-[#1e3a5f] font-medium ml-1">dpo@expert-financement.app</a>.
                            </p>

                            <h3>5. Cookies et Traceurs</h3>
                            <p>
                                Nous n'utilisons aucun cookie publicitaire. Seuls des cookies techniques essentiels au maintien de votre session de connexion sont déposés.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
