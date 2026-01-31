import Link from 'next/link'
import { ArrowLeft, Scale, FileText, AlertTriangle } from 'lucide-react'

export const metadata = {
    title: 'Conditions Générales d\'Utilisation | Expert-Financement',
    description: 'Conditions régissant l\'utilisation de notre service de création de dossiers de financement.',
}

export default function CGU() {
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
                    <div className="bg-slate-900 p-8 sm:p-12 text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Scale className="h-8 w-8" />
                            </div>
                            <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
                        </div>
                        <p className="text-slate-300 text-lg max-w-2xl">
                            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="p-8 sm:p-12 space-y-12">
                        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-5 w-5" />
                                Avertissement Important
                            </h2>
                            <p className="text-amber-900 text-sm leading-relaxed">
                                Expert-Financement est un <strong>outil d'aide à la décision</strong> et de modélisation financière.
                                Bien que conforme aux normes comptables, il ne remplace en aucun cas l'expertise, le conseil et la certification d'un Expert-Comptable diplômé.
                                Les documents générés doivent être validés par un professionnel avant toute démarche officielle.
                            </p>
                        </section>

                        <div className="prose prose-slate max-w-none text-gray-600">
                            <h3>1. Objet du Service</h3>
                            <p>
                                Expert-Financement fournit une solution logicielle en mode SaaS (Software as a Service) permettant aux utilisateurs de créer,
                                éditer et exporter des dossiers financiers (Business Plans, Prévisionnels, Études de marché) destinés à la recherche de financements.
                            </p>

                            <h3>2. Accès et Compte Utilisateur</h3>
                            <p>
                                L'accès aux fonctionnalités de sauvegarde nécessite la création d'un compte utilisateur.
                                L'utilisateur est responsable de la confidentialité de ses identifiants.
                                Toute action effectuée depuis son compte est réputée être de son fait.
                            </p>

                            <h3>3. Propriété Intellectuelle</h3>
                            <ul>
                                <li><strong>Sur l'outil</strong> : Expert-Financement détient l'intégralité des droits de propriété intellectuelle sur la structure, le design, et le code du site.</li>
                                <li><strong>Sur vos données</strong> : Vous conservez la propriété pleine et entière des données que vous saisissez et des dossiers que vous générez. Nous ne revendiquons aucun droit sur vos créations.</li>
                            </ul>

                            <h3>4. Responsabilité</h3>
                            <p>
                                L'éditeur s'efforce de fournir un service disponible 24/7 et des calculs précis. Toutefois :
                            </p>
                            <ul>
                                <li>Nous ne garantissons pas l'obtention d'un financement bancaire (décision souveraine des banques).</li>
                                <li>Nous ne sommes pas responsables des erreurs de saisie de l'utilisateur ou d'une mauvaise interprétation des résultats.</li>
                                <li>En cas d'interruption de service pour maintenance, notre responsabilité ne saurait être engagée.</li>
                            </ul>

                            <h3>5. Tarification et Abonnement</h3>
                            <p>
                                Certaines fonctionnalités peuvent être soumises à un abonnement ou un paiement ponctuel.
                                Les conditions tarifaires sont indiquées clairement avant tout achat. Le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement (art. L221-28 du Code de la consommation).
                            </p>

                            <h3>6. Droit Applicable</h3>
                            <p>
                                Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
