/**
 * Calculs des tableaux d'amortissement d'emprunts
 */

import { round2 } from '../utils'

export interface Emprunt {
    id: string
    libelle: string
    montant: number
    tauxAnnuel: number     // en %
    dureeMois: number
    differeMois?: number   // Différé de remboursement
    dateDebut: Date
    typeRemboursement: 'CONSTANT' | 'DEGRESSIF' // Amortissement constant ou mensualités constantes
}

export interface EcheanceEmprunt {
    numero: number
    date: Date
    capitalDebut: number
    amortissement: number
    interets: number
    mensualite: number
    capitalFin: number
    assurance?: number
}

/**
 * Calculer le tableau d'amortissement avec mensualités constantes
 * (Méthode la plus courante pour les emprunts bancaires)
 */
export function calculerEcheancierMensualiteConstante(
    emprunt: Emprunt
): EcheanceEmprunt[] {
    const echeancier: EcheanceEmprunt[] = []

    const tauxMensuel = emprunt.tauxAnnuel / 100 / 12
    const differeMois = emprunt.differeMois || 0
    const dureeRemboursement = emprunt.dureeMois - differeMois

    // Calcul de la mensualité constante (hors période de différé)
    // M = C * (t * (1+t)^n) / ((1+t)^n - 1)
    const mensualiteConstante = tauxMensuel > 0
        ? round2(
            emprunt.montant *
            (tauxMensuel * Math.pow(1 + tauxMensuel, dureeRemboursement)) /
            (Math.pow(1 + tauxMensuel, dureeRemboursement) - 1)
        )
        : round2(emprunt.montant / dureeRemboursement)

    let capitalRestant = emprunt.montant
    let date = new Date(emprunt.dateDebut)

    for (let i = 1; i <= emprunt.dureeMois; i++) {
        date = new Date(emprunt.dateDebut)
        date.setMonth(date.getMonth() + i)

        const interets = round2(capitalRestant * tauxMensuel)

        let amortissement: number
        let mensualite: number

        if (i <= differeMois) {
            // Période de différé : on ne paie que les intérêts (ou rien selon le type)
            amortissement = 0
            mensualite = interets // Différé partiel (on paie les intérêts)
        } else {
            // Période normale de remboursement
            mensualite = mensualiteConstante
            amortissement = round2(mensualite - interets)
        }

        const capitalDebut = capitalRestant
        capitalRestant = round2(capitalRestant - amortissement)

        // Ajustement de la dernière échéance pour éviter les arrondis
        if (i === emprunt.dureeMois && capitalRestant !== 0) {
            amortissement = round2(amortissement + capitalRestant)
            mensualite = round2(amortissement + interets)
            capitalRestant = 0
        }

        echeancier.push({
            numero: i,
            date: new Date(date),
            capitalDebut,
            amortissement,
            interets,
            mensualite,
            capitalFin: capitalRestant,
        })
    }

    return echeancier
}

/**
 * Calculer le tableau d'amortissement avec amortissement constant
 * (Capital remboursé identique chaque mois, mensualités dégressives)
 */
export function calculerEcheancierAmortissementConstant(
    emprunt: Emprunt
): EcheanceEmprunt[] {
    const echeancier: EcheanceEmprunt[] = []

    const tauxMensuel = emprunt.tauxAnnuel / 100 / 12
    const differeMois = emprunt.differeMois || 0
    const dureeRemboursement = emprunt.dureeMois - differeMois

    const amortissementConstant = round2(emprunt.montant / dureeRemboursement)

    let capitalRestant = emprunt.montant
    let date = new Date(emprunt.dateDebut)

    for (let i = 1; i <= emprunt.dureeMois; i++) {
        date = new Date(emprunt.dateDebut)
        date.setMonth(date.getMonth() + i)

        const interets = round2(capitalRestant * tauxMensuel)

        let amortissement: number
        let mensualite: number

        if (i <= differeMois) {
            amortissement = 0
            mensualite = interets
        } else {
            amortissement = amortissementConstant
            mensualite = round2(amortissement + interets)
        }

        const capitalDebut = capitalRestant
        capitalRestant = round2(capitalRestant - amortissement)

        // Ajustement de la dernière échéance
        if (i === emprunt.dureeMois && capitalRestant !== 0) {
            amortissement = round2(amortissement + capitalRestant)
            mensualite = round2(amortissement + interets)
            capitalRestant = 0
        }

        echeancier.push({
            numero: i,
            date: new Date(date),
            capitalDebut,
            amortissement,
            interets,
            mensualite,
            capitalFin: capitalRestant,
        })
    }

    return echeancier
}

/**
 * Calculer l'échéancier selon le type de remboursement
 */
export function calculerEcheancier(emprunt: Emprunt): EcheanceEmprunt[] {
    switch (emprunt.typeRemboursement) {
        case 'DEGRESSIF':
            return calculerEcheancierAmortissementConstant(emprunt)
        case 'CONSTANT':
        default:
            return calculerEcheancierMensualiteConstante(emprunt)
    }
}

/**
 * Calculer le coût total d'un emprunt
 */
export function calculerCoutTotalEmprunt(echeancier: EcheanceEmprunt[]): {
    totalRembourse: number
    totalInterets: number
    totalCapital: number
} {
    const totalInterets = echeancier.reduce((sum, e) => sum + e.interets, 0)
    const totalCapital = echeancier.reduce((sum, e) => sum + e.amortissement, 0)

    return {
        totalRembourse: round2(totalCapital + totalInterets),
        totalInterets: round2(totalInterets),
        totalCapital: round2(totalCapital),
    }
}

/**
 * Obtenir les remboursements pour une année donnée
 */
export function getRemboursementsAnnee(
    echeancier: EcheanceEmprunt[],
    annee: number
): {
    capitalRembourse: number
    interetsPayes: number
    mensualitesTotales: number
} {
    const echeancesAnnee = echeancier.filter(e => e.date.getFullYear() === annee)

    return {
        capitalRembourse: round2(echeancesAnnee.reduce((sum, e) => sum + e.amortissement, 0)),
        interetsPayes: round2(echeancesAnnee.reduce((sum, e) => sum + e.interets, 0)),
        mensualitesTotales: round2(echeancesAnnee.reduce((sum, e) => sum + e.mensualite, 0)),
    }
}

/**
 * Obtenir le capital restant dû à une date donnée
 */
export function getCapitalRestantDu(
    echeancier: EcheanceEmprunt[],
    date: Date
): number {
    const echeancesPrecedentes = echeancier.filter(e => e.date <= date)
    if (echeancesPrecedentes.length === 0) {
        return echeancier[0]?.capitalDebut || 0
    }
    return echeancesPrecedentes[echeancesPrecedentes.length - 1].capitalFin
}
