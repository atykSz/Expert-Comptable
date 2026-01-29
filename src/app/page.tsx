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
            <span className="text-lg font-semibold tracking-tight">Expert-Comptable</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalites
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
              href="/connexion"
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
            Conforme au Plan Comptable General
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-[1.1] mb-6">
            Creez votre previsionnel comptable professionnel
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 text-pretty max-w-2xl mx-auto">
            Compte de resultat, bilan, plan de financement et tresorerie. 
            Pret pour vos banques et investisseurs en quelques minutes.
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
              href="#features"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground px-6 py-3.5 font-medium transition-colors"
            >
              Decouvrir les fonctionnalites
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const stats = [
    { value: '100%', label: 'Conforme PCG' },
    { value: '36', label: 'Mois de projection' },
    { value: 'PDF', label: 'Export professionnel' },
    { value: 'Excel', label: 'Tableaux editables' },
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
      title: 'Compte de Resultat',
      description: 'Construisez votre compte de resultat previsionnel avec les Soldes Intermediaires de Gestion conformes aux normes PCG.',
      number: '01',
    },
    {
      icon: Calculator,
      title: 'Bilan Previsionnel',
      description: 'Visualisez votre patrimoine previsionnel avec actif et passif equilibres automatiquement.',
      number: '02',
    },
    {
      icon: TrendingUp,
      title: 'Plan de Financement',
      description: 'Anticipez vos besoins en financement et identifiez vos sources de ressources sur 3 ans.',
      number: '03',
    },
    {
      icon: PiggyBank,
      title: 'Plan de Tresorerie',
      description: 'Suivez vos flux de tresorerie mois par mois sur 36 mois pour eviter tout decouvert.',
      number: '04',
    },
  ]

  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Tous les tableaux financiers de votre business plan
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Generez automatiquement l&apos;ensemble des documents financiers necessaires pour convaincre vos partenaires.
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
                Creer maintenant
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
      title: 'Conforme aux normes',
      description: 'PCG, liasse fiscale 2035, 2031 - tous les formats officiels francais.',
    },
    {
      icon: Zap,
      title: 'Rapide et intuitif',
      description: 'Creez votre previsionnel complet en moins de 30 minutes.',
    },
    {
      icon: Users,
      title: 'Multi-profils',
      description: 'Adapte aux professions liberales, commercants et societes.',
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
      quote: "Un outil indispensable pour mes clients entrepreneurs. Le format 2035 est parfaitement conforme.",
      author: "Marie L.",
      role: "Expert-Comptable, Paris"
    },
    {
      quote: "J'ai pu presenter mon business plan a ma banque en 2 jours au lieu de 2 semaines.",
      author: "Thomas D.",
      role: "Fondateur, Startup Tech"
    },
    {
      quote: "Interface claire et calculs automatiques. Exactement ce qu'il me fallait pour mon cabinet.",
      author: "Sophie M.",
      role: "Medecin liberale"
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
            Professionnels et entrepreneurs utilisent Expert-Comptable au quotidien.
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
          Pret a creer votre previsionnel ?
        </h2>
        <p className="text-background/70 mb-10 max-w-xl mx-auto">
          Commencez gratuitement et creez un previsionnel professionnel en quelques minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/previsionnel/nouveau"
            className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 rounded-full font-medium hover:bg-background/90 transition-all hover:gap-3"
          >
            Demarrer maintenant
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
