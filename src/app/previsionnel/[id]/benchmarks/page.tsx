import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BenchmarkView, BenchmarkNoData } from '@/components/benchmarks'
import { calculerSIG, DonneesCompteResultat } from '@/lib/calculations/compte-resultat'
import {
  calculerRatiosEntreprise,
  analyserBenchmarks,
  type BenchmarkData
} from '@/lib/calculations/benchmarks'
import { calculatePrevisionnelCashFlow, calculateBilan } from '@/lib/financial-calculations'
import { getBenchmarkByNAF, BENCHMARKS_SEED_DATA } from '@/lib/data/benchmarks-seed'

export default async function BenchmarksPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // 1. Authentification
  const authUser = await getAuthenticatedUser()
  if (!authUser) redirect('/login')

  const { id } = await params

  // 2. Fetch du prévisionnel avec toutes les relations
  const previsionnel = await prisma.previsionnel.findUnique({
    where: { id },
    include: {
      lignesCA: true,
      lignesCharge: true,
      hypotheses: true,
      financements: true,
      investissements: true,
      client: true
    }
  })

  if (!previsionnel) {
    return <div className="p-8">Prévisionnel introuvable</div>
  }

  // 3. Vérifier le code NAF du client
  const codeNAF = previsionnel.client.codeNAF

  if (!codeNAF) {
    return (
      <div className="p-8">
        <BenchmarkNoData />
      </div>
    )
  }

  // 4. Récupérer les benchmarks sectoriels
  // D'abord chercher en BDD, sinon fallback sur les données seed
  const currentYear = new Date().getFullYear()
  const benchmarkFromDB = await prisma.benchmarkSectoriel.findFirst({
    where: {
      OR: [
        { codeNAF: codeNAF },
        { codeNAF2: codeNAF.replace(/[A-Z]$/, '') },
        { division: codeNAF.substring(0, 2) }
      ],
      annee: { lte: currentYear }
    },
    orderBy: [
      { annee: 'desc' }
    ]
  })

  // Fallback sur les données seed si pas en BDD
  const benchmarkSeed = getBenchmarkByNAF(codeNAF, currentYear, BENCHMARKS_SEED_DATA)

  if (!benchmarkFromDB && !benchmarkSeed) {
    return (
      <div className="p-8">
        <BenchmarkNoData codeNAF={codeNAF} />
      </div>
    )
  }

  // Utiliser les données seed si pas de données BDD
  const benchmarkSource = benchmarkFromDB || benchmarkSeed

  const benchmark: BenchmarkData = {
    margeBruteQ1: benchmarkSource?.margeBruteQ1 ?? null,
    margeBruteMedian: benchmarkSource?.margeBruteMedian ?? null,
    margeBruteQ3: benchmarkSource?.margeBruteQ3 ?? null,
    margeNetteQ1: benchmarkSource?.margeNetteQ1 ?? null,
    margeNetteMedian: benchmarkSource?.margeNetteMedian ?? null,
    margeNetteQ3: benchmarkSource?.margeNetteQ3 ?? null,
    tauxVAQ1: benchmarkSource?.tauxVAQ1 ?? null,
    tauxVAMedian: benchmarkSource?.tauxVAMedian ?? null,
    tauxVAQ3: benchmarkSource?.tauxVAQ3 ?? null,
    ebeCAQ1: benchmarkSource?.ebeCAQ1 ?? null,
    ebeCAMedian: benchmarkSource?.ebeCAMedian ?? null,
    ebeCAQ3: benchmarkSource?.ebeCAQ3 ?? null,
    tauxEndettementQ1: benchmarkSource?.tauxEndettementQ1 ?? null,
    tauxEndettementMedian: benchmarkSource?.tauxEndettementMedian ?? null,
    tauxEndettementQ3: benchmarkSource?.tauxEndettementQ3 ?? null,
    delaiClientsQ1: benchmarkSource?.delaiClientsQ1 ?? null,
    delaiClientsMedian: benchmarkSource?.delaiClientsMedian ?? null,
    delaiClientsQ3: benchmarkSource?.delaiClientsQ3 ?? null,
    delaiFournisseursQ1: benchmarkSource?.delaiFournisseursQ1 ?? null,
    delaiFournisseursMedian: benchmarkSource?.delaiFournisseursMedian ?? null,
    delaiFournisseursQ3: benchmarkSource?.delaiFournisseursQ3 ?? null,
  }

  // 5. Calculer les données financières du prévisionnel (Année 1)
  const nombreAnnees = Math.ceil((previsionnel.nombreMois || 36) / 12)

  // Helper pour calculer les montants annuels
  const sumYear = (montants: unknown, yearOffset: number = 0) => {
    const m = montants as number[]
    if (!Array.isArray(m)) return 0
    return m.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + (b || 0), 0)
  }

  // Données pour année 1
  const donnees: DonneesCompteResultat = {
    venteMarchandises: previsionnel.lignesCA
      .filter(l => l.categorie === 'VENTE_MARCHANDISES')
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    productionVendueBiens: previsionnel.lignesCA
      .filter(l => l.categorie === 'PRODUCTION_VENDUE_BIENS')
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    productionVendueServices: previsionnel.lignesCA
      .filter(l => l.categorie === 'PRODUCTION_VENDUE_SERVICES' || l.categorie === 'PRESTATIONS_SERVICES')
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    subventionsExploitation: previsionnel.lignesCA
      .filter(l => l.categorie === 'SUBVENTIONS')
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    autresProduits: previsionnel.lignesCA
      .filter(l => l.categorie === 'AUTRES_PRODUITS')
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    produitsFin: 0,
    produitsExceptionnels: 0,

    achatsMarchandises: previsionnel.lignesCharge
      .filter(l => l.categorie === 'ACHATS_MARCHANDISES')
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    variationStockMarchandises: 0,
    achatsMatieresPrem: previsionnel.lignesCharge
      .filter(l => l.categorie === 'ACHATS_MATIERES_PREMIERES')
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    variationStockMatieres: 0,
    autresAchats: previsionnel.lignesCharge
      .filter(l => l.categorie === 'ACHATS_FOURNITURES')
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    servicesExterieurs: previsionnel.lignesCharge
      .filter(l => ['LOCATIONS', 'ENTRETIEN_REPARATIONS', 'ASSURANCES', 'SOUS_TRAITANCE', 'DOCUMENTATION'].includes(l.categorie))
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    autresServicesExterieurs: previsionnel.lignesCharge
      .filter(l => ['HONORAIRES', 'PUBLICITE', 'TRANSPORTS', 'DEPLACEMENTS', 'FRAIS_POSTAUX_TELECOM', 'SERVICES_BANCAIRES', 'AUTRES_SERVICES'].includes(l.categorie))
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    impotsTaxes: previsionnel.lignesCharge
      .filter(l => ['IMPOTS_TAXES', 'CFE', 'CVAE'].includes(l.categorie))
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    chargesPersonnel: previsionnel.lignesCharge
      .filter(l => ['REMUNERATION_DIRIGEANT', 'SALAIRES_BRUTS', 'CHARGES_SOCIALES'].includes(l.categorie))
      .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
    dotationsAmortissements: previsionnel.investissements.reduce((sum, inv) => {
      const dureeAnnees = (inv.dureeAmortissement || 60) / 12
      return sum + (inv.montantHT / dureeAnnees)
    }, 0),
    dotationsProvisions: 0,
    chargesFinancieres: previsionnel.financements
      .filter(f => f.type === 'EMPRUNT_BANCAIRE')
      .reduce((sum, f) => {
        const tauxAnnuel = (f.tauxInteret || 0) / 100
        return sum + (f.montant * tauxAnnuel / 2)
      }, 0),
    chargesExceptionnelles: 0,
    participationSalaries: 0,
    impotSurBenefices: 0
  }

  // Calculer les SIG
  const sig = calculerSIG(donnees)

  // Calculer les résultats annuels pour le bilan
  const resultatsAnnuels: number[] = []
  for (let year = 1; year <= nombreAnnees; year++) {
    const yearOffset = (year - 1) * 12
    const donneesYear: DonneesCompteResultat = {
      ...donnees,
      // Recalculer pour chaque année
      venteMarchandises: previsionnel.lignesCA
        .filter(l => l.categorie === 'VENTE_MARCHANDISES')
        .reduce((sum, l) => sum + sumYear(l.montantsMensuels, yearOffset), 0),
      productionVendueBiens: previsionnel.lignesCA
        .filter(l => l.categorie === 'PRODUCTION_VENDUE_BIENS')
        .reduce((sum, l) => sum + sumYear(l.montantsMensuels, yearOffset), 0),
      productionVendueServices: previsionnel.lignesCA
        .filter(l => l.categorie === 'PRODUCTION_VENDUE_SERVICES' || l.categorie === 'PRESTATIONS_SERVICES')
        .reduce((sum, l) => sum + sumYear(l.montantsMensuels, yearOffset), 0),
    }
    const sigYear = calculerSIG(donneesYear)
    resultatsAnnuels.push(sigYear.resultatNet)
  }

  // Calculer le bilan
  const monthlyFlows = calculatePrevisionnelCashFlow(previsionnel)
  const bilans = calculateBilan(previsionnel, monthlyFlows, resultatsAnnuels)
  const bilanAn1 = bilans[0]

  // Total des achats pour le calcul des ratios
  const totalAchats = donnees.achatsMarchandises + donnees.achatsMatieresPrem + donnees.autresAchats

  // 6. Calculer les ratios de l'entreprise
  const ratios = calculerRatiosEntreprise({
    ca: sig.ca,
    achats: totalAchats,
    resultatNet: sig.resultatNet,
    valeurAjoutee: sig.valeurAjoutee,
    ebe: sig.ebe,
    capitauxPropres: bilanAn1 ? bilanAn1.passif.capitalSocial + bilanAn1.passif.resultatNet + bilanAn1.passif.reportANouveau : 0,
    dettes: bilanAn1 ? bilanAn1.passif.emprunts + bilanAn1.passif.dettesFournisseurs : 0,
    creancesClients: bilanAn1 ? bilanAn1.actif.creancesClients : 0,
    dettesFournisseurs: bilanAn1 ? bilanAn1.passif.dettesFournisseurs : 0,
    tauxTVA: previsionnel.hypotheses?.tauxTVAVentes ?? 20
  })

  // 7. Analyser les benchmarks
  const resultatBenchmark = analyserBenchmarks(ratios, benchmark)

  // 8. Préparer les infos secteur
  const secteurInfo = {
    codeNAF: codeNAF,
    libelle: benchmarkSource?.libelleNAF || 'Secteur non identifié',
    annee: benchmarkSource?.annee || currentYear - 1,
    nbEntreprises: benchmarkSource?.nbEntreprises ?? undefined,
    source: benchmarkFromDB
      ? (benchmarkFromDB.source === 'BANQUE_DE_FRANCE' ? 'Banque de France' :
         benchmarkFromDB.source === 'INSEE' ? 'INSEE' : 'Interne')
      : benchmarkSeed?.source || 'Données publiques'
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <BenchmarkView
        resultat={resultatBenchmark}
        ratios={ratios}
        secteur={secteurInfo}
        previsionnelId={id}
      />
    </div>
  )
}
