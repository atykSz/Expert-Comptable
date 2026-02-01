import Link from 'next/link'
import {
  Calculator,
  TrendingUp,
  FileSpreadsheet,
  PiggyBank,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Users
} from 'lucide-react'


function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Expert-Financement</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tarifs
            </Link>
            <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/previsionnel/nouveau"
              className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Optimisé pour Banques & Investisseurs
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-[1.1] mb-6">
            Votre dossier de financement bancaire complété en 30 min
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 text-pretty max-w-2xl mx-auto">
            Business plan, prévisionnel financier et analyse de marché.
            Tout ce qu'il vous faut pour convaincre vos banquiers et investisseurs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/previsionnel/nouveau"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3.5 rounded-full font-medium hover:bg-foreground/90 transition-all hover:gap-3"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/previsionnel/demo/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground px-6 py-3.5 font-medium transition-colors"
            >
              Découvrir les fonctionnalités
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const stats = [
    { value: '100%', label: 'Conforme Banques' },
    { value: '36', label: 'Mois de projection' },
    { value: 'PDF', label: 'Dossier Bancaire' },
    { value: 'Excel', label: 'Tableaux éditables' },
  ]

  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-semibold tracking-tight mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: FileSpreadsheet,
      title: 'Compte de Résultat',
      description: 'Construisez votre compte de résultat prévisionnel avec les Soldes Intermédiaires de Gestion conformes aux normes PCG.',
      number: '01',
    },
    {
      icon: TrendingUp,
      title: 'Plan de Financement',
      description: 'Anticipez vos besoins et validez la faisabilité de votre projet auprès des banques.',
      number: '02',
    },
    {
      icon: BarChart3,
      title: 'Étude de Marché',
      description: 'Intégrez facilement les données de votre marché pour crédibiliser votre demande (Bientôt).',
      number: '03',
    },
    {
      icon: FileSpreadsheet,
      title: 'Dossier Complet',
      description: 'Un export PDF unique regroupant business plan, prévisionnel et annexes pour votre banquier.',
      number: '04',
    },
  ]

  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Votre dossier complet pour obtenir votre financement
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Un outil guidé pour construire un dossier bancaire inattaquable, du prévisionnel à l'étude de marché.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href="/previsionnel/nouveau"
              className="group relative p-8 rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{feature.number}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Créer maintenant
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Benefits() {
  const benefits = [
    {
      icon: Shield,
      title: 'Format Bancaire',
      description: 'Exports PDF structurés selon les attentes exactes des comités de crédit.',
    },
    {
      icon: Zap,
      title: 'Complet & Rapide',
      description: 'Votre dossier prêt à être envoyé en moins de 30 minutes.',
    },
    {
      icon: Users,
      title: 'Tous Projets',
      description: 'Idéal pour création, reprise d\'entreprise ou investissement immobilier.',
    },
  ]

  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shrink-0">
                <benefit.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const items = [
    {
      quote: "Grâce au dossier généré, ma banque a validé mon prêt immobilier pro en moins d'une semaine.",
      author: "Marie L.",
      role: "Investisseur Immobilier"
    },
    {
      quote: "L'outil structure parfaitement la démarche. Le banquier a apprécié la clarté du plan de financement.",
      author: "Thomas D.",
      role: "Créateur Entreprise BTP"
    },
    {
      quote: "Je pensais devoir payer un consultant 2000€, j'ai tout fait moi-même avec un résultat pro.",
      author: "Sophie M.",
      role: "Freelance Marketing"
    }
  ]

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-muted-foreground">
            Professionnels et entrepreneurs utilisent Expert-Financement au quotidien.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="p-6 rounded-2xl border border-border bg-card">
              <p className="text-foreground leading-relaxed mb-6">&ldquo;{item.quote}&rdquo;</p>
              <div>
                <div className="font-medium">{item.author}</div>
                <div className="text-sm text-muted-foreground">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 lg:py-32 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
          Prêt à financer votre projet ?
        </h2>
        <p className="text-background/70 mb-10 max-w-xl mx-auto">
          Commencez gratuitement la construction de votre dossier bancaire dès maintenant.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/previsionnel/nouveau"
            className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 rounded-full font-medium hover:bg-background/90 transition-all hover:gap-3"
          >
            Démarrer maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-background/60">
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Gratuit pour commencer
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Aucune carte requise
          </span>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Benefits />
        <Testimonials />
        <CTA />
      </main>
    </div>
  )
}
