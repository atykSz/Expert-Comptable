import { LigneCharge, Previsionnel } from '@/types'

export type BreakEvenAnalysis = {
    seuilRentabilite: number
    pointMortMois: number
    pointMortDate?: Date
    chargesFixes: number
    margeSurCoutVariable: number
    tauxMargeSurCoutVariable: number
    caBascule: number // CA cumulé où on passe positif
}

export function calculateBreakEven(
    previsionnel: Previsionnel,
    caAnnuel: number,
    totalChargesVariables: number,
    totalChargesFixes: number // Calculate this carefully outside or pass it in
): BreakEvenAnalysis {

    // 1. Calculs de base
    const margeSurCoutVariable = caAnnuel - totalChargesVariables

    let tauxMarge = 0
    if (caAnnuel > 0) {
        tauxMarge = margeSurCoutVariable / caAnnuel
    }

    // 2. Seuil de rentabilité (SR)
    // SR = Charges Fixes / Taux de Marge sur Coût Variable
    let seuilRentabilite = 0
    if (tauxMarge > 0) {
        seuilRentabilite = totalChargesFixes / tauxMarge
    }

    // 3. Point Mort en mois (simplifié, linéaire)
    // Point Mort = (SR / CA Annuel) * 12
    let pointMortMois = 0
    if (caAnnuel > 0) {
        pointMortMois = (seuilRentabilite / caAnnuel) * 12
    }

    // 4. Date approximative du point mort
    // On part de la date de début du prévisionnel
    let pointMortDate: Date | undefined
    if (pointMortMois > 0 && pointMortMois <= 12) {
        const dateDebut = new Date(previsionnel.dateDebut)
        // On ajoute le nombre de jours correspondant au point mort
        // Mois * 30.4 (moyenne jours/mois)
        const jours = Math.round(pointMortMois * 30.4)
        pointMortDate = new Date(dateDebut)
        pointMortDate.setDate(dateDebut.getDate() + jours)
    }

    return {
        seuilRentabilite,
        pointMortMois,
        pointMortDate,
        chargesFixes: totalChargesFixes,
        margeSurCoutVariable,
        tauxMargeSurCoutVariable: tauxMarge,
        caBascule: seuilRentabilite
    }
}
