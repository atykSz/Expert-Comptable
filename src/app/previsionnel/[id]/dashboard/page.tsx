import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardView, DashboardData } from '@/components/dashboard/DashboardView'
import { calculatePrevisionnelCashFlow, calculateBilan } from '@/lib/financial-calculations'
import { calculerSIG, DonneesCompteResultat } from '@/lib/calculations/compte-resultat'
import { generateFinancialAlerts, FinancialAlert } from '@/lib/analysis/alerts'
import { calculateBreakEven, BreakEvenAnalysis } from '@/lib/analysis/breakeven'

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
            client: true,
            effectifs: true
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

            // Calcul des dotations aux amortissements
            dotationsAmortissements: previsionnel.investissements.reduce((sum, inv) => {
                const dureeAnnees = (inv.dureeAmortissement || 60) / 12
                // Si l'investissement est acquis après ou pendant l'année en cours
                // Simplification : année pleine pour l'instant, ou pro-rata si on veut être précis (TODO)
                return sum + (inv.montantHT / dureeAnnees)
            }, 0),

            dotationsProvisions: 0,

            // Calcul des charges financières (intérêts)
            chargesFinancieres: previsionnel.financements
                .filter(f => f.type === 'EMPRUNT_BANCAIRE')
                .reduce((sum, f) => {
                    const tauxAnnuel = (f.tauxInteret || 0) / 100
                    // Simplification: Intérêts sur capital restant dû moyen (estimé ici à 50% sur la durée)
                    return sum + (f.montant * tauxAnnuel / 2) // Approximation pour le dashboard
                }, 0),

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

    // 9. Préparer les données mensuelles de trésorerie pour le graphique
    const tresorerieMensuelle = monthlyFlows.slice(0, 36).map((flow, index) => {
        const date = new Date(previsionnel.dateDebut)
        date.setMonth(date.getMonth() + index)
        return {
            mois: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            solde: flow.tresorerieFin
        }
    })

    // 10. Calcul Analyse Financière (Alertes & Seuil)

    // Pour l'année 1 (année de démarrage souvent critique)
    const chargesFixesAn1 = previsionnel.lignesCharge
        .filter(l => l.typeCharge === 'FIXE')
        .reduce((sum, l) => {
            const m = l.montantsMensuels as number[]
            return sum + (m ? m.slice(0, 12).reduce((a, b) => a + b, 0) : 0)
        }, 0)

    const chargesVariablesAn1 = previsionnel.lignesCharge
        .filter(l => l.typeCharge === 'VARIABLE')
        .reduce((sum, l) => {
            const m = l.montantsMensuels as number[]
            return sum + (m ? m.slice(0, 12).reduce((a, b) => a + b, 0) : 0)
        }, 0)

    // Coût des achats marchandises (variable par nature)
    const achatsMarchandisesAn1 = previsionnel.lignesCharge
        .filter(l => l.categorie === 'ACHATS_MARCHANDISES' || l.categorie === 'ACHATS_MATIERES_PREMIERES')
        .reduce((sum, l) => {
            const m = l.montantsMensuels as number[]
            return sum + (m ? m.slice(0, 12).reduce((a, b) => a + b, 0) : 0)
        }, 0)

    const totalChargesVariablesAn1 = chargesVariablesAn1 + achatsMarchandisesAn1
    // Note: On pourrait raffiner en ajoutant les charges de personnel si considérées variables, mais restons simple

    const breakEvenAnalysis = calculateBreakEven(
        previsionnel as unknown as import('@/types').Previsionnel,
        caAnnuels[0],
        totalChargesVariablesAn1,
        chargesFixesAn1
    )

    // Pour les alertes, on prend la situation la plus récente ou critique
    const alertes = generateFinancialAlerts({
        bfr: Math.abs(bfr), // BFR positif = Besoin
        ca: caAnnuels[0], // Sur année 1 pour l'instant
        tresorerieMin: Math.min(...tresorerieMin),
        margeCommerciale: ebeAnnuels[0], // Approximation pour l'alerte
        chargesFixes: chargesFixesAn1,
        totalCharges: 0, // Pas utilisé dans la logique actuelle
        endettement: endettement[0],
        capitauxPropres: capitauxPropres[0]
    })

    // 11. Construire les données du dashboard
    const dashboardData: DashboardData & {
        alertes: FinancialAlert[];
        breakEven: BreakEvenAnalysis
    } = {
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
        ratioEndettement,
        tresorerieMensuelle,
        alertes,
        breakEven: breakEvenAnalysis
    }

    return <DashboardView donnees={dashboardData} />
}
