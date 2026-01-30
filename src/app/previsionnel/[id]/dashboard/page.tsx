import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardView, DashboardData } from '@/components/dashboard/DashboardView'
import { calculatePrevisionnelCashFlow, calculateBilan } from '@/lib/financial-calculations'
import { calculerSIG, DonneesCompteResultat } from '@/lib/calculations/compte-resultat'

export default async function DashboardPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    // 1. Authentification
    const authUser = await getAuthenticatedUser()
    if (!authUser) redirect('/login')

    const { id } = await params

    // 2. Fetch du prévisionnel avec TOUTES les relations
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

    // 3. Déterminer le nombre d'années et les années
    const nombreAnnees = Math.ceil((previsionnel.nombreMois || 36) / 12)
    const dateDebut = new Date(previsionnel.dateDebut)
    const anneeDebut = dateDebut.getFullYear()
    const annees = Array.from({ length: nombreAnnees }, (_, i) => anneeDebut + i)

    // 4. Calculer le Compte de Résultat pour chaque année
    const resultatsAnnuels: number[] = []
    const ebeAnnuels: number[] = []
    const caAnnuels: number[] = []

    for (let year = 1; year <= nombreAnnees; year++) {
        const yearOffset = (year - 1) * 12

        // Helper to sum monthly amounts for the specific year
        const sumYear = (montants: unknown) => {
            const m = montants as number[]
            if (!Array.isArray(m)) return 0
            return m.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + (b || 0), 0)
        }

        // Calcul du CA pour cette année
        const caYear = previsionnel.lignesCA.reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0)
        caAnnuels.push(caYear)

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
                .filter(l => ['LOCATIONS', 'ENTRETIEN', 'ASSURANCES', 'HONORAIRES', 'PUBLICITE', 'DEPLACEMENTS', 'TELECOM', 'SERVICES_BANCAIRES', 'AUTRES_CHARGES_EXTERNES'].includes(l.categorie))
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            autresServicesExterieurs: 0,
            impotsTaxes: previsionnel.lignesCharge
                .filter(l => l.categorie === 'IMPOTS_TAXES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            chargesPersonnel: previsionnel.lignesCharge
                .filter(l => ['REMUNERATION_DIRIGEANT', 'SALAIRES_BRUTS', 'CHARGES_SOCIALES'].includes(l.categorie))
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            dotationsAmortissements: 0, // Calculé par le bilan
            dotationsProvisions: 0,
            chargesFinancieres: 0,
            chargesExceptionnelles: 0,
            participationSalaries: 0,
            impotSurBenefices: 0
        }

        const sig = calculerSIG(donnees)
        resultatsAnnuels.push(sig.resultatNet)
        ebeAnnuels.push(sig.ebe)
    }

    // 5. Calculer la Trésorerie
    const monthlyFlows = calculatePrevisionnelCashFlow(previsionnel)

    // Trésorerie fin d'année et min par année
    const tresorerieFin: number[] = []
    const tresorerieMin: number[] = []

    for (let year = 1; year <= nombreAnnees; year++) {
        const yearStart = (year - 1) * 12
        const yearEnd = Math.min(year * 12 - 1, monthlyFlows.length - 1)

        if (yearEnd >= 0 && monthlyFlows[yearEnd]) {
            tresorerieFin.push(monthlyFlows[yearEnd].tresorerieFin)
        } else {
            tresorerieFin.push(0)
        }

        // Min sur l'année
        let min = Infinity
        for (let m = yearStart; m <= yearEnd && m < monthlyFlows.length; m++) {
            if (monthlyFlows[m].tresorerieFin < min) {
                min = monthlyFlows[m].tresorerieFin
            }
        }
        tresorerieMin.push(min === Infinity ? 0 : min)
    }

    // 6. Calculer le Bilan
    const bilans = calculateBilan(previsionnel, monthlyFlows, resultatsAnnuels)

    // Extraire capitaux propres et endettement par année
    const capitauxPropres: number[] = []
    const endettement: number[] = []
    const ratioEndettement: number[] = []

    for (let year = 0; year < nombreAnnees; year++) {
        const bilan = bilans[year]
        if (bilan) {
            // Capitaux propres = Capital Social + Résultat Net + Report à Nouveau
            const cp = (bilan.passif.capitalSocial || 0) + (bilan.passif.resultatNet || 0) + (bilan.passif.reportANouveau || 0)
            capitauxPropres.push(cp)

            // Endettement = Emprunts restants
            const dettes = bilan.passif.emprunts || 0
            endettement.push(dettes)

            ratioEndettement.push(cp > 0 ? dettes / cp : 0)
        } else {
            capitauxPropres.push(0)
            endettement.push(0)
            ratioEndettement.push(0)
        }
    }

    // 7. Calculer les taux de marge (EBE/CA)
    const tauxMarge = caAnnuels.map((ca, i) => ca > 0 ? (ebeAnnuels[i] / ca) * 100 : 0)

    // 8. BFR (simplifié: créances - dettes fournisseurs du dernier mois)
    const lastFlow = monthlyFlows[monthlyFlows.length - 1]
    const bfr = lastFlow ? (lastFlow.encaissements?.total || 0) - (lastFlow.decaissements?.total || 0) : 0

    // 9. Construire les données du dashboard
    const dashboardData: DashboardData = {
        previsionnelId: id,
        titre: previsionnel.titre || 'Prévisionnel',
        annees,
        ca: caAnnuels,
        resultatNet: resultatsAnnuels,
        ebe: ebeAnnuels,
        capitauxPropres,
        endettement,
        tresorerieMin,
        tresorerieFin,
        bfr: Math.abs(bfr),
        tauxMarge,
        ratioEndettement
    }

    return <DashboardView donnees={dashboardData} />
}
