import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'

export const metadata = {
    title: 'Mentions Légales | Expert-Financement',
    description: 'Informations légales sur l\'éditeur du service Expert-Financement.',
}

export default function MentionsLegales() {
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

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-slate-100 p-8 sm:p-12 border-b border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Building2 className="h-8 w-8 text-slate-700" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">Mentions Légales</h1>
                        </div>
                        <p className="text-slate-600">
                            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique.
                        </p>
                    </div>

                    <div className="p-8 sm:p-12 space-y-10 text-gray-600">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">1. Éditeur du Site</h2>
                            <ul className="space-y-2 ml-4">
                                <li><strong>Dénomination sociale :</strong> Expert-Financement SAS (fictif)</li>
                                <li><strong>Capital social :</strong> 10 000 €</li>
                                <li><strong>Siège social :</strong> 10 Rue de la Bourse, 75002 Paris, France</li>
                                <li><strong>RCS :</strong> Paris B 123 456 789</li>
                                <li><strong>Email :</strong> contact@expert-financement.app</li>
                                <li><strong>Directeur de la publication :</strong> Arthur Admin</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">2. Hébergement</h2>
                            <p className="ml-4 mb-2">Le site est hébergé par :</p>
                            <ul className="space-y-2 ml-4">
                                <li><strong>Nom :</strong> Vercel Inc.</li>
                                <li><strong>Adresse :</strong> 340 S Lemon Ave #4133 Walnut, CA 91789, USA</li>
                                <li><strong>Site web :</strong> https://vercel.com</li>
                            </ul>
                            <p className="ml-4 mt-2 text-sm text-gray-500">Note : Les données sont stockées sur des serveurs situés en Union Européenne via Supabase (AWS Frankfürt).</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">3. Propriété Intellectuelle</h2>
                            <p className="ml-4">
                                L'ensemble des éléments graphiques, la structure et, plus généralement, le contenu du site Expert-Financement sont protégés par le droit d'auteur, le droit des marques et le droit des dessins et modèles.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
