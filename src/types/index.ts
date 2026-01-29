/**
 * Types TypeScript pour le SAAS Expert-Comptable
 */

// ========================
// TYPES DE BASE
// ========================

export type StatutPrevisionnel = 'BROUILLON' | 'EN_REVISION' | 'VALIDE' | 'ARCHIVE'

export type FormeJuridique =
    | 'EI' | 'EIRL' | 'EURL' | 'SARL' | 'SAS' | 'SASU'
    | 'SA' | 'SNC' | 'SCI' | 'MICRO' | 'AUTO_ENTREPRENEUR'

export type RegimeFiscal = 'IS' | 'IR' | 'MICRO_BIC' | 'MICRO_BNC'

export type RegimeTVA = 'FRANCHISE' | 'REEL_SIMPLIFIE' | 'REEL_NORMAL' | 'MINI_REEL'

// ========================
// PRÉVISIONNEL
// ========================

export interface Previsionnel {
    id: string
    clientId: string
    titre: string
    description?: string
    statut: StatutPrevisionnel
    dateDebut: Date
    nombreMois: number
    hypotheses?: Hypotheses
    lignesCA: LigneCA[]
    lignesCharge: LigneCharge[]
    investissements: Investissement[]
    financements: Financement[]
    effectifs: Effectif[]
    createdAt: Date
    updatedAt: Date
}

export interface Hypotheses {
    id: string
    previsionnelId: string
    tauxTVAVentes: number
    tauxTVAAchats: number
    delaiPaiementClients: number
    delaiPaiementFournisseurs: number
    tauxChargesSocialesPatronales: number
    tauxChargesSocialesSalariales: number
    tauxIS: number
    tauxIR?: number
    dureeStockJours: number
}

// ========================
// CHIFFRE D'AFFAIRES
// ========================

export type CategorieCA =
    | 'VENTE_MARCHANDISES'
    | 'PRODUCTION_VENDUE_BIENS'
    | 'PRODUCTION_VENDUE_SERVICES'
    | 'PRESTATIONS_SERVICES'
    | 'SUBVENTIONS'
    | 'AUTRES_PRODUITS'

export interface LigneCA {
    id: string
    previsionnelId: string
    libelle: string
    categorie: CategorieCA
    comptePCG: string
    montantsMensuels: number[]
    evolutionAn2: number
    evolutionAn3: number
    tauxTVA: number
}

// ========================
// CHARGES
// ========================

export type CategorieCharge =
    | 'ACHATS_MARCHANDISES'
    | 'ACHATS_MATIERES_PREMIERES'
    | 'ACHATS_FOURNITURES'
    | 'SOUS_TRAITANCE'
    | 'LOCATIONS'
    | 'ENTRETIEN_REPARATIONS'
    | 'ASSURANCES'
    | 'DOCUMENTATION'
    | 'HONORAIRES'
    | 'PUBLICITE'
    | 'TRANSPORTS'
    | 'DEPLACEMENTS'
    | 'FRAIS_POSTAUX_TELECOM'
    | 'SERVICES_BANCAIRES'
    | 'AUTRES_SERVICES'
    | 'IMPOTS_TAXES'
    | 'CFE'
    | 'CVAE'
    | 'INTERETS_EMPRUNTS'
    | 'CHARGES_EXCEPTIONNELLES'

export type TypeCharge = 'FIXE' | 'VARIABLE'

export type Recurrence = 'MENSUEL' | 'TRIMESTRIEL' | 'SEMESTRIEL' | 'ANNUEL' | 'PONCTUEL'

export interface LigneCharge {
    id: string
    previsionnelId: string
    libelle: string
    categorie: CategorieCharge
    comptePCG: string
    typeCharge: TypeCharge
    montantsMensuels: number[]
    evolutionAn2: number
    evolutionAn3: number
    tauxTVA?: number
    deductibleTVA: boolean
    recurrence: Recurrence
}

// ========================
// INVESTISSEMENTS
// ========================

export type CategorieInvestissement =
    | 'FRAIS_ETABLISSEMENT'
    | 'CONCESSIONS_BREVETS'
    | 'FONDS_COMMERCIAL'
    | 'LOGICIELS'
    | 'TERRAINS'
    | 'CONSTRUCTIONS'
    | 'INSTALLATIONS_TECHNIQUES'
    | 'MATERIEL_INDUSTRIEL'
    | 'MATERIEL_TRANSPORT'
    | 'MATERIEL_BUREAU'
    | 'MOBILIER'
    | 'AGENCEMENTS'

export type ModeAmortissement = 'LINEAIRE' | 'DEGRESSIF' | 'NON_AMORTISSABLE'

export interface Investissement {
    id: string
    previsionnelId: string
    libelle: string
    categorie: CategorieInvestissement
    comptePCG: string
    montantHT: number
    tauxTVA: number
    dateAcquisition: Date
    dureeAmortissement: number
    modeAmortissement: ModeAmortissement
    valeurResiduelle: number
}

// ========================
// FINANCEMENTS
// ========================

export type TypeFinancement =
    | 'CAPITAL_SOCIAL'
    | 'COMPTE_COURANT_ASSOCIE'
    | 'EMPRUNT_BANCAIRE'
    | 'CREDIT_BAIL'
    | 'PRET_HONNEUR'
    | 'SUBVENTION'
    | 'CROWDFUNDING'
    | 'LOVE_MONEY'

export interface Financement {
    id: string
    previsionnelId: string
    libelle: string
    type: TypeFinancement
    montant: number
    dateDebut: Date
    duree?: number
    tauxInteret?: number
    differe?: number
    echeancier?: EcheanceEmprunt[]
}

export interface EcheanceEmprunt {
    numero: number
    date: Date
    capitalDebut: number
    amortissement: number
    interets: number
    mensualite: number
    capitalFin: number
}

// ========================
// EFFECTIFS
// ========================

export type TypeContrat = 'CDI' | 'CDD' | 'ALTERNANCE' | 'STAGE' | 'INTERIM' | 'DIRIGEANT'

export interface Effectif {
    id: string
    previsionnelId: string
    poste: string
    typeContrat: TypeContrat
    salaireBrutMensuel: number
    primes: number
    dateEmbauche: Date
    dateFin?: Date
    tauxChargesPatronales: number
}

// ========================
// RÉSULTATS CALCULÉS
// ========================

export interface CompteResultatAnnuel {
    annee: number

    // Produits
    chiffreAffairesHT: number
    productionStockee: number
    productionImmobilisee: number
    subventionsExploitation: number
    autresProduits: number
    totalProduits: number

    // Charges
    achats: number
    variationStocks: number
    servicesExterieurs: number
    impotsTaxes: number
    chargesPersonnel: number
    dotationsAmortissements: number
    autresCharges: number
    chargesFinancieres: number
    chargesExceptionnelles: number
    totalCharges: number

    // Soldes Intermédiaires
    margeCommerciale: number
    valeurAjoutee: number
    EBE: number
    resultatExploitation: number
    resultatFinancier: number
    resultatCourant: number
    resultatExceptionnel: number
    impotSurBenefices: number
    resultatNet: number
    CAF: number
}

export interface BilanAnnuel {
    annee: number

    // Actif
    actifImmobilise: number
    actifCirculant: number
    disponibilites: number
    totalActif: number

    // Passif
    capitauxPropres: number
    dettesFinancieres: number
    dettesExploitation: number
    totalPassif: number
}

export interface IndicateursCles {
    // Rentabilité
    margeNette: number           // Résultat net / CA
    rentabiliteEconomique: number // RE / Actif économique
    rentabiliteFinanciere: number // RN / Capitaux propres

    // Structure
    tauxEndettement: number      // Dettes / Capitaux propres
    autonomieFinanciere: number  // Capitaux propres / Total bilan
    capaciteRemboursement: number // Dettes / CAF

    // Activité
    tauxMargeCommerciale: number
    tauxValeurAjoutee: number
    seuilRentabilite: number
    pointMort: number            // En mois

    // BFR
    bfrEnJoursCA: number
    rotationStocks: number
    delaiClients: number
    delaiFournisseurs: number
}
