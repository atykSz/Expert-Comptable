/**
 * Calculs pour les scénarios de simulation
 * Applique des modificateurs sur les données de base du prévisionnel
 */

import { calculatePrevisionnelCashFlow, calculateBilan } from '../financial-calculations'
import { calculerSIG, DonneesCompteResultat } from './compte-resultat'

export interface ScenarioModifiers {
    modifCA: number        // % modification CA (ex: +20 = +20%)
    modifCharges: number   // % modification charges
    modifDelaiPaiement: number // jours supplémentaires
}

export interface ScenarioResult {
    annees: number[]
    ca: number[]
    resultatNet: number[]
    ebe: number[]
    tresorerieFin: number[]
    tresorerieMin: number[]
    capitauxPropres: number[]
    tauxMarge: number[]
}

/**
 * Applique les modificateurs d'un scénario aux montants mensuels
 */
export function appliquerModificateur(
    montants: number[],
    pourcentage: number
): number[] {
    const multiplicateur = 1 + (pourcentage / 100)
    return montants.map(m => m * multiplicateur)
}

/**
 * Applique un scénario complet sur un prévisionnel
 * Retourne les résultats financiers modifiés
 */
export function calculerScenario(
    previsionnel: {
        dateDebut: Date | string
        nombreMois: number
        lignesCA: Array<{ montantsMensuels: unknown; categorie: string }>
        lignesCharge: Array<{ montantsMensuels: unknown; categorie: string }>
        hypotheses?: { tauxTVAVentes?: number; delaiPaiementClients?: number } | null
        financements: Array<{ montant: number; type: string; dateDebut: Date | string }>
        investissements: Array<{ montantHT: number }>
    },
    modifiers: ScenarioModifiers
): ScenarioResult {
    const nombreAnnees = Math.ceil((previsionnel.nombreMois || 36) / 12)
    const dateDebut = new Date(previsionnel.dateDebut)
    const anneeDebut = dateDebut.getFullYear()
    const annees = Array.from({ length: nombreAnnees }, (_, i) => anneeDebut + i)

    // Appliquer les modificateurs sur les données
    const lignesCAModifiees = previsionnel.lignesCA.map(ligne => ({
        ...ligne,
        montantsMensuels: appliquerModificateur(
            ligne.montantsMensuels as number[],
            modifiers.modifCA
        )
    }))

    const lignesChargesModifiees = previsionnel.lignesCharge.map(ligne => ({
        ...ligne,
        montantsMensuels: appliquerModificateur(
            ligne.montantsMensuels as number[],
            modifiers.modifCharges
        )
    }))

    // Créer un prévisionnel modifié pour les calculs
    const previsionnelModifie = {
        ...previsionnel,
        lignesCA: lignesCAModifiees,
        lignesCharge: lignesChargesModifiees,
        hypotheses: {
            ...previsionnel.hypotheses,
            delaiPaiementClients: (previsionnel.hypotheses?.delaiPaiementClients || 30) + modifiers.modifDelaiPaiement
        }
    }

    // Calculer les résultats annuels
    const ca: number[] = []
    const resultatNet: number[] = []
    const ebe: number[] = []
    const tauxMarge: number[] = []

    for (let year = 1; year <= nombreAnnees; year++) {
        const yearOffset = (year - 1) * 12

        const sumYear = (montants: unknown) => {
            const m = montants as number[]
            if (!Array.isArray(m)) return 0
            return m.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + (b || 0), 0)
        }

        // CA de l'année
        const caYear = lignesCAModifiees.reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0)
        ca.push(caYear)

        // Construire les données pour le SIG
        const donnees: DonneesCompteResultat = {
            venteMarchandises: lignesCAModifiees
                .filter(l => l.categorie === 'VENTE_MARCHANDISES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            productionVendueBiens: lignesCAModifiees
                .filter(l => l.categorie === 'PRODUCTION_VENDUE_BIENS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            productionVendueServices: lignesCAModifiees
                .filter(l => l.categorie === 'PRODUCTION_VENDUE_SERVICES' || l.categorie === 'PRESTATIONS_SERVICES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            subventionsExploitation: lignesCAModifiees
                .filter(l => l.categorie === 'SUBVENTIONS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            autresProduits: lignesCAModifiees
                .filter(l => l.categorie === 'AUTRES_PRODUITS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            produitsFin: 0,
            produitsExceptionnels: 0,

            achatsMarchandises: lignesChargesModifiees
                .filter(l => l.categorie === 'ACHATS_MARCHANDISES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            variationStockMarchandises: 0,
            achatsMatieresPrem: lignesChargesModifiees
                .filter(l => l.categorie === 'ACHATS_MATIERES_PREMIERES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            variationStockMatieres: 0,
            autresAchats: lignesChargesModifiees
                .filter(l => l.categorie === 'ACHATS_FOURNITURES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            servicesExterieurs: lignesChargesModifiees
                .filter(l => ['LOCATIONS', 'ENTRETIEN', 'ASSURANCES', 'HONORAIRES', 'PUBLICITE', 'DEPLACEMENTS', 'TELECOM', 'SERVICES_BANCAIRES'].includes(l.categorie))
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            autresServicesExterieurs: 0,
            impotsTaxes: lignesChargesModifiees
                .filter(l => l.categorie === 'IMPOTS_TAXES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            chargesPersonnel: lignesChargesModifiees
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
        resultatNet.push(sig.resultatNet)
        ebe.push(sig.ebe)
        tauxMarge.push(caYear > 0 ? (sig.ebe / caYear) * 100 : 0)
    }

    // Calculer la trésorerie avec le prévisionnel modifié
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthlyFlows = calculatePrevisionnelCashFlow(previsionnelModifie as any)

    const tresorerieFin: number[] = []
    const tresorerieMin: number[] = []
    const capitauxPropres: number[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bilans = calculateBilan(previsionnelModifie as any, monthlyFlows, resultatNet)

    for (let year = 0; year < nombreAnnees; year++) {
        const yearEnd = Math.min((year + 1) * 12 - 1, monthlyFlows.length - 1)
        tresorerieFin.push(monthlyFlows[yearEnd]?.tresorerieFin || 0)

        let min = Infinity
        for (let m = year * 12; m <= yearEnd && m < monthlyFlows.length; m++) {
            if (monthlyFlows[m]?.tresorerieFin < min) {
                min = monthlyFlows[m].tresorerieFin
            }
        }
        tresorerieMin.push(min === Infinity ? 0 : min)

        const bilan = bilans[year]
        if (bilan) {
            const cp = (bilan.passif.capitalSocial || 0) + (bilan.passif.resultatNet || 0) + (bilan.passif.reportANouveau || 0)
            capitauxPropres.push(cp)
        } else {
            capitauxPropres.push(0)
        }
    }

    return {
        annees,
        ca,
        resultatNet,
        ebe,
        tresorerieFin,
        tresorerieMin,
        capitauxPropres,
        tauxMarge
    }
}

/**
 * Prédéfinitions de scénarios types
 */
export const SCENARIOS_PREDEFINIS = {
    OPTIMISTE: {
        modifCA: 20,
        modifCharges: -5,
        modifDelaiPaiement: -10
    },
    REALISTE: {
        modifCA: 0,
        modifCharges: 0,
        modifDelaiPaiement: 0
    },
    PESSIMISTE: {
        modifCA: -30,
        modifCharges: 15,
        modifDelaiPaiement: 30
    }
}

/**
 * Compare plusieurs scénarios et retourne les écarts
 */
export function comparerScenarios(
    resultats: { nom: string; couleur: string; data: ScenarioResult }[]
): {
    meilleurResultat: string
    pireResultat: string
    ecartResultatNet: number
    ecartTresorerie: number
} {
    if (resultats.length === 0) {
        return {
            meilleurResultat: '-',
            pireResultat: '-',
            ecartResultatNet: 0,
            ecartTresorerie: 0
        }
    }

    const sorted = [...resultats].sort((a, b) => {
        const sumA = a.data.resultatNet.reduce((x, y) => x + y, 0)
        const sumB = b.data.resultatNet.reduce((x, y) => x + y, 0)
        return sumB - sumA
    })

    const meilleur = sorted[0]
    const pire = sorted[sorted.length - 1]

    const meilleurSum = meilleur.data.resultatNet.reduce((a, b) => a + b, 0)
    const pireSum = pire.data.resultatNet.reduce((a, b) => a + b, 0)

    const meilleurTreso = meilleur.data.tresorerieFin[meilleur.data.tresorerieFin.length - 1]
    const pireTreso = pire.data.tresorerieFin[pire.data.tresorerieFin.length - 1]

    return {
        meilleurResultat: meilleur.nom,
        pireResultat: pire.nom,
        ecartResultatNet: meilleurSum - pireSum,
        ecartTresorerie: meilleurTreso - pireTreso
    }
}
