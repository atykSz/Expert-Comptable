import { transformerPourRapport } from '@/lib/calculations/rapport'
import prisma from '@/lib/prisma'
import type { DonneesRapport } from './types'

/**
 * Récupère les données du prévisionnel depuis la base de données
 * et les transforme pour le rapport
 */
export async function fetchPrevisionnelData(id: string): Promise<DonneesRapport | null> {
    try {
        const previsionnel = await prisma.previsionnel.findUnique({
            where: { id },
            include: {
                client: true,
                hypotheses: true,
                lignesCA: {
                    orderBy: { createdAt: 'asc' },
                },
                lignesCharge: {
                    orderBy: { createdAt: 'asc' },
                },
                investissements: {
                    orderBy: { dateAcquisition: 'asc' },
                },
                financements: {
                    orderBy: { dateDebut: 'asc' },
                },
                effectifs: {
                    orderBy: { dateEmbauche: 'asc' },
                },
            },
        })

        if (!previsionnel) {
            return null
        }

        // Transformer les données avec le moteur de calcul
        const rapport = transformerPourRapport(previsionnel as Parameters<typeof transformerPourRapport>[0])

        // Adapter au format DonneesRapport attendu par les composants
        const dateDebut = new Date(previsionnel.dateDebut)
        const anneeDebut = dateDebut.getFullYear()

        return {
            entreprise: {
                raisonSociale: rapport.entreprise.raisonSociale,
                formeJuridique: rapport.entreprise.formeJuridique,
                secteurActivite: rapport.entreprise.secteurActivite,
                dateCreation: dateDebut.toLocaleDateString('fr-FR'),
                effectif: previsionnel.effectifs.length,
            },
            previsionnel: {
                titre: previsionnel.titre,
                dateDebut: rapport.previsionnel.dateDebut,
                duree: previsionnel.nombreMois,
                dateGeneration: new Date().toLocaleDateString('fr-FR'),
            },
            projet: {
                description: previsionnel.description || 'Projet prévisionnel',
                objectifs: [
                    `Atteindre un CA de ${rapport.synthese.caAn3.toLocaleString('fr-FR')} € en année 3`,
                    `Maintenir une rentabilité positive`,
                    `Assurer une trésorerie saine`,
                ],
            },
            investissements: rapport.investissements,
            amortissementsCumules: rapport.investissements.length > 0 ? [
                {
                    annee: anneeDebut,
                    dotation: rapport.comptesResultat[0]?.dotationsAmortissements || 0,
                    cumul: rapport.comptesResultat[0]?.dotationsAmortissements || 0,
                },
                {
                    annee: anneeDebut + 1,
                    dotation: rapport.comptesResultat[1]?.dotationsAmortissements || 0,
                    cumul: (rapport.comptesResultat[0]?.dotationsAmortissements || 0) +
                        (rapport.comptesResultat[1]?.dotationsAmortissements || 0),
                },
                {
                    annee: anneeDebut + 2,
                    dotation: rapport.comptesResultat[2]?.dotationsAmortissements || 0,
                    cumul: (rapport.comptesResultat[0]?.dotationsAmortissements || 0) +
                        (rapport.comptesResultat[1]?.dotationsAmortissements || 0) +
                        (rapport.comptesResultat[2]?.dotationsAmortissements || 0),
                },
            ] : [],
            compteResultat: rapport.comptesResultat.map((cr, index) => ({
                annee: anneeDebut + index,
                ca: cr.chiffreAffairesHT,
                achats: cr.achats,
                servicesExterieurs: cr.servicesExterieurs,
                chargesPersonnel: cr.chargesPersonnel,
                impotsTaxes: cr.impotsTaxes,
                dotationsAmortissements: cr.dotationsAmortissements,
                chargesFinancieres: cr.chargesFinancieres,
                autresCharges: cr.autresCharges,
                totalCharges: cr.totalCharges,
                ebe: cr.EBE,
                resultatExploitation: cr.resultatExploitation,
                resultatNet: cr.resultatNet,
                caf: cr.CAF,
                tresorerieFin: cr.CAF * (index + 1), // Proxy pour l'affichage graphique
            })),
            sig: rapport.comptesResultat.map((cr, index) => ({
                annee: anneeDebut + index,
                margeCommerciale: cr.margeCommerciale,
                productionExercice: cr.chiffreAffairesHT,
                valeurAjoutee: cr.valeurAjoutee,
                ebe: cr.EBE,
                resultatExploitation: cr.resultatExploitation,
                resultatCourant: cr.resultatCourant,
                resultatNet: cr.resultatNet,
                caf: cr.CAF,
            })),
            bilan: rapport.comptesResultat.map((cr, index) => {
                // Estimation simplifiée du bilan
                const immobilisationsNettes = rapport.investissements.reduce(
                    (sum, inv) => sum + inv.montantHT, 0
                ) - (rapport.comptesResultat.slice(0, index + 1).reduce(
                    (sum, c) => sum + c.dotationsAmortissements, 0
                ))
                const tresorerie = rapport.tresorerie[11]?.cumulatif || 0
                const capitalPropres = previsionnel.financements
                    .filter(f => f.type === 'CAPITAL_SOCIAL')
                    .reduce((sum, f) => sum + f.montant, 0)
                const emprunts = previsionnel.financements
                    .filter(f => f.type === 'EMPRUNT_BANCAIRE')
                    .reduce((sum, f) => sum + f.montant, 0)
                const resultatCumule = rapport.comptesResultat
                    .slice(0, index + 1)
                    .reduce((sum, c) => sum + c.resultatNet, 0)

                return {
                    annee: anneeDebut + index,
                    actifImmobilise: Math.max(0, immobilisationsNettes),
                    actifCirculant: Math.round(cr.chiffreAffairesHT * 0.15),
                    stocks: 0,
                    creancesClients: Math.round(cr.chiffreAffairesHT * (rapport.indicateurs.delaiClients / 365)),
                    disponibilites: tresorerie,
                    totalActif: Math.max(0, immobilisationsNettes) + Math.round(cr.chiffreAffairesHT * 0.15) + tresorerie,
                    capitalSocial: capitalPropres,
                    reserves: index > 0 ? resultatCumule - cr.resultatNet : 0,
                    resultat: cr.resultatNet,
                    capitauxPropres: capitalPropres + resultatCumule,
                    emprunts: Math.max(0, emprunts - (index * emprunts / 5)),
                    dettesFournisseurs: Math.round(cr.totalCharges * (rapport.indicateurs.delaiFournisseurs / 365)),
                    autresDettes: 0,
                    totalPassif: capitalPropres + resultatCumule + Math.max(0, emprunts - (index * emprunts / 5)),
                }
            }),
            financement: rapport.comptesResultat.map((cr, index) => {
                const investissementsTotal = index === 0
                    ? rapport.investissements.reduce((sum, inv) => sum + inv.montantHT, 0)
                    : 0
                const apportsTotal = index === 0
                    ? previsionnel.financements
                        .filter(f => f.type === 'CAPITAL_SOCIAL' || f.type === 'COMPTE_COURANT_ASSOCIE')
                        .reduce((sum, f) => sum + f.montant, 0)
                    : 0
                const empruntsTotal = index === 0
                    ? previsionnel.financements
                        .filter(f => f.type === 'EMPRUNT_BANCAIRE')
                        .reduce((sum, f) => sum + f.montant, 0)
                    : 0
                const remboursement = previsionnel.financements
                    .filter(f => f.type === 'EMPRUNT_BANCAIRE' && f.duree)
                    .reduce((sum, f) => sum + (f.montant / (f.duree! / 12)), 0)

                return {
                    annee: anneeDebut + index,
                    caf: cr.CAF,
                    apports: apportsTotal,
                    emprunts: empruntsTotal,
                    cessionActifs: 0,
                    totalRessources: cr.CAF + apportsTotal + empruntsTotal,
                    investissements: investissementsTotal,
                    remboursementEmprunts: remboursement,
                    dividendes: 0,
                    variationBFR: 0,
                    totalEmplois: investissementsTotal + remboursement,
                    variationTresorerie: cr.CAF + apportsTotal + empruntsTotal - investissementsTotal - remboursement,
                    tresorerieDebut: index === 0 ? 0 : rapport.tresorerie[11]?.cumulatif || 0,
                    tresorerieFin: rapport.tresorerie[11]?.cumulatif || 0,
                }
            }),
            tresorerieMensuelle: rapport.tresorerie.map((t, index) => ({
                mois: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][index],
                encaissements: t.encaissements,
                decaissements: t.decaissements,
                solde: t.solde,
                tresorerieFin: t.cumulatif,
            })),
            indicateurs: {
                seuilRentabilite: rapport.indicateurs.seuilRentabilite,
                pointMort: rapport.indicateurs.pointMort,
                margeNette: rapport.comptesResultat.map(cr =>
                    cr.chiffreAffairesHT > 0
                        ? Math.round((cr.resultatNet / cr.chiffreAffairesHT) * 10000) / 100
                        : 0
                ),
                tauxEndettement: [30, 25, 20], // Estimations
                autonomieFinanciere: [50, 60, 70],
                rotationBFR: rapport.indicateurs.delaiClients, // Using delay as BFR proxy
                delaiClients: rapport.indicateurs.delaiClients,
                delaiFournisseurs: rapport.indicateurs.delaiFournisseurs,
            },
            hypotheses: {
                tauxTVA: previsionnel.hypotheses?.tauxTVAVentes || 20,
                tauxChargesSociales: previsionnel.hypotheses?.tauxChargesSocialesPatronales || 45,
                tauxIS: previsionnel.hypotheses?.tauxIS || 25,
                evolutionCA: [0, 10, 10], // Par défaut
            },
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du prévisionnel:', error)
        return null
    }
}
