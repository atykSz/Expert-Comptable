import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
    title: 'Politique de Confidentialité | Expert-Comptable',
    description: 'Notre politique de protection des données personnelles conforme au RGPD.',
}

export default function PolitiqueConfidentialite() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à l'accueil
                    </Link>
                </div>

                <div className="bg-white shadow-sm rounded-lg p-8 sm:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Politique de Confidentialité
                    </h1>

                    <div className="prose max-w-none text-gray-600 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Préambule</h2>
                            <p>
                                La présente politique de confidentialité a pour but d'informer les utilisateurs du site
                                Expert-Comptable sur la manière dont leurs données personnelles sont collectées et traitées.
                                Nous accordons une importance capitale au respect de la vie privée et nous nous engageons à
                                respecter les dispositions du Règlement Général sur la Protection des Données (RGPD).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Responsable du traitement</h2>
                            <p>
                                Le responsable du traitement des données est l'éditeur du site Expert-Comptable.
                                <br />
                                Email de contact : contact@expert-comptable.app (exemple)
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Données collectées</h2>
                            <p>
                                Dans le cadre de l'utilisation de notre application, nous sommes amenés à collecter les données suivantes :
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Données d'identité : Nom, Prénom, Email (pour la création de compte).</li>
                                <li>Données financières : Informations saisies dans les prévisionnels (Chiffre d'affaires, charges, etc.).</li>
                                <li>Données de connexion : Logs, adresses IP, type de navigateur (à des fins de sécurité et de statistiques anonymes).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Finalités du traitement</h2>
                            <p>
                                Vos données sont collectées pour les finalités suivantes :
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Gestion de votre compte utilisateur et authentification.</li>
                                <li>Fourniture du service de génération de prévisionnels comptables.</li>
                                <li>Sauvegarde et synchronisation de vos données entre appareils.</li>
                                <li>Amélioration de nos services et support technique.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Base légale</h2>
                            <p>
                                Le traitement de vos données est justifié par :
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>L'exécution du contrat (CGU) lorsque vous utilisez nos services.</li>
                                <li>Votre consentement (pour les cookies optionnels).</li>
                                <li>Notre intérêt légitime (sécurité du site, amélioration du produit).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Durée de conservation</h2>
                            <p>
                                Vos données personnelles sont conservées le temps de l'existence de votre compte.
                                En cas de suppression de compte, vos données sont effacées de nos bases actives sous 30 jours,
                                sauf obligation légale de conservation (ex: facturation).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Partage des données</h2>
                            <p>
                                Vos données sont strictement confidentielles et ne sont jamais vendues à des tiers.
                                Elles peuvent être transmises à nos sous-traitants techniques (hébergement Vercel, base de données Supabase)
                                qui sont tenus aux mêmes obligations de sécurité et de confidentialité.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Vos droits</h2>
                            <p>
                                Conformément au RGPD, vous disposez des droits suivants :
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Droit d'accès, de rectification et d'effacement de vos données.</li>
                                <li>Droit à la limitation du traitement et à la portabilité des données.</li>
                                <li>Droit d'opposition pour motif légitime.</li>
                            </ul>
                            <p className="mt-2">
                                Pour exercer ces droits, vous pouvez nous contacter à l'adresse support du site.
                                Vous avez également le droit d'introduire une réclamation auprès de la CNIL.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Sécurité</h2>
                            <p>
                                Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour garantir
                                un niveau de sécurité adapté au risque, notamment le chiffrement des communications (HTTPS) et
                                des mots de passe (bcrypt).
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
