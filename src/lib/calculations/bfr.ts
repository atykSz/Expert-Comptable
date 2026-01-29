/**
 * Calculs du Besoin en Fonds de Roulement (BFR)
 * et du Plan de Trésorerie
 */

import { round2 } from '../utils'

export interface ParametresBFR {
    // En jours
    delaiStockMarchandises: number      // Rotation stock marchandises
    delaiStockMatieres: number          // Rotation stock matières
    delaiEncaissementClients: number    // Délai moyen de paiement clients
    delaiPaiementFournisseurs: number   // Délai moyen de paiement fournisseurs

    // En mois de charges
    decalageTVA: number                 // Décalage TVA (généralement 1 mois)
    decalageChargesSociales: number     // Décalage URSSAF (1-2 mois)
}

export interface DonneesBFR {
    // Chiffres annuels HT
    chiffreAffairesHT: number
    achatsHT: number
    chargesExternesHT: number
    chargesPersonnel: number

    // Taux
    tauxTVAVentes: number
    tauxTVAAchats: number
    tauxChargesSociales: number
}

export interface DetailBFR {
    // Actif circulant d'exploitation
    stockMarchandises: number
    stockMatieres: number
    creancesClients: number
    creancesTVA: number

    // Dettes d'exploitation
    dettesFournisseurs: number
    dettesChargesSociales: number
    dettesTVA: number

    // BFR
    actifCirculantExploitation: number
    dettesExploitation: number
    bfr: number
    bfrEnJoursCA: number
}

/**
 * Calculer le stock moyen en valeur
 * Stock = (Achats annuels / 365) * Nombre de jours de stock
 */
export function calculerStockMoyen(
    achatsAnnuels: number,
    joursStock: number
): number {
    return round2((achatsAnnuels / 365) * joursStock)
}

/**
 * Calculer les créances clients
 * Créances = (CA TTC / 365) * Délai encaissement
 */
export function calculerCreancesClients(
    caAnnuelHT: number,
    tauxTVA: number,
    joursEncaissement: number
): number {
    const caTTC = caAnnuelHT * (1 + tauxTVA / 100)
    return round2((caTTC / 365) * joursEncaissement)
}

/**
 * Calculer les dettes fournisseurs
 * Dettes = (Achats TTC / 365) * Délai paiement
 */
export function calculerDettesFournisseurs(
    achatsAnnuelsHT: number,
    tauxTVA: number,
    joursPaiement: number
): number {
    const achatsTTC = achatsAnnuelsHT * (1 + tauxTVA / 100)
    return round2((achatsTTC / 365) * joursPaiement)
}

/**
 * Calculer les dettes de charges sociales
 * Généralement 1 à 2 mois de charges
 */
export function calculerDettesChargesSociales(
    chargesPersonnelAnnuelles: number,
    tauxChargesSociales: number,
    moisDecalage: number
): number {
    const chargesSocialesAnnuelles = chargesPersonnelAnnuelles * (tauxChargesSociales / 100)
    return round2((chargesSocialesAnnuelles / 12) * moisDecalage)
}

/**
 * Calculer le BFR complet
 */
export function calculerBFR(
    donnees: DonneesBFR,
    parametres: ParametresBFR
): DetailBFR {
    // Stocks
    const stockMarchandises = calculerStockMoyen(
        donnees.achatsHT * 0.6, // Estimation marchandises = 60% des achats
        parametres.delaiStockMarchandises
    )
    const stockMatieres = calculerStockMoyen(
        donnees.achatsHT * 0.4, // Estimation matières = 40% des achats
        parametres.delaiStockMatieres
    )

    // Créances clients
    const creancesClients = calculerCreancesClients(
        donnees.chiffreAffairesHT,
        donnees.tauxTVAVentes,
        parametres.delaiEncaissementClients
    )

    // Créances TVA (généralement null ou faible)
    const creancesTVA = 0 // Peut être calculé si TVA déductible > collectée

    // Dettes fournisseurs
    const dettesFournisseurs = calculerDettesFournisseurs(
        donnees.achatsHT + donnees.chargesExternesHT,
        donnees.tauxTVAAchats,
        parametres.delaiPaiementFournisseurs
    )

    // Dettes charges sociales
    const dettesChargesSociales = calculerDettesChargesSociales(
        donnees.chargesPersonnel,
        donnees.tauxChargesSociales,
        parametres.decalageChargesSociales
    )

    // Dette TVA (TVA collectée - TVA déductible, décalage 1 mois)
    const tvaCollecteeMensuelle = (donnees.chiffreAffairesHT * donnees.tauxTVAVentes / 100) / 12
    const tvaDeductibleMensuelle = ((donnees.achatsHT + donnees.chargesExternesHT) * donnees.tauxTVAAchats / 100) / 12
    const dettesTVA = round2(Math.max(0, tvaCollecteeMensuelle - tvaDeductibleMensuelle) * parametres.decalageTVA)

    // Totaux
    const actifCirculantExploitation = round2(
        stockMarchandises + stockMatieres + creancesClients + creancesTVA
    )
    const dettesExploitation = round2(
        dettesFournisseurs + dettesChargesSociales + dettesTVA
    )

    const bfr = round2(actifCirculantExploitation - dettesExploitation)
    const bfrEnJoursCA = round2((bfr / donnees.chiffreAffairesHT) * 365)

    return {
        stockMarchandises,
        stockMatieres,
        creancesClients,
        creancesTVA,
        dettesFournisseurs,
        dettesChargesSociales,
        dettesTVA,
        actifCirculantExploitation,
        dettesExploitation,
        bfr,
        bfrEnJoursCA,
    }
}

/**
 * Calculer la variation du BFR entre deux périodes
 */
export function calculerVariationBFR(bfrN: number, bfrN1: number): number {
    return round2(bfrN - bfrN1)
}

// ========================
// PLAN DE TRÉSORERIE
// ========================

export interface LigneTresorerie {
    mois: string
    dateDebut: Date
    dateFin: Date

    // Encaissements
    encaissementsCA: number
    apportsCapital: number
    empruntsRecus: number
    subventions: number
    autresEncaissements: number
    totalEncaissements: number

    // Décaissements
    decaissementsAchats: number
    chargesExternes: number
    salaires: number
    chargesSociales: number
    tvaDecaissee: number
    impotsTaxes: number
    investissements: number
    remboursementsEmprunts: number
    dividendes: number
    autresDecaissements: number
    totalDecaissements: number

    // Solde
    soldeMensuel: number
    tresorerieDebut: number
    tresorerieFin: number
}

export interface DonneesTresorerieMensuelle {
    mois: number // 0-11
    annee: number
    caHT: number
    achatsHT: number
    chargesExternesHT: number
    salaires: number
    investissementsHT: number
    remboursementEmprunt: number
    apportCapital: number
    empruntRecu: number
    subvention: number
}

/**
 * Calculer le plan de trésorerie mensuel
 */
export function calculerPlanTresorerie(
    donneesMensuelles: DonneesTresorerieMensuelle[],
    parametres: ParametresBFR,
    tauxTVA: number,
    tauxChargesSociales: number,
    tresorerieInitiale: number = 0
): LigneTresorerie[] {
    const plan: LigneTresorerie[] = []
    let tresorerie = tresorerieInitiale

    // Buffers pour les décalages
    const bufferEncaissementsCA: number[] = []
    const bufferDecaissementsAchats: number[] = []
    const bufferChargesSociales: number[] = []
    const bufferTVA: number[] = []

    for (let i = 0; i < donneesMensuelles.length; i++) {
        const donnees = donneesMensuelles[i]
        const dateDebut = new Date(donnees.annee, donnees.mois, 1)
        const dateFin = new Date(donnees.annee, donnees.mois + 1, 0)
        const moisLabel = dateDebut.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })

        // Décalage des encaissements clients
        const delaiMoisClients = Math.floor(parametres.delaiEncaissementClients / 30)
        bufferEncaissementsCA.push(donnees.caHT * (1 + tauxTVA / 100))
        const encaissementsCA = i >= delaiMoisClients
            ? bufferEncaissementsCA[i - delaiMoisClients] || 0
            : 0

        // Décalage des décaissements fournisseurs
        const delaiMoisFournisseurs = Math.floor(parametres.delaiPaiementFournisseurs / 30)
        bufferDecaissementsAchats.push((donnees.achatsHT + donnees.chargesExternesHT) * (1 + tauxTVA / 100))
        const decaissementsAchats = i >= delaiMoisFournisseurs
            ? bufferDecaissementsAchats[i - delaiMoisFournisseurs] || 0
            : 0

        // Décalage des charges sociales
        bufferChargesSociales.push(donnees.salaires * (tauxChargesSociales / 100))
        const chargesSociales = i >= parametres.decalageChargesSociales
            ? bufferChargesSociales[i - parametres.decalageChargesSociales] || 0
            : 0

        // Décalage TVA
        const tvaCollectee = donnees.caHT * (tauxTVA / 100)
        const tvaDeductible = (donnees.achatsHT + donnees.chargesExternesHT + donnees.investissementsHT) * (tauxTVA / 100)
        bufferTVA.push(Math.max(0, tvaCollectee - tvaDeductible))
        const tvaDecaissee = i >= parametres.decalageTVA
            ? bufferTVA[i - parametres.decalageTVA] || 0
            : 0

        // Encaissements
        const totalEncaissements = round2(
            encaissementsCA +
            donnees.apportCapital +
            donnees.empruntRecu +
            donnees.subvention
        )

        // Décaissements
        const investissementsTTC = donnees.investissementsHT * (1 + tauxTVA / 100)
        const totalDecaissements = round2(
            decaissementsAchats +
            donnees.salaires +
            chargesSociales +
            tvaDecaissee +
            investissementsTTC +
            donnees.remboursementEmprunt
        )

        const soldeMensuel = round2(totalEncaissements - totalDecaissements)
        const tresorerieDebut = tresorerie
        tresorerie = round2(tresorerie + soldeMensuel)

        plan.push({
            mois: moisLabel,
            dateDebut,
            dateFin,
            encaissementsCA,
            apportsCapital: donnees.apportCapital,
            empruntsRecus: donnees.empruntRecu,
            subventions: donnees.subvention,
            autresEncaissements: 0,
            totalEncaissements,
            decaissementsAchats,
            chargesExternes: 0, // Inclus dans décaissementsAchats
            salaires: donnees.salaires,
            chargesSociales,
            tvaDecaissee,
            impotsTaxes: 0,
            investissements: investissementsTTC,
            remboursementsEmprunts: donnees.remboursementEmprunt,
            dividendes: 0,
            autresDecaissements: 0,
            totalDecaissements,
            soldeMensuel,
            tresorerieDebut,
            tresorerieFin: tresorerie,
        })
    }

    return plan
}
