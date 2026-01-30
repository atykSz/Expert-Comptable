import { prisma } from '@/lib/prisma'
import { calculatePrevisionnelCashFlow, calculateBilan } from '@/lib/financial-calculations'
import { calculerSIG, DonneesCompteResultat } from '@/lib/calculations/compte-resultat'
import type { DonneesRapport } from '@/app/previsionnel/[id]/rapport/types'

/**
 * Agrège toutes les données calculées pour le rapport prévisionnel
 * Utilise le moteur de calcul centralisé pour garantir la cohérence avec le dashboard
 */
export async function aggregateRapportData(previsionnelId: string): Promise<DonneesRapport | null> {
    // 1. Fetch du prévisionnel avec toutes les relations
    const previsionnel = await prisma.previsionnel.findUnique({
        where: { id: previsionnelId },
        include: {
            lignesCA: true,
            lignesCharge: true,
            hypotheses: true,
            financements: true,
            investissements: true,
            client: true
        }
    })

    if (!previsionnel) return null

    const dateDebut = new Date(previsionnel.dateDebut)
    const anneeDebut = dateDebut.getFullYear()
    const nombreAnnees = Math.ceil((previsionnel.nombreMois || 36) / 12)
    const hypotheses = previsionnel.hypotheses || {}

    // Helper pour sommer les montants mensuels d'une année
    const sumYear = (montants: unknown, year: number) => {
        const m = montants as number[]
        if (!Array.isArray(m)) return 0
        const yearOffset = (year - 1) * 12
        return m.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + (b || 0), 0)
    }

    // 2. Calculer le Compte de Résultat et SIG pour chaque année
    const compteResultatData: DonneesRapport['compteResultat'] = []
    const sigData: DonneesRapport['sig'] = []
    const resultatsAnnuels: number[] = []

    for (let year = 1; year <= nombreAnnees; year++) {
        // Calcul du CA
        const ca = previsionnel.lignesCA.reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0)

        // Calcul des charges par catégorie
        const achats = previsionnel.lignesCharge
            .filter(l => ['ACHATS_MARCHANDISES', 'ACHATS_MATIERES_PREMIERES', 'ACHATS_FOURNITURES'].includes(l.categorie))
            .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0)

        const servicesExterieurs = previsionnel.lignesCharge
            .filter(l => ['LOCATIONS', 'ENTRETIEN', 'ASSURANCES', 'HONORAIRES', 'PUBLICITE', 'DEPLACEMENTS', 'TELECOM', 'SERVICES_BANCAIRES', 'AUTRES_CHARGES_EXTERNES'].includes(l.categorie))
            .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0)

        const chargesPersonnel = previsionnel.lignesCharge
            .filter(l => ['REMUNERATION_DIRIGEANT', 'SALAIRES_BRUTS', 'CHARGES_SOCIALES'].includes(l.categorie))
            .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0)

        const impotsTaxes = previsionnel.lignesCharge
            .filter(l => l.categorie === 'IMPOTS_TAXES')
            .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0)

        // Amortissements
        const dotationsAmortissements = previsionnel.investissements.reduce((sum, inv) => {
            const dureeAnnees = (inv.dureeAmortissement || 60) / 12
            return sum + (inv.montantHT / dureeAnnees)
        }, 0)

        // Charges financières (intérêts emprunts)
        const chargesFinancieres = previsionnel.financements
            .filter(f => f.type === 'EMPRUNT_BANCAIRE')
            .reduce((sum, f) => {
                const tauxAnnuel = (f.tauxInteret || 0) / 100
                // Simplification: on prend le montant restant moyen * taux
                return sum + (f.montant * tauxAnnuel / 2)
            }, 0)

        const totalCharges = achats + servicesExterieurs + chargesPersonnel + impotsTaxes + dotationsAmortissements + chargesFinancieres

        // SIG
        const donneesSIG: DonneesCompteResultat = {
            venteMarchandises: previsionnel.lignesCA
                .filter(l => l.categorie === 'VENTE_MARCHANDISES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0),
            productionVendueBiens: previsionnel.lignesCA
                .filter(l => l.categorie === 'PRODUCTION_VENDUE_BIENS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0),
            productionVendueServices: previsionnel.lignesCA
                .filter(l => l.categorie === 'PRODUCTION_VENDUE_SERVICES' || l.categorie === 'PRESTATIONS_SERVICES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0),
            subventionsExploitation: previsionnel.lignesCA
                .filter(l => l.categorie === 'SUBVENTIONS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0),
            autresProduits: previsionnel.lignesCA
                .filter(l => l.categorie === 'AUTRES_PRODUITS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0),
            produitsFin: 0,
            produitsExceptionnels: 0,
            achatsMarchandises: previsionnel.lignesCharge
                .filter(l => l.categorie === 'ACHATS_MARCHANDISES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0),
            variationStockMarchandises: 0,
            achatsMatieresPrem: previsionnel.lignesCharge
                .filter(l => l.categorie === 'ACHATS_MATIERES_PREMIERES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0),
            variationStockMatieres: 0,
            autresAchats: previsionnel.lignesCharge
                .filter(l => l.categorie === 'ACHATS_FOURNITURES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels, year), 0),
            servicesExterieurs,
            autresServicesExterieurs: 0,
            impotsTaxes,
            chargesPersonnel,
            dotationsAmortissements,
            dotationsProvisions: 0,
            chargesFinancieres,
            chargesExceptionnelles: 0,
            participationSalaries: 0,
            impotSurBenefices: 0
        }

        const sig = calculerSIG(donneesSIG)
        resultatsAnnuels.push(sig.resultatNet)

        const caf = sig.resultatNet + dotationsAmortissements

        compteResultatData.push({
            annee: anneeDebut + year - 1,
            ca: Math.round(ca),
            achats: Math.round(achats),
            servicesExterieurs: Math.round(servicesExterieurs),
            chargesPersonnel: Math.round(chargesPersonnel),
            impotsTaxes: Math.round(impotsTaxes),
            dotationsAmortissements: Math.round(dotationsAmortissements),
            chargesFinancieres: Math.round(chargesFinancieres),
            autresCharges: 0,
            totalCharges: Math.round(totalCharges),
            ebe: Math.round(sig.ebe),
            resultatExploitation: Math.round(sig.resultatExploitation),
            resultatNet: Math.round(sig.resultatNet),
            caf: Math.round(caf),
            tresorerieFin: 0 // Sera mis à jour après calcul trésorerie
        })

        sigData.push({
            annee: anneeDebut + year - 1,
            margeCommerciale: Math.round(sig.margeCommerciale),
            productionExercice: Math.round(sig.productionExercice),
            valeurAjoutee: Math.round(sig.valeurAjoutee),
            ebe: Math.round(sig.ebe),
            resultatExploitation: Math.round(sig.resultatExploitation),
            resultatCourant: Math.round(sig.resultatCourantAvantImpots),
            resultatNet: Math.round(sig.resultatNet),
            caf: Math.round(caf)
        })
    }

    // 3. Calculer la Trésorerie Mensuelle
    const monthlyFlows = calculatePrevisionnelCashFlow(previsionnel)

    const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    const tresorerieMensuelle = monthlyFlows.slice(0, 12).map((flow, idx) => ({
        mois: moisNoms[idx],
        encaissements: Math.round(flow.encaissements.total),
        decaissements: Math.round(flow.decaissements.total),
        solde: Math.round(flow.soldeFlux),
        tresorerieFin: Math.round(flow.tresorerieFin)
    }))

    // Mettre à jour la trésorerie fin d'année dans le compte de résultat
    compteResultatData.forEach((cr, idx) => {
        const yearEndMonth = Math.min((idx + 1) * 12 - 1, monthlyFlows.length - 1)
        if (monthlyFlows[yearEndMonth]) {
            cr.tresorerieFin = Math.round(monthlyFlows[yearEndMonth].tresorerieFin)
        }
    })

    // 4. Calculer le Bilan
    const bilans = calculateBilan(previsionnel, monthlyFlows, resultatsAnnuels)

    const bilanData: DonneesRapport['bilan'] = bilans.map((bilan, idx) => ({
        annee: anneeDebut + idx,
        actifImmobilise: Math.round(bilan.actif.immobilisationsNet),
        actifCirculant: Math.round(bilan.actif.creancesClients + bilan.actif.stocks),
        stocks: Math.round(bilan.actif.stocks),
        creancesClients: Math.round(bilan.actif.creancesClients),
        disponibilites: Math.round(bilan.actif.disponibilites),
        totalActif: Math.round(bilan.actif.total),
        capitalSocial: Math.round(bilan.passif.capitalSocial),
        reserves: Math.round(bilan.passif.reportANouveau),
        resultat: Math.round(bilan.passif.resultatNet),
        capitauxPropres: Math.round(bilan.passif.capitalSocial + bilan.passif.resultatNet + bilan.passif.reportANouveau),
        emprunts: Math.round(bilan.passif.emprunts),
        dettesFournisseurs: Math.round(bilan.passif.dettesFournisseurs),
        autresDettes: Math.round(bilan.passif.dettesFiscalesSociales),
        totalPassif: Math.round(bilan.passif.total)
    }))

    // 5. Investissements
    const investissementsData = previsionnel.investissements.map(inv => ({
        libelle: inv.libelle,
        categorie: inv.categorie,
        montantHT: inv.montantHT,
        dateAcquisition: new Date(inv.dateAcquisition).toLocaleDateString('fr-FR'),
        dureeAmortissement: (inv.dureeAmortissement || 60) / 12,
        amortissementAnnuel: Math.round(inv.montantHT / ((inv.dureeAmortissement || 60) / 12))
    }))

    // 6. Amortissements cumulés
    const amortissementsCumules = compteResultatData.map((cr, idx) => ({
        annee: cr.annee,
        dotation: cr.dotationsAmortissements,
        cumul: compteResultatData.slice(0, idx + 1).reduce((sum, c) => sum + c.dotationsAmortissements, 0)
    }))

    // 7. Plan de financement
    const financementData: DonneesRapport['financement'] = compteResultatData.map((cr, idx) => {
        const apportsAn1 = previsionnel.financements
            .filter(f => f.type === 'CAPITAL_SOCIAL')
            .reduce((sum, f) => sum + f.montant, 0)
        const empruntsAn1 = previsionnel.financements
            .filter(f => f.type === 'EMPRUNT_BANCAIRE')
            .reduce((sum, f) => sum + f.montant, 0)
        const investAn1 = previsionnel.investissements.reduce((sum, i) => sum + i.montantHT, 0)

        const tresoDebut = idx === 0 ? 0 : compteResultatData[idx - 1].tresorerieFin

        return {
            annee: cr.annee,
            caf: cr.caf,
            apports: idx === 0 ? apportsAn1 : 0,
            emprunts: idx === 0 ? empruntsAn1 : 0,
            cessionActifs: 0,
            totalRessources: cr.caf + (idx === 0 ? apportsAn1 + empruntsAn1 : 0),
            investissements: idx === 0 ? investAn1 : 0,
            remboursementEmprunts: Math.round(empruntsAn1 / nombreAnnees),
            dividendes: 0,
            variationBFR: 0,
            totalEmplois: (idx === 0 ? investAn1 : 0) + Math.round(empruntsAn1 / nombreAnnees),
            variationTresorerie: cr.tresorerieFin - tresoDebut,
            tresorerieDebut: tresoDebut,
            tresorerieFin: cr.tresorerieFin
        }
    })

    // 8. Indicateurs
    const totalChargesFixesAn1 = compteResultatData[0] ?
        (compteResultatData[0].chargesPersonnel + compteResultatData[0].dotationsAmortissements + compteResultatData[0].chargesFinancieres) : 0
    const caAn1 = compteResultatData[0]?.ca || 1
    const margeVariable = caAn1 > 0 ? (caAn1 - (compteResultatData[0]?.achats || 0)) / caAn1 : 0.5
    const seuilRentabilite = margeVariable > 0 ? Math.round(totalChargesFixesAn1 / margeVariable) : 0
    const pointMort = caAn1 > 0 ? Math.round((seuilRentabilite / caAn1) * 12) : 12

    const indicateurs = {
        seuilRentabilite,
        pointMort: Math.min(pointMort, 12),
        margeNette: compteResultatData.map(cr => cr.ca > 0 ? Math.round((cr.resultatNet / cr.ca) * 10000) / 100 : 0),
        tauxEndettement: bilanData.map(b => b.capitauxPropres > 0 ? Math.round((b.emprunts / b.capitauxPropres) * 100) : 0),
        autonomieFinanciere: bilanData.map(b => b.totalPassif > 0 ? Math.round((b.capitauxPropres / b.totalPassif) * 100) : 0),
        rotationBFR: (hypotheses as Record<string, number>).delaiPaiementClients || 30,
        delaiClients: (hypotheses as Record<string, number>).delaiPaiementClients || 30,
        delaiFournisseurs: (hypotheses as Record<string, number>).delaiPaiementFournisseurs || 30
    }

    // 9. Construire l'objet DonneesRapport
    return {
        entreprise: {
            raisonSociale: previsionnel.client?.raisonSociale || 'Entreprise',
            formeJuridique: previsionnel.client?.formeJuridique || 'Non spécifié',
            secteurActivite: 'Non spécifié',
            dateCreation: dateDebut.toLocaleDateString('fr-FR'),
            effectif: 0
        },
        previsionnel: {
            titre: previsionnel.titre || 'Prévisionnel',
            dateDebut: dateDebut.toLocaleDateString('fr-FR'),
            duree: previsionnel.nombreMois || 36,
            dateGeneration: new Date().toLocaleDateString('fr-FR')
        },
        projet: {
            description: previsionnel.description || 'Projet prévisionnel',
            objectifs: ['Développer l\'activité', 'Assurer la rentabilité']
        },
        investissements: investissementsData,
        amortissementsCumules,
        compteResultat: compteResultatData,
        sig: sigData,
        bilan: bilanData,
        financement: financementData,
        tresorerieMensuelle,
        indicateurs,
        hypotheses: {
            tauxTVA: (hypotheses as Record<string, number>).tauxTVAVentes || 20,
            tauxChargesSociales: (hypotheses as Record<string, number>).tauxChargesSocialesPatronales || 45,
            tauxIS: (hypotheses as Record<string, number>).tauxIS || 25,
            evolutionCA: [0, 10, 10]
        }
    }
}
