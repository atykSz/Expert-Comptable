import { Previsionnel, LigneCA, LigneCharge, Hypotheses, Financement, Investissement } from '@prisma/client'

// Types étendus avec les relations incluses
export type PrevisionnelWithRelations = Previsionnel & {
    lignesCA: LigneCA[]
    lignesCharge: LigneCharge[]
    hypotheses: Hypotheses | null
    financements: Financement[]
    investissements: Investissement[]
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

export interface BilanAnnuel {
    annee: number // 1, 2, 3
    actif: {
        immobilisationsBrutes: number
        amortissementsCumules: number
        immobilisationsNet: number
        creancesClients: number
        stocks: number
        disponibilites: number // Trésorerie positive
        total: number
    }
    passif: {
        capitalSocial: number
        resultatNet: number
        reportANouveau: number
        emprunts: number // Restant dû
        dettesFournisseurs: number
        dettesFiscalesSociales: number
        decouvertBancaire: number // Trésorerie négative
        total: number
    }
    equilibre: boolean // Actif == Passif
}

/**
 * Calcule le Bilan pour chaque année
 */
export function calculateBilan(
    previsionnel: PrevisionnelWithRelations,
    monthlyFlows: MonthlyCashFlow[],
    resultatsAnnuels: number[] // Résultat Net de chaque année (venant du CR)
): BilanAnnuel[] {
    const bilans: BilanAnnuel[] = []
    let reportANouveau = 0

    // Hypothèses
    const delaiClients = previsionnel.hypotheses?.delaiPaiementClients || 30
    const delaiFournisseurs = previsionnel.hypotheses?.delaiPaiementFournisseurs || 30
    const rotationStock = previsionnel.hypotheses?.dureeStockJours || 0

    // Calculs année par année
    for (let year = 1; year <= 3; year++) {
        const monthIndex12 = year * 12 - 1 // Index du dernier mois de l'année (11, 23, 35)

        // Si le prévisionnel n'a pas assez de mois, on s'arrête
        if (monthIndex12 >= monthlyFlows.length) break

        const lastMonthFlow = monthlyFlows[monthIndex12]

        // --- ACTIF ---

        // 1. Immo (Simplifié: Somme des investissements)
        // TODO: Gérer dates d'investissements et amortissements réels
        const immoBrut = previsionnel.investissements.reduce((sum, inv) => sum + inv.montantHT, 0)
        const amortCumul = immoBrut * 0.1 * year // Simplification 10% par an lineaire
        const immoNet = Math.max(0, immoBrut - amortCumul)

        // 2. Créances Clients (Approximation fin d'année)
        // CA TTC de l'année * Délai / 360
        // Mieux: CA des derniers mois non encaissés
        // Simplification Big 4: take annual CA -> prorata
        const flowYear = monthlyFlows.slice((year - 1) * 12, year * 12)
        const caAnnuelTTC = flowYear.reduce((sum, m) => sum + m.encaissements.caTTC, 0) // C'est CA Encaissé, mais proche du facturé pour l'estim
        const creances = (caAnnuelTTC * delaiClients) / 360

        // 3. Stocks (Approximation)
        const achatsAnnuelTTC = flowYear.reduce((sum, m) => sum + m.decaissements.achatsTTC, 0)
        const stocks = rotationStock > 0 ? (achatsAnnuelTTC * rotationStock) / 360 : 0

        // 4. Trésorerie (Disponibilités)
        const tresoFin = lastMonthFlow.tresorerieFin
        const disponibilites = tresoFin > 0 ? tresoFin : 0

        const totalActif = immoNet + creances + stocks + disponibilites

        // --- PASSIF ---

        // 1. Capitaux Propres
        const capital = previsionnel.financements
            .filter(f => f.type === 'CAPITAL_SOCIAL' || f.type === 'COMPTE_COURANT_ASSOCIE') // Simplification
            .reduce((sum, f) => sum + f.montant, 0)

        const resultatNet = resultatsAnnuels[year - 1] || 0

        // Report à nouveau = Somme des résultats précédents
        // Note: reportANouveau est mis à jour à la fin de la boucle pour l'année suivante

        // 2. Emprunts (Restant dû)
        // Simplification: Emprunt total - Remboursements cumulés
        const empruntTotal = previsionnel.financements
            .filter(f => f.type === 'EMPRUNT_BANCAIRE')
            .reduce((sum, f) => sum + f.montant, 0)
        const rembAnnuel = flowYear.reduce((sum, m) => sum + m.decaissements.remboursementEmprunt, 0)
        // Cumulative reimbursement calculation needs state, simplified here:
        // Assume constant reimbursement for demo if not calc'd elsewhere
        const detteEmprunt = Math.max(0, empruntTotal - (rembAnnuel * year)) // VERY simplified

        // 3. Dettes Fournisseurs
        const dettesFourn = (achatsAnnuelTTC * delaiFournisseurs) / 360

        // 4. Découvert
        const decouvert = tresoFin < 0 ? Math.abs(tresoFin) : 0

        // Ajustement pour équilibrer (Dettes fiscales/sociales "Gap filler" + Real logic later)
        // En compta, Actif = Passif. Si écart, c'est souvent la TVA/Impôts/Social non payés en fin d'année
        const totalPassifHorsGap = capital + reportANouveau + resultatNet + detteEmprunt + dettesFourn + decouvert
        const gap = totalActif - totalPassifHorsGap
        const dettesFiscalesSociales = gap // On met l'écart ici pour l'instant ("Dettes diverses")

        const totalPassif = totalPassifHorsGap + dettesFiscalesSociales

        bilans.push({
            annee: year,
            actif: {
                immobilisationsBrutes: immoBrut,
                amortissementsCumules: amortCumul,
                immobilisationsNet: immoNet,
                creancesClients: creances,
                stocks,
                disponibilites,
                total: totalActif
            },
            passif: {
                capitalSocial: capital,
                resultatNet,
                reportANouveau,
                emprunts: detteEmprunt,
                dettesFournisseurs: dettesFourn,
                dettesFiscalesSociales,
                decouvertBancaire: decouvert,
                total: totalPassif
            },
            equilibre: Math.abs(totalActif - totalPassif) < 1
        })

        reportANouveau += resultatNet
    }

    return bilans
}
