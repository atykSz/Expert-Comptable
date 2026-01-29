import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
    title: 'Conditions Générales d\'Utilisation | Expert-Comptable',
    description: 'Conditions régissant l\'utilisation de notre service.',
}

export default function CGU() {
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
                        Conditions Générales d'Utilisation
                    </h1>

                    <div className="prose max-w-none text-gray-600 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Objet</h2>
                            <p>
                                Les présentes Conditions Générales d'Utilisation (CGU) encadrent juridiquement l'accès et l'utilisation
                                du site Expert-Comptable. L'accès à ce site signifie l'acceptation sans réserve des présentes CGU.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Accès au service</h2>
                            <p>
                                Le site est accessible gratuitement en tout lieu à tout utilisateur ayant un accès à Internet.
                                Tous les frais supportés par l'utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge.
                            </p>
                            <p className="mt-2">
                                L'éditeur met en œuvre tous les moyens pour assurer un accès de qualité au service 24h/24, 7j/7,
                                mais n'est tenu à aucune obligation d'y parvenir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Propriété intellectuelle</h2>
                            <p>
                                L'ensemble du contenu du site (textes, logos, images, code source) est protégé par le droit de la propriété intellectuelle.
                                Toute reproduction, copie ou publication du contenu sans l'autorisation de l'éditeur est strictement interdite.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Responsabilité</h2>
                            <p>
                                Bien que les informations publiées sur le site soient réputées fiables, le site se réserve la faculté
                                d'une non-garantie de la fiabilité des sources.
                            </p>
                            <p className="mt-2">
                                Les prévisionnels comptables générés par cet outil sont fournis à titre indicatif.
                                L'éditeur ne saurait être tenu responsable des conséquences de décisions prises sur la base de ces résultats.
                                Cet outil ne remplace pas les conseils d'un expert-comptable diplômé.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Liens hypertextes</h2>
                            <p>
                                Des liens hypertextes peuvent être présents sur le site. L'utilisateur est informé qu'en cliquant sur ces liens,
                                il sortira du site Expert-Comptable. Ce dernier n'a pas de contrôle sur les pages web sur lesquelles
                                aboutissent ces liens et ne saurait, en aucun cas, être responsable de leur contenu.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Modification des conditions</h2>
                            <p>
                                L'éditeur se réserve le droit de modifier unilatéralement et à tout moment le contenu des présentes CGU.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
