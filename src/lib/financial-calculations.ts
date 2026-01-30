import { Previsionnel, LigneCA, LigneCharge, Hypotheses, Emprunt, Financement } from '@prisma/client'

// Types étendus avec les relations incluses
export type PrevisionnelWithRelations = Previsionnel & {
    lignesCA: LigneCA[]
    lignesCharge: LigneCharge[]
    hypotheses: Hypotheses | null
    financements: Financement[]
    // investissements: Investissement[] // À ajouter si nécessaire
}

export interface MonthlyCashFlow {
    mois: number // 1 to 36 (ou plus)
    encaissements: {
        caTTC: number
        apportCapital: number
        emprunt: number
        total: number
    }
    decaissements: {
        achatsTTC: number
        chargesTTC: number
        chargesSociales: number
        salairesNet: number
        tvaDecaissee: number
        remboursementEmprunt: number
        total: number
    }
    soldeFlux: number
    tresorerieFin: number
}

/**
 * Calcule le tableau de trésorerie mensuel sur la durée du prévisionnel
 */
export function calculatePrevisionnelCashFlow(
    previsionnel: PrevisionnelWithRelations,
    tresorerieInitiale: number = 0
): MonthlyCashFlow[] {
    const monthsCount = previsionnel.nombreMois
    const flow: MonthlyCashFlow[] = []

    // Initialisation
    let currentTreso = tresorerieInitiale

    // Délais de paiement (en mois, simplifié pour l'instant)
    // 0 = comptant, 30j = 1 mois, 60j = 2 mois
    const delayClientMonths = Math.ceil((previsionnel.hypotheses?.delaiPaiementClients || 30) / 30)
    const delayFournisseurMonths = Math.ceil((previsionnel.hypotheses?.delaiPaiementFournisseurs || 30) / 30)

    // Tableaux temporaires pour gérer les décalages
    const encaissementsCA = new Array(monthsCount + 12).fill(0) // Marge de sécurité
    const decaissementsAchats = new Array(monthsCount + 12).fill(0)
    const tvaCollectee = new Array(monthsCount + 12).fill(0)
    const tvaDeductible = new Array(monthsCount + 12).fill(0)

    // 1. Traitement du Chiffre d'Affaires (Encaissements + TVA Collectée)
    previsionnel.lignesCA.forEach(ligne => {
        const montants = ligne.montantsMensuels as number[]
        const tauxTVA = (ligne.tauxTVA || 0) / 100

        montants.forEach((montantHT, monthIdx) => {
            if (monthIdx >= monthsCount) return

            const montantTVA = montantHT * tauxTVA
            const montantTTC = montantHT + montantTVA

            // Encaissement décalé
            const encaissementMonth = monthIdx + delayClientMonths
            if (encaissementMonth < encaissementsCA.length) {
                encaissementsCA[encaissementMonth] += montantTTC
            }

            // TVA Collectée (Exigibilité à l'encaissement pour les services, au débit pour les biens ? 
            // Simplification Big 4: TVA sur les débits (facturation) sauf option. 
            // On va simplifier: TVA décalée de 1 mois pour paiement à l'état)
            tvaCollectee[monthIdx] += montantTVA
        })
    })

    // 2. Traitement des Charges (Décaissements + TVA Déductible)
    previsionnel.lignesCharge.forEach(ligne => {
        const montants = ligne.montantsMensuels as number[]
        const tauxTVA = (ligne.tauxTVA || 0) / 100

        montants.forEach((montantHT, monthIdx) => {
            if (monthIdx >= monthsCount) return

            const montantTVA = montantHT * tauxTVA
            const montantTTC = montantHT + montantTVA

            // Décaissement décalé
            const decaissementMonth = monthIdx + delayFournisseurMonths
            if (decaissementMonth < decaissementsAchats.length) {
                decaissementsAchats[decaissementMonth] += montantTTC
            }

            // TVA Déductible
            tvaDeductible[monthIdx] += montantTVA
        })
    })

    // 3. Construction du flux mois par mois
    for (let i = 0; i < monthsCount; i++) {
        // --- Encaissements ---
        const caTTC = encaissementsCA[i] || 0
        const apportCapital = 0 // TODO: Lier aux Financements
        const emprunt = 0 // TODO: Lier aux Financements

        const totalEncaissements = caTTC + apportCapital + emprunt

        // --- Décaissements ---
        const achatsTTC = decaissementsAchats[i] || 0

        // TVA à payer (Simplification: TVA Collectée M-1 - TVA Déductible M-1)
        // Si i=0, on suppose TVA M-1 = 0
        let tvaDecaissee = 0
        if (i > 0) {
            const soldeTVA = tvaCollectee[i - 1] - tvaDeductible[i - 1]
            tvaDecaissee = soldeTVA > 0 ? soldeTVA : 0 // Si crédit de TVA, on reporte (TODO: gestion report)
        }

        const totalDecaissements = achatsTTC + tvaDecaissee

        const soldeFlux = totalEncaissements - totalDecaissements
        currentTreso += soldeFlux

        flow.push({
            mois: i + 1,
            encaissements: {
                caTTC,
                apportCapital,
                emprunt,
                total: totalEncaissements
            },
            decaissements: {
                achatsTTC,
                chargesTTC: 0, // Inclus dans achatsTTC pour l'instant (simplifié)
                chargesSociales: 0, // TODO
                salairesNet: 0, // TODO
                tvaDecaissee,
                remboursementEmprunt: 0,
                total: totalDecaissements
            },
            soldeFlux,
            tresorerieFin: currentTreso
        })
    }

    return flow
}
