// Types pour le rapport prévisionnel

export interface DonneesRapport {
    entreprise: {
        raisonSociale: string
        formeJuridique: string
        secteurActivite: string
        dateCreation: string
        adresse?: string
        effectif?: number
    }
    previsionnel: {
        titre: string
        dateDebut: string
        duree: number
        dateGeneration: string
    }
    projet?: {
        description?: string
        objectifs?: string[]
    }
    investissements: {
        libelle: string
        categorie: string
        montantHT: number
        dateAcquisition: string
        dureeAmortissement: number
        amortissementAnnuel: number
    }[]
    amortissementsCumules: { annee: number; dotation: number; cumul: number }[]
    compteResultat: {
        annee: number
        ca: number
        achats: number
        servicesExterieurs: number
        chargesPersonnel: number
        impotsTaxes: number
        dotationsAmortissements: number
        chargesFinancieres: number
        autresCharges: number
        totalCharges: number
        ebe: number
        resultatExploitation: number
        resultatNet: number
        caf: number
        tresorerieFin: number
    }[]
    sig: {
        annee: number
        margeCommerciale: number
        productionExercice: number
        valeurAjoutee: number
        ebe: number
        resultatExploitation: number
        resultatCourant: number
        resultatNet: number
        caf: number
    }[]
    bilan: {
        annee: number
        actifImmobilise: number
        actifCirculant: number
        stocks: number
        creancesClients: number
        disponibilites: number
        totalActif: number
        capitalSocial: number
        reserves: number
        resultat: number
        capitauxPropres: number
        emprunts: number
        dettesFournisseurs: number
        autresDettes: number
        totalPassif: number
    }[]
    financement: {
        annee: number
        caf: number
        apports: number
        emprunts: number
        cessionActifs: number
        totalRessources: number
        investissements: number
        remboursementEmprunts: number
        dividendes: number
        variationBFR: number
        totalEmplois: number
        variationTresorerie: number
        tresorerieDebut: number
        tresorerieFin: number
    }[]
    tresorerieMensuelle: {
        mois: string
        encaissements: number
        decaissements: number
        solde: number
        tresorerieFin: number
    }[]
    indicateurs: {
        seuilRentabilite: number
        pointMort: number
        margeNette: number[]
        tauxEndettement: number[]
        autonomieFinanciere: number[]
        rotationBFR: number
        delaiClients: number
        delaiFournisseurs: number
    }
    hypotheses: {
        tauxTVA: number
        tauxChargesSociales: number
        tauxIS: number
        evolutionCA: number[]
    }
    scenarios?: {
        nom: string
        type: string
        couleur: string
        modifCA: number
        modifCharges: number
        resultatNetAn1?: number | null
        resultatNetAn3?: number | null
        tresorerieFinAn3?: number | null
        resultats?: {
            annees: number[]
            ca: number[]
            resultatNet: number[]
            tresorerieFin: number[]
        }
    }[]
    etudeMarche?: {
        codeNAF: string
        libelleNAF: string
        adresse: string
        codePostal: string
        commune: string
        nbConcurrents: number
        potentielMarche: string
        zoneChalandise: number
        population: number
    }
}
