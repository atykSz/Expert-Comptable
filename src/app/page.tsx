import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import {
  Calculator,
  TrendingUp,
  FileSpreadsheet,
  PiggyBank,
  BarChart3,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: FileSpreadsheet,
      title: 'Compte de Résultat',
      description: 'Construisez votre compte de résultat prévisionnel avec les Soldes Intermédiaires de Gestion',
      href: '/previsionnel/nouveau',
      color: 'bg-blue-500',
    },
    {
      icon: Calculator,
      title: 'Bilan Prévisionnel',
      description: 'Visualisez votre patrimoine prévisionnel avec actif et passif équilibrés',
      href: '/previsionnel/nouveau',
      color: 'bg-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Plan de Financement',
      description: 'Anticipez vos besoins en financement et vos sources de ressources',
      href: '/previsionnel/nouveau',
      color: 'bg-purple-500',
    },
    {
      icon: PiggyBank,
      title: 'Plan de Trésorerie',
      description: 'Suivez vos flux de trésorerie mois par mois sur 36 mois',
      href: '/previsionnel/nouveau',
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Expert-Comptable</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/connexion"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Essai gratuit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Créez votre prévisionnel comptable
              <span className="text-blue-200"> aux normes françaises</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Compte de résultat, bilan, plan de financement et trésorerie.
              Conforme au Plan Comptable Général (PCG) et prêt pour vos banques.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/previsionnel/nouveau"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Commencer un prévisionnel
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Voir une démo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Indicateurs clés */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-gray-500 mt-1">Conforme PCG</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">36</div>
              <div className="text-gray-500 mt-1">Mois de projection</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">PDF</div>
              <div className="text-gray-500 mt-1">Export professionnel</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">Excel</div>
              <div className="text-gray-500 mt-1">Tableaux éditables</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tous les tableaux financiers de votre business plan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Générez automatiquement l'ensemble des documents financiers
              nécessaires pour convaincre vos partenaires.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card variant="bordered" className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className={`p-3 rounded-lg ${feature.color}`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {feature.description}
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à créer votre prévisionnel ?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Commencez gratuitement et créez un prévisionnel professionnel
            en quelques minutes.
          </p>
          <Link
            href="/previsionnel/nouveau"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Démarrer maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>


    </div>
  )
}
