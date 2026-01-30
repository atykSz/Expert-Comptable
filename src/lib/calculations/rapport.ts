/**
 * Fonctions de calcul pour le rapport prévisionnel
 * Transforme les données Prisma en résultats financiers
 */

import type {
    Previsionnel,
    Hypotheses,
    Investissement,
    CompteResultatAnnuel,
    BilanAnnuel,
    IndicateursCles
} from '@/types'

// Types pour les données Prisma avec JSON
interface LigneCAData {
    id: string
    libelle: string
    categorie: string
    comptePCG: string
    montantsMensuels: number[] | unknown
    evolutionAn2: number
    evolutionAn3: number
    tauxTVA: number
}

interface LigneChargeData {
    id: string
    libelle: string
    categorie: string
    comptePCG: string
    typeCharge: string
    montantsMensuels: number[] | unknown
    evolutionAn2: number
    evolutionAn3: number
    tauxTVA: number | null
    deductibleTVA: boolean
    recurrence: string
}

interface FinancementData {
    id: string
    libelle: string
    type: string
    montant: number
    dateDebut: Date | string
    duree: number | null
    tauxInteret: number | null
    differe: number | null
    echeancier: unknown
}

interface EffectifData {
    id: string
    poste: string
    typeContrat: string
    salaireBrutMensuel: number
    primes: number
    dateEmbauche: Date | string
    dateFin: Date | string | null
    tauxChargesPatronales: number
}

interface InvestissementData {
    id: string
    libelle: string
    categorie: string
    comptePCG: string
    montantHT: number
    tauxTVA: number
    dateAcquisition: Date | string
    dureeAmortissement: number
    modeAmortissement: string
    valeurResiduelle: number
}

interface PrevisionnelData {
    id: string
    clientId: string
    titre: string
    description: string | null
    statut: string
    dateDebut: Date | string
    nombreMois: number
    regimeFiscal: string
    formatDocument: string
    client: {
        id: string
        raisonSociale: string
        formeJuridique: string
        secteurActivite?: string
    }
    hypotheses: {
        tauxTVAVentes: number
        tauxTVAAchats: number
        delaiPaiementClients: number
        delaiPaiementFournisseurs: number
        tauxChargesSocialesPatronales: number
        tauxChargesSocialesSalariales: number
        tauxIS: number
        dureeStockJours: number
    } | null
    lignesCA: LigneCAData[]
    lignesCharge: LigneChargeData[]
    investissements: InvestissementData[]
    financements: FinancementData[]
    effectifs: EffectifData[]
}

/**
 * Parse les montants mensuels depuis le format JSON Prisma
 */
function parseMontantsMensuels(data: unknown): number[] {
    if (Array.isArray(data)) {
        return data.map(v => typeof v === 'number' ? v : 0)
    }
    return Array(12).fill(0)
}

/**
 * Calcule le chiffre d'affaires annuel pour une année donnée
 */
export function calculerCAAnnuel(
    lignesCA: LigneCAData[],
    annee: number, // 1, 2 ou 3
    nombreMoisAn1: number = 12
): number {
    let total = 0

    for (const ligne of lignesCA) {
        const montantsMensuels = parseMontantsMensuels(ligne.montantsMensuels)
        const montantAn1 = montantsMensuels.slice(0, nombreMoisAn1).reduce((a, b) => a + b, 0)

        if (annee === 1) {
            total += montantAn1
        } else if (annee === 2) {
            const evolution = 1 + (ligne.evolutionAn2 || 0) / 100
            total += montantAn1 * (12 / nombreMoisAn1) * evolution
        } else if (annee === 3) {
            const evolutionAn2 = 1 + (ligne.evolutionAn2 || 0) / 100
            const evolutionAn3 = 1 + (ligne.evolutionAn3 || 0) / 100
            total += montantAn1 * (12 / nombreMoisAn1) * evolutionAn2 * evolutionAn3
        }
    }

    return Math.round(total)
}

/**
 * Calcule les charges annuelles pour une année donnée
 */
export function calculerChargesAnnuelles(
    lignesCharge: LigneChargeData[],
    annee: number,
    nombreMoisAn1: number = 12
): number {
    let total = 0

    for (const ligne of lignesCharge) {
        const montantsMensuels = parseMontantsMensuels(ligne.montantsMensuels)
        const montantAn1 = montantsMensuels.slice(0, nombreMoisAn1).reduce((a, b) => a + b, 0)

        if (annee === 1) {
            total += montantAn1
        } else if (annee === 2) {
            const evolution = 1 + (ligne.evolutionAn2 || 0) / 100
            total += montantAn1 * (12 / nombreMoisAn1) * evolution
        } else if (annee === 3) {
            const evolutionAn2 = 1 + (ligne.evolutionAn2 || 0) / 100
            const evolutionAn3 = 1 + (ligne.evolutionAn3 || 0) / 100
            total += montantAn1 * (12 / nombreMoisAn1) * evolutionAn2 * evolutionAn3
        }
    }

    return Math.round(total)
}

/**
 * Calcule les charges de personnel annuelles
 */
export function calculerChargesPersonnel(
    effectifs: EffectifData[],
    annee: number,
    tauxChargesPatronales: number = 45,
    dateDebutPrev: Date
): number {
    let total = 0
    const anneeDebut = new Date(dateDebutPrev).getFullYear()
    const anneeCalcul = anneeDebut + annee - 1

    for (const effectif of effectifs) {
        const dateEmbauche = new Date(effectif.dateEmbauche)
        const dateFin = effectif.dateFin ? new Date(effectif.dateFin) : null

        // Calculer le nombre de mois travaillés dans l'année
        let moisDebut = 1
        let moisFin = 12

        if (dateEmbauche.getFullYear() === anneeCalcul) {
            moisDebut = dateEmbauche.getMonth() + 1
        } else if (dateEmbauche.getFullYear() > anneeCalcul) {
            continue // Pas encore embauché
        }

        if (dateFin) {
            if (dateFin.getFullYear() === anneeCalcul) {
                moisFin = dateFin.getMonth() + 1
            } else if (dateFin.getFullYear() < anneeCalcul) {
                continue // Déjà parti
            }
        }

        const moisTravailles = Math.max(0, moisFin - moisDebut + 1)
        const salaireBrut = effectif.salaireBrutMensuel * moisTravailles
        const primes = effectif.primes * (moisTravailles / 12)
        const tauxCharges = effectif.tauxChargesPatronales || tauxChargesPatronales
        const chargesPatronales = (salaireBrut + primes) * (tauxCharges / 100)

        total += salaireBrut + primes + chargesPatronales
    }

    return Math.round(total)
}

/**
 * Calcule les dotations aux amortissements annuelles
 */
export function calculerDotationsAmortissements(
    investissements: InvestissementData[],
    annee: number,
    dateDebutPrev: Date
): number {
    let total = 0
    const anneeDebut = new Date(dateDebutPrev).getFullYear()
    const anneeCalcul = anneeDebut + annee - 1

    for (const inv of investissements) {
        if (inv.modeAmortissement === 'NON_AMORTISSABLE') continue

        const dateAcquisition = new Date(inv.dateAcquisition)
        const moisAcquisition = dateAcquisition.getMonth()
        const anneeAcquisition = dateAcquisition.getFullYear()

        // Durée en années
        const dureeAnnees = inv.dureeAmortissement / 12
        if (dureeAnnees === 0) continue

        const baseAmortissable = inv.montantHT - (inv.valeurResiduelle || 0)
        const amortissementAnnuel = baseAmortissable / dureeAnnees

        // Prorata la première année
        if (anneeAcquisition === anneeCalcul) {
            const moisRestants = 12 - moisAcquisition
            total += amortissementAnnuel * (moisRestants / 12)
        } else if (anneeAcquisition < anneeCalcul) {
            // Vérifier si encore en cours d'amortissement
            const moisDepuisAcquisition = (anneeCalcul - anneeAcquisition) * 12 + (12 - moisAcquisition)
            if (moisDepuisAcquisition <= inv.dureeAmortissement) {
                // Année complète ou dernière année
                const moisRestants = inv.dureeAmortissement - moisDepuisAcquisition + 12
                if (moisRestants >= 12) {
                    total += amortissementAnnuel
                } else if (moisRestants > 0) {
                    total += amortissementAnnuel * (moisRestants / 12)
                }
            }
        }
    }

    return Math.round(total)
}

/**
 * Calcule les charges financières (intérêts d'emprunt)
 */
export function calculerChargesFinancieres(
    financements: FinancementData[],
    annee: number,
    dateDebutPrev: Date
): number {
    let total = 0
    const anneeDebut = new Date(dateDebutPrev).getFullYear()
    const anneeCalcul = anneeDebut + annee - 1

    for (const fin of financements) {
        if (fin.type !== 'EMPRUNT_BANCAIRE' && fin.type !== 'CREDIT_BAIL') continue
        if (!fin.tauxInteret || !fin.duree) continue

        const dateDebut = new Date(fin.dateDebut)
        const anneeDebutEmprunt = dateDebut.getFullYear()

        if (anneeDebutEmprunt > anneeCalcul) continue

        // Calcul simplifié des intérêts
        const capitalInitial = fin.montant
        const tauxMensuel = (fin.tauxInteret / 100) / 12
        const nombreMensualites = fin.duree

        // Mensualité constante (formule d'amortissement)
        const mensualite = capitalInitial * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -nombreMensualites))

        // Position dans le remboursement
        const moisEcoules = (anneeCalcul - anneeDebutEmprunt) * 12
        const moisCetteAnnee = Math.min(12, nombreMensualites - moisEcoules)

        if (moisCetteAnnee <= 0) continue

        // Estimer les intérêts de l'année (approximation)
        let capitalRestant = capitalInitial
        for (let i = 0; i < moisEcoules; i++) {
            const interets = capitalRestant * tauxMensuel
            const amortissement = mensualite - interets
            capitalRestant -= amortissement
        }

        // Intérêts de l'année en cours
        let interessAnnee = 0
        for (let i = 0; i < moisCetteAnnee; i++) {
            const interets = capitalRestant * tauxMensuel
            interessAnnee += interets
            const amortissement = mensualite - interets
            capitalRestant -= amortissement
        }

        total += interessAnnee
    }

    return Math.round(total)
}

/**
 * Génère le compte de résultat pour les 3 années
 */
export function genererComptesResultat(data: PrevisionnelData): CompteResultatAnnuel[] {
    const dateDebut = new Date(data.dateDebut)
    const hypotheses = data.hypotheses
    const tauxIS = hypotheses?.tauxIS || 25

    const comptes: CompteResultatAnnuel[] = []

    for (let annee = 1; annee <= 3; annee++) {
        // Calculer les différentes composantes
        const chiffreAffaires = calculerCAAnnuel(data.lignesCA, annee)
        const chargesExternes = calculerChargesAnnuelles(data.lignesCharge, annee)
        const chargesPersonnel = calculerChargesPersonnel(
            data.effectifs,
            annee,
            hypotheses?.tauxChargesSocialesPatronales || 45,
            dateDebut
        )
        const dotationsAmortissements = calculerDotationsAmortissements(data.investissements, annee, dateDebut)
        const chargesFinancieres = calculerChargesFinancieres(data.financements, annee, dateDebut)

        // Calculs intermédiaires
        const valeurAjoutee = chiffreAffaires - chargesExternes
        const ebe = valeurAjoutee - chargesPersonnel
        const resultatExploitation = ebe - dotationsAmortissements
        const resultatCourant = resultatExploitation - chargesFinancieres

        // Impôt (seulement si bénéfice)
        const impotSurBenefices = resultatCourant > 0
            ? Math.round(resultatCourant * tauxIS / 100)
            : 0

        const resultatNet = resultatCourant - impotSurBenefices
        const caf = resultatNet + dotationsAmortissements

        comptes.push({
            annee: dateDebut.getFullYear() + annee - 1,
            chiffreAffairesHT: chiffreAffaires,
            productionStockee: 0,
            productionImmobilisee: 0,
            subventionsExploitation: 0,
            autresProduits: 0,
            totalProduits: chiffreAffaires,
            achats: Math.round(chargesExternes * 0.6), // Estimation
            variationStocks: 0,
            servicesExterieurs: Math.round(chargesExternes * 0.4),
            impotsTaxes: Math.round(chiffreAffaires * 0.02), // CFE/CVAE estimée
            chargesPersonnel,
            dotationsAmortissements,
            autresCharges: 0,
            chargesFinancieres,
            chargesExceptionnelles: 0,
            totalCharges: chargesExternes + chargesPersonnel + dotationsAmortissements + chargesFinancieres,
            margeCommerciale: chiffreAffaires - Math.round(chargesExternes * 0.6),
            valeurAjoutee,
            EBE: ebe,
            resultatExploitation,
            resultatFinancier: -chargesFinancieres,
            resultatCourant,
            resultatExceptionnel: 0,
            impotSurBenefices,
            resultatNet,
            CAF: caf,
        })
    }

    return comptes
}

/**
 * Génère les indicateurs clés
 */
export function genererIndicateurs(
    comptesResultat: CompteResultatAnnuel[],
    hypotheses: PrevisionnelData['hypotheses']
): IndicateursCles {
    const an1 = comptesResultat[0]
    const an3 = comptesResultat[2]

    // Seuil de rentabilité = Charges fixes / Taux de marge sur coûts variables
    const chargesFixes = an1.chargesPersonnel + an1.dotationsAmortissements + an1.chargesFinancieres
    const tauxMarge = an1.valeurAjoutee / an1.chiffreAffairesHT || 0
    const seuilRentabilite = tauxMarge > 0 ? Math.round(chargesFixes / tauxMarge) : 0

    // Point mort en mois
    const caMensuel = an1.chiffreAffairesHT / 12
    const pointMort = caMensuel > 0 ? Math.round((seuilRentabilite / caMensuel) * 10) / 10 : 0

    return {
        margeNette: an1.chiffreAffairesHT > 0
            ? Math.round((an1.resultatNet / an1.chiffreAffairesHT) * 10000) / 100
            : 0,
        rentabiliteEconomique: 0, // Nécessite bilan
        rentabiliteFinanciere: 0, // Nécessite bilan
        tauxEndettement: 0,
        autonomieFinanciere: 0,
        capaciteRemboursement: 0,
        tauxMargeCommerciale: an1.chiffreAffairesHT > 0
            ? Math.round((an1.margeCommerciale / an1.chiffreAffairesHT) * 10000) / 100
            : 0,
        tauxValeurAjoutee: an1.chiffreAffairesHT > 0
            ? Math.round((an1.valeurAjoutee / an1.chiffreAffairesHT) * 10000) / 100
            : 0,
        seuilRentabilite,
        pointMort,
        bfrEnJoursCA: hypotheses?.delaiPaiementClients || 30,
        rotationStocks: hypotheses?.dureeStockJours || 30,
        delaiClients: hypotheses?.delaiPaiementClients || 30,
        delaiFournisseurs: hypotheses?.delaiPaiementFournisseurs || 30,
    }
}

/**
 * Génère la trésorerie mensuelle (année 1)
 */
export function genererTresorerieMensuelle(
    data: PrevisionnelData
): { mois: number; encaissements: number; decaissements: number; solde: number; cumulatif: number }[] {
    const tresorerie = []
    let cumulatif = 0

    // Calculer les apports initiaux (financements)
    const apportsInitiaux = data.financements.reduce((total, fin) => {
        if (fin.type === 'CAPITAL_SOCIAL' || fin.type === 'COMPTE_COURANT_ASSOCIE' || fin.type === 'EMPRUNT_BANCAIRE') {
            return total + fin.montant
        }
        return total
    }, 0)

    // Calculer les investissements initiaux
    const investissementsInitiaux = data.investissements.reduce((total, inv) => {
        return total + inv.montantHT * (1 + inv.tauxTVA / 100)
    }, 0)

    for (let mois = 1; mois <= 12; mois++) {
        // Encaissements = CA du mois (avec délai de paiement)
        let encaissements = 0
        const delaiClients = data.hypotheses?.delaiPaiementClients || 30
        const moisDecalage = Math.round(delaiClients / 30)

        for (const ligne of data.lignesCA) {
            const montants = parseMontantsMensuels(ligne.montantsMensuels)
            const moisCA = mois - moisDecalage
            if (moisCA >= 1 && moisCA <= 12) {
                encaissements += (montants[moisCA - 1] || 0) * (1 + ligne.tauxTVA / 100)
            }
        }

        // Ajouter les apports au mois 1
        if (mois === 1) {
            encaissements += apportsInitiaux
        }

        // Décaissements = Charges du mois + Investissements au mois 1
        let decaissements = 0
        for (const ligne of data.lignesCharge) {
            const montants = parseMontantsMensuels(ligne.montantsMensuels)
            decaissements += montants[mois - 1] || 0
        }

        // Ajouter charges de personnel mensuelles
        const chargesPersoAnnuelles = calculerChargesPersonnel(
            data.effectifs,
            1,
            data.hypotheses?.tauxChargesSocialesPatronales || 45,
            new Date(data.dateDebut)
        )
        decaissements += chargesPersoAnnuelles / 12

        // Investissements au mois 1
        if (mois === 1) {
            decaissements += investissementsInitiaux
        }

        const solde = Math.round(encaissements - decaissements)
        cumulatif += solde

        tresorerie.push({
            mois,
            encaissements: Math.round(encaissements),
            decaissements: Math.round(decaissements),
            solde,
            cumulatif: Math.round(cumulatif),
        })
    }

    return tresorerie
}

/**
 * Transforme les données Prisma en format pour le rapport
 */
export function transformerPourRapport(data: PrevisionnelData) {
    const dateDebut = new Date(data.dateDebut)
    const comptesResultat = genererComptesResultat(data)
    const indicateurs = genererIndicateurs(comptesResultat, data.hypotheses)
    const tresorerie = genererTresorerieMensuelle(data)

    // Mapper les investissements
    const investissementsMapped = data.investissements.map(inv => ({
        libelle: inv.libelle,
        categorie: inv.categorie,
        montantHT: inv.montantHT,
        dateAcquisition: new Date(inv.dateAcquisition).toLocaleDateString('fr-FR'),
        dureeAmortissement: inv.dureeAmortissement,
        amortissementAnnuel: inv.modeAmortissement !== 'NON_AMORTISSABLE'
            ? Math.round((inv.montantHT - inv.valeurResiduelle) / (inv.dureeAmortissement / 12))
            : 0,
    }))

    // Calculer les totaux
    const caAn1 = comptesResultat[0]?.chiffreAffairesHT || 0
    const caAn2 = comptesResultat[1]?.chiffreAffairesHT || 0
    const caAn3 = comptesResultat[2]?.chiffreAffairesHT || 0
    const resultatCumule = comptesResultat.reduce((sum, cr) => sum + cr.resultatNet, 0)
    const tresorerieFinAn1 = tresorerie[11]?.cumulatif || 0

    return {
        entreprise: {
            raisonSociale: data.client.raisonSociale,
            formeJuridique: data.client.formeJuridique,
            secteurActivite: data.client.secteurActivite || 'Non spécifié',
        },
        previsionnel: {
            titre: data.titre,
            dateDebut: dateDebut.toLocaleDateString('fr-FR'),
            nombreMois: data.nombreMois,
            annees: [
                dateDebut.getFullYear(),
                dateDebut.getFullYear() + 1,
                dateDebut.getFullYear() + 2,
            ],
        },
        synthese: {
            caTotal: caAn1 + caAn2 + caAn3,
            caAn1,
            caAn2,
            caAn3,
            resultatCumule,
            tresorerieFinAn1,
            seuilRentabilite: indicateurs.seuilRentabilite,
        },
        indicateurs: {
            margeNette: `${indicateurs.margeNette}%`,
            seuilRentabilite: indicateurs.seuilRentabilite,
            pointMort: indicateurs.pointMort,
            tauxTVA: data.hypotheses?.tauxTVAVentes || 20,
            tauxCharges: data.hypotheses?.tauxChargesSocialesPatronales || 45,
            tauxIS: data.hypotheses?.tauxIS || 25,
            delaiClients: data.hypotheses?.delaiPaiementClients || 30,
            delaiFournisseurs: data.hypotheses?.delaiPaiementFournisseurs || 30,
        },
        comptesResultat,
        investissements: investissementsMapped,
        tresorerie,
    }
}
