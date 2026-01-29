/**
 * Calculs du Compte de Résultat Prévisionnel
 * Conforme au Plan Comptable Général (PCG) français
 */

import { round2 } from '../utils'

export interface DonneesCompteResultat {
    // Produits
    venteMarchandises: number
    productionVendueBiens: number
    productionVendueServices: number
    subventionsExploitation: number
    autresProduits: number
    produitsFin: number
    produitsExceptionnels: number

    // Charges
    achatsMarchandises: number
    variationStockMarchandises: number
    achatsMatieresPrem: number
    variationStockMatieres: number
    autresAchats: number
    servicesExterieurs: number
    autresServicesExterieurs: number
    impotsTaxes: number
    chargesPersonnel: number
    dotationsAmortissements: number
    dotationsProvisions: number
    chargesFinancieres: number
    chargesExceptionnelles: number
    participationSalaries: number
    impotSurBenefices: number
}

export interface SoldesIntermediairesGestion {
    // Marges
    margeCommerciale: number
    productionExercice: number

    // Valeur ajoutée
    consommationsExterieures: number
    valeurAjoutee: number

    // Résultats
    excedentBrutExploitation: number
    resultatExploitation: number
    resultatCourantAvantImpots: number
    resultatExceptionnel: number
    resultatNet: number

    // Capacité d'autofinancement
    capaciteAutofinancement: number
}

/**
 * Calculer la marge commerciale
 * Marge Commerciale = Ventes de marchandises - Coût d'achat des marchandises vendues
 */
export function calculerMargeCommerciale(
    venteMarchandises: number,
    achatsMarchandises: number,
    variationStock: number
): number {
    return round2(venteMarchandises - achatsMarchandises - variationStock)
}

/**
 * Calculer la production de l'exercice
 * Production = Production vendue + Production stockée + Production immobilisée
 */
export function calculerProductionExercice(
    productionVendueBiens: number,
    productionVendueServices: number,
    productionStockee: number = 0,
    productionImmobilisee: number = 0
): number {
    return round2(
        productionVendueBiens +
        productionVendueServices +
        productionStockee +
        productionImmobilisee
    )
}

/**
 * Calculer les consommations de l'exercice en provenance des tiers
 */
export function calculerConsommationsExterieures(
    achatsMatieresPrem: number,
    variationStockMatieres: number,
    autresAchats: number,
    servicesExterieurs: number,
    autresServicesExterieurs: number
): number {
    return round2(
        achatsMatieresPrem +
        variationStockMatieres +
        autresAchats +
        servicesExterieurs +
        autresServicesExterieurs
    )
}

/**
 * Calculer la valeur ajoutée
 * VA = Marge commerciale + Production de l'exercice - Consommations de l'exercice
 */
export function calculerValeurAjoutee(
    margeCommerciale: number,
    productionExercice: number,
    consommationsExterieures: number
): number {
    return round2(margeCommerciale + productionExercice - consommationsExterieures)
}

/**
 * Calculer l'Excédent Brut d'Exploitation (EBE)
 * EBE = VA + Subventions d'exploitation - Impôts et taxes - Charges de personnel
 */
export function calculerEBE(
    valeurAjoutee: number,
    subventions: number,
    impotsTaxes: number,
    chargesPersonnel: number
): number {
    return round2(valeurAjoutee + subventions - impotsTaxes - chargesPersonnel)
}

/**
 * Calculer le résultat d'exploitation
 * RE = EBE + Reprises sur provisions + Autres produits - Dotations - Autres charges
 */
export function calculerResultatExploitation(
    ebe: number,
    autresProduits: number,
    reprisesProvisions: number,
    dotationsAmortissements: number,
    dotationsProvisions: number,
    autresCharges: number = 0
): number {
    return round2(
        ebe +
        autresProduits +
        reprisesProvisions -
        dotationsAmortissements -
        dotationsProvisions -
        autresCharges
    )
}

/**
 * Calculer le résultat courant avant impôts
 * RCAI = Résultat d'exploitation + Produits financiers - Charges financières
 */
export function calculerResultatCourant(
    resultatExploitation: number,
    produitsFinanciers: number,
    chargesFinancieres: number
): number {
    return round2(resultatExploitation + produitsFinanciers - chargesFinancieres)
}

/**
 * Calculer le résultat exceptionnel
 */
export function calculerResultatExceptionnel(
    produitsExceptionnels: number,
    chargesExceptionnelles: number
): number {
    return round2(produitsExceptionnels - chargesExceptionnelles)
}

/**
 * Calculer le résultat net
 * RN = RCAI + Résultat exceptionnel - Participation salariés - Impôt sur les bénéfices
 */
export function calculerResultatNet(
    resultatCourant: number,
    resultatExceptionnel: number,
    participationSalaries: number,
    impotSurBenefices: number
): number {
    return round2(
        resultatCourant +
        resultatExceptionnel -
        participationSalaries -
        impotSurBenefices
    )
}

/**
 * Calculer la Capacité d'Autofinancement (CAF)
 * Méthode additive à partir du résultat net
 */
export function calculerCAF(
    resultatNet: number,
    dotationsAmortissements: number,
    dotationsProvisions: number,
    reprisesProvisions: number = 0,
    plusValuesCessions: number = 0,
    moinsValuesCessions: number = 0
): number {
    return round2(
        resultatNet +
        dotationsAmortissements +
        dotationsProvisions -
        reprisesProvisions -
        plusValuesCessions +
        moinsValuesCessions
    )
}

/**
 * Calculer l'impôt sur les sociétés
 * Barème 2024 : 15% jusqu'à 42 500€, puis 25%
 */
export function calculerIS(
    resultatFiscal: number,
    estPME: boolean = true
): number {
    if (resultatFiscal <= 0) return 0

    if (estPME && resultatFiscal <= 42500) {
        return round2(resultatFiscal * 0.15)
    } else if (estPME) {
        return round2(42500 * 0.15 + (resultatFiscal - 42500) * 0.25)
    } else {
        return round2(resultatFiscal * 0.25)
    }
}

/**
 * Calculer tous les Soldes Intermédiaires de Gestion (SIG)
 */
export function calculerSIG(donnees: DonneesCompteResultat): SoldesIntermediairesGestion {
    const margeCommerciale = calculerMargeCommerciale(
        donnees.venteMarchandises,
        donnees.achatsMarchandises,
        donnees.variationStockMarchandises
    )

    const productionExercice = calculerProductionExercice(
        donnees.productionVendueBiens,
        donnees.productionVendueServices
    )

    const consommationsExterieures = calculerConsommationsExterieures(
        donnees.achatsMatieresPrem,
        donnees.variationStockMatieres,
        donnees.autresAchats,
        donnees.servicesExterieurs,
        donnees.autresServicesExterieurs
    )

    const valeurAjoutee = calculerValeurAjoutee(
        margeCommerciale,
        productionExercice,
        consommationsExterieures
    )

    const excedentBrutExploitation = calculerEBE(
        valeurAjoutee,
        donnees.subventionsExploitation,
        donnees.impotsTaxes,
        donnees.chargesPersonnel
    )

    const resultatExploitation = calculerResultatExploitation(
        excedentBrutExploitation,
        donnees.autresProduits,
        0, // reprises sur provisions
        donnees.dotationsAmortissements,
        donnees.dotationsProvisions
    )

    const resultatCourantAvantImpots = calculerResultatCourant(
        resultatExploitation,
        donnees.produitsFin,
        donnees.chargesFinancieres
    )

    const resultatExceptionnel = calculerResultatExceptionnel(
        donnees.produitsExceptionnels,
        donnees.chargesExceptionnelles
    )

    const resultatNet = calculerResultatNet(
        resultatCourantAvantImpots,
        resultatExceptionnel,
        donnees.participationSalaries,
        donnees.impotSurBenefices
    )

    const capaciteAutofinancement = calculerCAF(
        resultatNet,
        donnees.dotationsAmortissements,
        donnees.dotationsProvisions
    )

    return {
        margeCommerciale,
        productionExercice,
        consommationsExterieures,
        valeurAjoutee,
        excedentBrutExploitation,
        resultatExploitation,
        resultatCourantAvantImpots,
        resultatExceptionnel,
        resultatNet,
        capaciteAutofinancement,
    }
}
