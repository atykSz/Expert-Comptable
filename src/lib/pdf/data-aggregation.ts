import { prisma } from '@/lib/prisma'
import {
    calculatePrevisionnelCashFlow,
    calculateBilan,
    PrevisionnelWithRelations,
    MonthlyCashFlow,
    BilanAnnuel
} from '@/lib/financial-calculations'
import { calculerSIG, DonneesCompteResultat, ResultatSIG } from '@/lib/calculations/compte-resultat'

export interface RapportFinancier {
    previsionnel: PrevisionnelWithRelations
    compteResultat: {
        annee1: ResultatSIG
        annee2: ResultatSIG
        annee3: ResultatSIG
    }
    tresorerie: MonthlyCashFlow[] // 12 premiers mois ou plus
    bilan: BilanAnnuel[]
    indicateurs: {
        bfr: number
        caf: number[]
        tresorerieFinale: number
    }
}

export async function aggregateRapportData(previsionnelId: string): Promise<RapportFinancier | null> {

    // 1. Fetch Data
    const previsionnel = await prisma.previsionnel.findUnique({
        where: { id: previsionnelId },
        include: {
            lignesCA: true,
            lignesCharge: true,
            hypotheses: true,
            financements: true,
            investissements: true
        }
    })

    if (!previsionnel) return null

    // 2. Calcul Compte de Résultat (3 ans)
    const resultatsAnnuels: ResultatSIG[] = []
    const resultatsNets: number[] = []

    for (let year = 1; year <= 3; year++) {
        const yearOffset = (year - 1) * 12
        const sumYear = (montants: any) => {
            const m = montants as number[]
            if (!Array.isArray(m)) return 0
            return m.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + b, 0)
        }

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
            dotationsAmortissements: 0,
            dotationsProvisions: 0,
            chargesFinancieres: 0,
            chargesExceptionnelles: 0,
            participationSalaries: 0,
            impotSurBenefices: 0
        }

        const sig = calculerSIG(donnees)
        resultatsAnnuels.push(sig)
        resultatsNets.push(sig.resultatNet)
    }

    // 3. Calcul Trésorerie
    const monthlyFlows = calculatePrevisionnelCashFlow(previsionnel)

    // 4. Calcul Bilan
    const bilans = calculateBilan(previsionnel, monthlyFlows, resultatsNets)

    // 5. Indicateurs clés
    const dernierMois = monthlyFlows[monthlyFlows.length - 1]

    return {
        previsionnel,
        compteResultat: {
            annee1: resultatsAnnuels[0],
            annee2: resultatsAnnuels[1],
            annee3: resultatsAnnuels[2],
        },
        tresorerie: monthlyFlows,
        bilan: bilans,
        indicateurs: {
            bfr: 0, // A calculer si besoin
            caf: resultatsAnnuels.map(r => r.caf),
            tresorerieFinale: dernierMois ? dernierMois.tresorerieFin : 0
        }
    }
}
