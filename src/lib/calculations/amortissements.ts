/**
 * Calculs des Amortissements
 * Méthodes linéaire et dégressive conformes au CGI
 */

import { round2 } from '../utils'

export interface Investissement {
    id: string
    libelle: string
    montantHT: number
    dateAcquisition: Date
    dureeAmortissement: number // en mois
    modeAmortissement: 'LINEAIRE' | 'DEGRESSIF' | 'NON_AMORTISSABLE'
    valeurResiduelle?: number
}

export interface LigneAmortissement {
    annee: number
    dateDebut: Date
    dateFin: Date
    baseAmortissable: number
    dotation: number
    amortissementCumule: number
    valeurNetteComptable: number
}

/**
 * Coefficients dégressifs selon la durée d'amortissement
 * Barème fiscal en vigueur
 */
function getCoefficientDegressif(dureeMois: number): number {
    const dureeAnnees = dureeMois / 12
    if (dureeAnnees <= 4) return 1.25
    if (dureeAnnees <= 6) return 1.75
    return 2.25
}

/**
 * Calculer le prorata temporis pour la première année
 * En jours selon le CGI
 */
function calculerProrata(dateAcquisition: Date, finExercice: Date): number {
    const debut = new Date(dateAcquisition)
    const fin = new Date(finExercice)

    // Nombre de jours entre acquisition et fin d'exercice
    const diffTime = fin.getTime() - debut.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    return Math.min(diffDays / 360, 1) // Base 360 jours
}

/**
 * Calculer le tableau d'amortissement linéaire
 */
export function calculerAmortissementLineaire(
    investissement: Investissement,
    dateFinExercice: Date = new Date(new Date().getFullYear(), 11, 31)
): LigneAmortissement[] {
    const tableau: LigneAmortissement[] = []

    if (investissement.modeAmortissement === 'NON_AMORTISSABLE') {
        return tableau
    }

    const baseAmortissable = investissement.montantHT - (investissement.valeurResiduelle || 0)
    const dureeAnnees = investissement.dureeAmortissement / 12
    const dotationAnnuelle = baseAmortissable / dureeAnnees

    let amortissementCumule = 0
    let annee = investissement.dateAcquisition.getFullYear()

    // Première année avec prorata temporis
    const finPremierExercice = new Date(annee, 11, 31)
    const prorata = calculerProrata(investissement.dateAcquisition, finPremierExercice)

    let dotationRestante = baseAmortissable
    let compteur = 0

    while (dotationRestante > 0.01 && compteur < dureeAnnees + 1) {
        const estPremiereAnnee = compteur === 0
        const dotation = estPremiereAnnee
            ? round2(dotationAnnuelle * prorata)
            : round2(Math.min(dotationAnnuelle, dotationRestante))

        amortissementCumule = round2(amortissementCumule + dotation)
        dotationRestante = round2(baseAmortissable - amortissementCumule)

        const dateDebut = compteur === 0
            ? investissement.dateAcquisition
            : new Date(annee, 0, 1)
        const dateFin = new Date(annee, 11, 31)

        tableau.push({
            annee,
            dateDebut,
            dateFin,
            baseAmortissable,
            dotation,
            amortissementCumule,
            valeurNetteComptable: round2(investissement.montantHT - amortissementCumule),
        })

        annee++
        compteur++
    }

    return tableau
}

/**
 * Calculer le tableau d'amortissement dégressif
 */
export function calculerAmortissementDegressif(
    investissement: Investissement,
    dateFinExercice: Date = new Date(new Date().getFullYear(), 11, 31)
): LigneAmortissement[] {
    const tableau: LigneAmortissement[] = []

    if (investissement.modeAmortissement !== 'DEGRESSIF') {
        return calculerAmortissementLineaire(investissement, dateFinExercice)
    }

    const coefficient = getCoefficientDegressif(investissement.dureeAmortissement)
    const dureeAnnees = investissement.dureeAmortissement / 12
    const tauxLineaire = 100 / dureeAnnees
    const tauxDegressif = tauxLineaire * coefficient

    let baseDegressif = investissement.montantHT
    let amortissementCumule = 0
    let annee = investissement.dateAcquisition.getFullYear()

    // Prorata pour la première année (en mois, pas en jours pour le dégressif)
    const moisAcquisition = investissement.dateAcquisition.getMonth()
    const prorataDegressif = (12 - moisAcquisition) / 12

    let compteur = 0
    const anneesRestantes = () => dureeAnnees - compteur

    while (baseDegressif > 0.01 && compteur < dureeAnnees + 1) {
        const estPremiereAnnee = compteur === 0

        // Calcul de la dotation dégressive
        let dotationDegressive = round2(baseDegressif * (tauxDegressif / 100))
        if (estPremiereAnnee) {
            dotationDegressive = round2(dotationDegressive * prorataDegressif)
        }

        // Calcul de la dotation linéaire sur le restant
        const dotationLineaire = round2(baseDegressif / Math.max(anneesRestantes(), 1))

        // On prend le maximum des deux (passage au linéaire si plus avantageux)
        const dotation = Math.max(dotationDegressive, dotationLineaire)
        const dotationEffective = Math.min(dotation, baseDegressif)

        amortissementCumule = round2(amortissementCumule + dotationEffective)

        const dateDebut = compteur === 0
            ? investissement.dateAcquisition
            : new Date(annee, 0, 1)
        const dateFin = new Date(annee, 11, 31)

        tableau.push({
            annee,
            dateDebut,
            dateFin,
            baseAmortissable: baseDegressif,
            dotation: dotationEffective,
            amortissementCumule,
            valeurNetteComptable: round2(investissement.montantHT - amortissementCumule),
        })

        baseDegressif = round2(baseDegressif - dotationEffective)
        annee++
        compteur++
    }

    return tableau
}

/**
 * Calculer l'amortissement selon le mode choisi
 */
export function calculerAmortissement(
    investissement: Investissement,
    dateFinExercice?: Date
): LigneAmortissement[] {
    switch (investissement.modeAmortissement) {
        case 'DEGRESSIF':
            return calculerAmortissementDegressif(investissement, dateFinExercice)
        case 'LINEAIRE':
            return calculerAmortissementLineaire(investissement, dateFinExercice)
        case 'NON_AMORTISSABLE':
        default:
            return []
    }
}

/**
 * Calculer la dotation aux amortissements pour une année donnée
 */
export function getDotationPourAnnee(
    tableau: LigneAmortissement[],
    annee: number
): number {
    const ligne = tableau.find(l => l.annee === annee)
    return ligne?.dotation || 0
}

/**
 * Calculer le cumul des dotations pour plusieurs investissements
 */
export function calculerDotationsTotales(
    investissements: Investissement[],
    annee: number
): number {
    return investissements.reduce((total, inv) => {
        const tableau = calculerAmortissement(inv)
        return total + getDotationPourAnnee(tableau, annee)
    }, 0)
}
