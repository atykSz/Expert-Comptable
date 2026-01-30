'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    TrendingUp,
    AlertTriangle,
    BarChart3,
    PiggyBank,
    Calculator,
    Target,
    Shield,
    CheckCircle,
    Loader2
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency, formatPercent } from '@/lib/utils'
import {
    CoverPage,
    TableOfContents,
    ProjectPresentation,
    InvestissementsSection,
    SIGSection,
    GraphicsSection
} from '@/components/rapport'
import type { DonneesRapport } from './types'

// Transformer les données API en format rapport
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformPrevisionnelToRapport(data: any): DonneesRapport {
    const dateDebut = new Date(data.dateDebut)
    const anneeDebut = dateDebut.getFullYear()
    const hypotheses = data.hypotheses || {}

    // Calculer le CA annuel à partir des lignes
    const calculerCAAnnuel = (annee: number) => {
        let total = 0
        for (const ligne of data.lignesCA || []) {
            const montants = Array.isArray(ligne.montantsMensuels) ? ligne.montantsMensuels : []
            const montantAn1 = montants.slice(0, 12).reduce((a: number, b: number) => a + b, 0)
            if (annee === 1) total += montantAn1
            else if (annee === 2) total += montantAn1 * (1 + (ligne.evolutionAn2 || 0) / 100)
            else if (annee === 3) total += montantAn1 * (1 + (ligne.evolutionAn2 || 0) / 100) * (1 + (ligne.evolutionAn3 || 0) / 100)
        }
        return Math.round(total)
    }

    const calculerCharges = (annee: number) => {
        let total = 0
        for (const ligne of data.lignesCharge || []) {
            const montants = Array.isArray(ligne.montantsMensuels) ? ligne.montantsMensuels : []
            const montantAn1 = montants.slice(0, 12).reduce((a: number, b: number) => a + b, 0)
            if (annee === 1) total += montantAn1
            else if (annee === 2) total += montantAn1 * (1 + (ligne.evolutionAn2 || 0) / 100)
            else if (annee === 3) total += montantAn1 * (1 + (ligne.evolutionAn2 || 0) / 100) * (1 + (ligne.evolutionAn3 || 0) / 100)
        }
        return Math.round(total)
    }

    // Générer les comptes de résultat simplifiés
    const compteResultat = [1, 2, 3].map(annee => {
        const ca = calculerCAAnnuel(annee)
        const charges = calculerCharges(annee)
        const chargesPersonnel = (data.effectifs || []).reduce((sum: number, e: { salaireBrutMensuel: number; tauxChargesPatronales?: number }) => {
            const salaire = e.salaireBrutMensuel * 12
            const charges = salaire * ((e.tauxChargesPatronales || 45) / 100)
            return sum + salaire + charges
        }, 0)
        const dotations = (data.investissements || []).reduce((sum: number, inv: { montantHT: number; dureeAmortissement: number }) => {
            return sum + (inv.montantHT / (inv.dureeAmortissement / 12))
        }, 0)
        const ebe = ca - charges - chargesPersonnel
        const resultatExploitation = ebe - dotations
        const resultatNet = resultatExploitation * 0.75 // Après IS 25%

        return {
            annee: anneeDebut + annee - 1,
            ca,
            achats: Math.round(charges * 0.6),
            servicesExterieurs: Math.round(charges * 0.4),
            chargesPersonnel: Math.round(chargesPersonnel),
            impotsTaxes: Math.round(ca * 0.02),
            dotationsAmortissements: Math.round(dotations),
            chargesFinancieres: 0,
            autresCharges: 0,
            totalCharges: Math.round(charges + chargesPersonnel + dotations),
            ebe: Math.round(ebe),
            resultatExploitation: Math.round(resultatExploitation),
            resultatNet: Math.round(resultatNet),
            caf: Math.round(resultatNet + dotations),
            tresorerieFin: Math.round((resultatNet + dotations) * (annee)) // Estimation simple : cumul de la CAF
        }
    })

    return {
        entreprise: {
            raisonSociale: data.client?.raisonSociale || 'Entreprise',
            formeJuridique: data.client?.formeJuridique || 'SARL',
            secteurActivite: 'Non spécifié',
            dateCreation: dateDebut.toLocaleDateString('fr-FR'),
            effectif: (data.effectifs || []).length,
        },
        previsionnel: {
            titre: data.titre || 'Prévisionnel',
            dateDebut: dateDebut.toLocaleDateString('fr-FR'),
            duree: data.nombreMois || 36,
            dateGeneration: new Date().toLocaleDateString('fr-FR'),
        },
        projet: {
            description: data.description || 'Projet prévisionnel',
            objectifs: ['Développer l\'activité', 'Assurer la rentabilité'],
        },
        investissements: (data.investissements || []).map((inv: { libelle: string; categorie: string; montantHT: number; dateAcquisition: string; dureeAmortissement: number }) => ({
            libelle: inv.libelle,
            categorie: inv.categorie,
            montantHT: inv.montantHT,
            dateAcquisition: new Date(inv.dateAcquisition).toLocaleDateString('fr-FR'),
            dureeAmortissement: inv.dureeAmortissement / 12,
            amortissementAnnuel: Math.round(inv.montantHT / (inv.dureeAmortissement / 12)),
        })),
        amortissementsCumules: [1, 2, 3].map(annee => ({
            annee: anneeDebut + annee - 1,
            dotation: compteResultat[annee - 1]?.dotationsAmortissements || 0,
            cumul: compteResultat.slice(0, annee).reduce((sum, cr) => sum + cr.dotationsAmortissements, 0),
        })),
        compteResultat,
        sig: compteResultat.map(cr => ({
            annee: cr.annee,
            margeCommerciale: cr.ca - cr.achats,
            productionExercice: cr.ca,
            valeurAjoutee: cr.ca - cr.achats - cr.servicesExterieurs,
            ebe: cr.ebe,
            resultatExploitation: cr.resultatExploitation,
            resultatCourant: cr.resultatExploitation,
            resultatNet: cr.resultatNet,
            caf: cr.caf,
        })),
        bilan: compteResultat.map((cr, idx) => ({
            annee: cr.annee,
            actifImmobilise: Math.round((data.investissements || []).reduce((s: number, i: { montantHT: number }) => s + i.montantHT, 0) - compteResultat.slice(0, idx + 1).reduce((s, c) => s + c.dotationsAmortissements, 0)),
            actifCirculant: Math.round(cr.ca * 0.15),
            stocks: 0,
            creancesClients: Math.round(cr.ca * 0.1),
            disponibilites: Math.round(cr.caf * (idx + 1) * 0.5),
            totalActif: 0,
            capitalSocial: (data.financements || []).filter((f: { type: string }) => f.type === 'CAPITAL_SOCIAL').reduce((s: number, f: { montant: number }) => s + f.montant, 0),
            reserves: compteResultat.slice(0, idx).reduce((s, c) => s + c.resultatNet, 0),
            resultat: cr.resultatNet,
            capitauxPropres: 0,
            emprunts: (data.financements || []).filter((f: { type: string }) => f.type === 'EMPRUNT_BANCAIRE').reduce((s: number, f: { montant: number }) => s + f.montant, 0),
            dettesFournisseurs: Math.round(cr.totalCharges * 0.1),
            autresDettes: 0,
            totalPassif: 0,
        })),
        financement: compteResultat.map((cr, idx) => ({
            annee: cr.annee,
            caf: cr.caf,
            apports: idx === 0 ? (data.financements || []).filter((f: { type: string }) => f.type === 'CAPITAL_SOCIAL').reduce((s: number, f: { montant: number }) => s + f.montant, 0) : 0,
            emprunts: idx === 0 ? (data.financements || []).filter((f: { type: string }) => f.type === 'EMPRUNT_BANCAIRE').reduce((s: number, f: { montant: number }) => s + f.montant, 0) : 0,
            cessionActifs: 0,
            totalRessources: cr.caf,
            investissements: idx === 0 ? (data.investissements || []).reduce((s: number, i: { montantHT: number }) => s + i.montantHT, 0) : 0,
            remboursementEmprunts: 0,
            dividendes: 0,
            variationBFR: 0,
            totalEmplois: 0,
            variationTresorerie: cr.caf,
            tresorerieDebut: idx === 0 ? 0 : compteResultat.slice(0, idx).reduce((s, c) => s + c.caf, 0),
            tresorerieFin: compteResultat.slice(0, idx + 1).reduce((s, c) => s + c.caf, 0),
        })),
        tresorerieMensuelle: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((mois, idx) => {
            const ca = compteResultat[0]?.ca || 0
            const mensuel = ca / 12
            return {
                mois,
                encaissements: Math.round(mensuel * (0.8 + Math.random() * 0.4)),
                decaissements: Math.round(mensuel * 0.7 * (0.8 + Math.random() * 0.4)),
                solde: 0,
                tresorerieFin: 0,
            }
        }),
        indicateurs: {
            seuilRentabilite: Math.round(compteResultat[0]?.chargesPersonnel + compteResultat[0]?.dotationsAmortissements || 0),
            pointMort: 8,
            margeNette: compteResultat.map(cr => cr.ca > 0 ? Math.round((cr.resultatNet / cr.ca) * 10000) / 100 : 0),
            tauxEndettement: [30, 25, 20],
            autonomieFinanciere: [50, 60, 70],
            rotationBFR: hypotheses.delaiPaiementClients || 30,
            delaiClients: hypotheses.delaiPaiementClients || 30,
            delaiFournisseurs: hypotheses.delaiPaiementFournisseurs || 30,
        },
        hypotheses: {
            tauxTVA: hypotheses.tauxTVAVentes || 20,
            tauxChargesSociales: hypotheses.tauxChargesSocialesPatronales || 45,
            tauxIS: hypotheses.tauxIS || 25,
            evolutionCA: [0, 10, 10],
        },
    }
}

// Données de démonstration complètes
function getDonneesDemo(): DonneesRapport {
    return {
        entreprise: {
            raisonSociale: 'Cabinet Expertise Conseil',
            formeJuridique: 'SARL',
            secteurActivite: 'Conseil en gestion d\'entreprise',
            dateCreation: '01/01/2026',
            adresse: 'Paris, France',
            effectif: 3,
        },
        previsionnel: {
            titre: 'Prévisionnel 2026-2028',
            dateDebut: '01/01/2026',
            duree: 36,
            dateGeneration: new Date().toLocaleDateString('fr-FR'),
        },
        projet: {
            description: 'Création d\'un cabinet de conseil spécialisé dans l\'accompagnement des PME et startups. Notre expertise couvre la stratégie financière, l\'optimisation fiscale et le développement commercial.',
            objectifs: [
                'Atteindre un chiffre d\'affaires de 180 000 € en année 3',
                'Développer un portefeuille de 50 clients récurrents',
                'Maintenir une marge nette supérieure à 20%',
                'Recruter 2 consultants supplémentaires',
            ],
        },
        investissements: [
            { libelle: 'Agencements locaux', categorie: 'Immob. corporelles', montantHT: 25000, dateAcquisition: '01/01/2026', dureeAmortissement: 10, amortissementAnnuel: 2500 },
            { libelle: 'Matériel informatique', categorie: 'Équipements', montantHT: 8000, dateAcquisition: '01/01/2026', dureeAmortissement: 3, amortissementAnnuel: 2667 },
            { libelle: 'Mobilier bureau', categorie: 'Mobilier', montantHT: 5000, dateAcquisition: '01/01/2026', dureeAmortissement: 5, amortissementAnnuel: 1000 },
            { libelle: 'Véhicule', categorie: 'Matériel transport', montantHT: 12000, dateAcquisition: '01/01/2026', dureeAmortissement: 5, amortissementAnnuel: 2400 },
        ],
        amortissementsCumules: [
            { annee: 2026, dotation: 8567, cumul: 8567 },
            { annee: 2027, dotation: 8567, cumul: 17134 },
            { annee: 2028, dotation: 8567, cumul: 25701 },
        ],
        compteResultat: [
            { annee: 2026, ca: 120000, achats: 12000, servicesExterieurs: 24000, chargesPersonnel: 48000, impotsTaxes: 3600, dotationsAmortissements: 8000, chargesFinancieres: 2400, autresCharges: 2000, totalCharges: 100000, ebe: 32400, resultatExploitation: 24400, resultatNet: 16500, caf: 24500, tresorerieFin: 10000 },
            { annee: 2027, ca: 150000, achats: 15000, servicesExterieurs: 28000, chargesPersonnel: 54000, impotsTaxes: 4500, dotationsAmortissements: 8000, chargesFinancieres: 1800, autresCharges: 2200, totalCharges: 113500, ebe: 48500, resultatExploitation: 40500, resultatNet: 29000, caf: 37000, tresorerieFin: 23000 },
            { annee: 2028, ca: 180000, achats: 18000, servicesExterieurs: 32000, chargesPersonnel: 62000, impotsTaxes: 5400, dotationsAmortissements: 7000, chargesFinancieres: 1200, autresCharges: 2400, totalCharges: 128000, ebe: 62600, resultatExploitation: 55600, resultatNet: 41000, caf: 48000, tresorerieFin: 45000 },
        ],
        sig: [
            { annee: 2026, margeCommerciale: 108000, productionExercice: 120000, valeurAjoutee: 84000, ebe: 32400, resultatExploitation: 24400, resultatCourant: 22000, resultatNet: 16500, caf: 24500 },
            { annee: 2027, margeCommerciale: 135000, productionExercice: 150000, valeurAjoutee: 107000, ebe: 48500, resultatExploitation: 40500, resultatCourant: 38700, resultatNet: 29000, caf: 37000 },
            { annee: 2028, margeCommerciale: 162000, productionExercice: 180000, valeurAjoutee: 130000, ebe: 62600, resultatExploitation: 55600, resultatCourant: 54400, resultatNet: 41000, caf: 48000 },
        ],
        bilan: [
            { annee: 2026, actifImmobilise: 45000, actifCirculant: 35000, stocks: 5000, creancesClients: 20000, disponibilites: 10000, totalActif: 80000, capitalSocial: 20000, reserves: 0, resultat: 16500, capitauxPropres: 36500, emprunts: 30000, dettesFournisseurs: 8000, autresDettes: 5500, totalPassif: 80000 },
            { annee: 2027, actifImmobilise: 37000, actifCirculant: 48000, stocks: 6000, creancesClients: 25000, disponibilites: 17000, totalActif: 85000, capitalSocial: 20000, reserves: 16500, resultat: 29000, capitauxPropres: 65500, emprunts: 24000, dettesFournisseurs: 10000, autresDettes: 5500, totalPassif: 105000 },
            { annee: 2028, actifImmobilise: 30000, actifCirculant: 62000, stocks: 7000, creancesClients: 30000, disponibilites: 25000, totalActif: 92000, capitalSocial: 20000, reserves: 45500, resultat: 41000, capitauxPropres: 106500, emprunts: 18000, dettesFournisseurs: 12000, autresDettes: 5500, totalPassif: 142000 },
        ],
        financement: [
            { annee: 2026, caf: 24500, apports: 20000, emprunts: 30000, cessionActifs: 0, totalRessources: 74500, investissements: 50000, remboursementEmprunts: 6000, dividendes: 0, variationBFR: 12000, totalEmplois: 68000, variationTresorerie: 6500, tresorerieDebut: 3500, tresorerieFin: 10000 },
            { annee: 2027, caf: 37000, apports: 0, emprunts: 0, cessionActifs: 0, totalRessources: 37000, investissements: 0, remboursementEmprunts: 6000, dividendes: 10000, variationBFR: 8000, totalEmplois: 24000, variationTresorerie: 13000, tresorerieDebut: 10000, tresorerieFin: 23000 },
            { annee: 2028, caf: 48000, apports: 0, emprunts: 0, cessionActifs: 0, totalRessources: 48000, investissements: 0, remboursementEmprunts: 6000, dividendes: 15000, variationBFR: 5000, totalEmplois: 26000, variationTresorerie: 22000, tresorerieDebut: 23000, tresorerieFin: 45000 },
        ],
        tresorerieMensuelle: [
            { mois: 'Janvier', encaissements: 8000, decaissements: 12000, solde: -4000, tresorerieFin: -500 },
            { mois: 'Février', encaissements: 9000, decaissements: 8500, solde: 500, tresorerieFin: 0 },
            { mois: 'Mars', encaissements: 10000, decaissements: 8000, solde: 2000, tresorerieFin: 2000 },
            { mois: 'Avril', encaissements: 10000, decaissements: 8500, solde: 1500, tresorerieFin: 3500 },
            { mois: 'Mai', encaissements: 10500, decaissements: 8000, solde: 2500, tresorerieFin: 6000 },
            { mois: 'Juin', encaissements: 11000, decaissements: 9000, solde: 2000, tresorerieFin: 8000 },
            { mois: 'Juillet', encaissements: 9000, decaissements: 8500, solde: 500, tresorerieFin: 8500 },
            { mois: 'Août', encaissements: 7000, decaissements: 7000, solde: 0, tresorerieFin: 8500 },
            { mois: 'Septembre', encaissements: 11000, decaissements: 8000, solde: 3000, tresorerieFin: 11500 },
            { mois: 'Octobre', encaissements: 12000, decaissements: 9000, solde: 3000, tresorerieFin: 14500 },
            { mois: 'Novembre', encaissements: 11500, decaissements: 8500, solde: 3000, tresorerieFin: 17500 },
            { mois: 'Décembre', encaissements: 11000, decaissements: 18500, solde: -7500, tresorerieFin: 10000 },
        ],
        indicateurs: {
            seuilRentabilite: 85000,
            pointMort: 8.5,
            margeNette: [13.75, 19.33, 22.78],
            tauxEndettement: [82.2, 36.6, 16.9],
            autonomieFinanciere: [45.6, 62.4, 75.0],
            rotationBFR: 60,
            delaiClients: 60,
            delaiFournisseurs: 45,
        },
        hypotheses: {
            tauxTVA: 20,
            tauxChargesSociales: 45,
            tauxIS: 25,
            evolutionCA: [0, 25, 20],
        },
    }
}

// Synthèse exécutive avec KPIs
function SyntheseExecutive({ donnees }: { donnees: DonneesRapport }) {
    const cr = donnees.compteResultat
    const croissanceCA = ((cr[2].ca - cr[0].ca) / cr[0].ca * 100).toFixed(1)
    const resultatCumule = cr.reduce((sum, c) => sum + c.resultatNet, 0)

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-[#c9a227]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1e3a5f]">Synthèse Exécutive</h2>
            </div>

            <div className="bg-[#1e3a5f]/5 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 leading-relaxed">
                    Le présent document présente les projections financières de <strong>{donnees.entreprise.raisonSociale}</strong> sur
                    une période de {donnees.previsionnel.duree} mois. L'analyse démontre une trajectoire de croissance
                    avec un chiffre d'affaires passant de <strong>{formatCurrency(cr[0].ca)}</strong> en année 1
                    à <strong>{formatCurrency(cr[2].ca)}</strong> en année 3, soit une progression de <strong className="text-green-600">+{croissanceCA}%</strong>.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card variant="bordered" className="p-5 border-l-4 border-l-[#1e3a5f]">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <TrendingUp className="h-4 w-4 text-[#1e3a5f]" />
                        CA Année 3
                    </div>
                    <div className="text-2xl font-bold text-[#1e3a5f]">{formatCurrency(cr[2].ca)}</div>
                    <div className="text-xs text-green-600 mt-1">+{croissanceCA}% vs A1</div>
                </Card>

                <Card variant="bordered" className="p-5 border-l-4 border-l-[#c9a227]">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calculator className="h-4 w-4 text-[#c9a227]" />
                        Résultat cumulé
                    </div>
                    <div className={`text-2xl font-bold ${resultatCumule >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(resultatCumule)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">sur 3 ans</div>
                </Card>

                <Card variant="bordered" className="p-5 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <PiggyBank className="h-4 w-4 text-green-500" />
                        Trésorerie fin A3
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(donnees.financement[2].tresorerieFin)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">solde disponible</div>
                </Card>

                <Card variant="bordered" className="p-5 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Seuil rentabilité
                    </div>
                    <div className="text-2xl font-bold text-[#1e3a5f]">{formatCurrency(donnees.indicateurs.seuilRentabilite)}</div>
                    <div className="text-xs text-gray-500 mt-1">{donnees.indicateurs.pointMort} mois</div>
                </Card>
            </div>
        </section>
    )
}

// Tableau professionnel générique
function TableauProfessionnel({
    titre,
    colonnes,
    lignes,
}: {
    titre?: string
    colonnes: string[]
    lignes: { label: string; valeurs: (number | string)[]; isTotal?: boolean; isSubtotal?: boolean; indent?: boolean }[]
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            {titre && (
                <div className="bg-[#1e3a5f] text-white px-4 py-3">
                    <h4 className="font-semibold text-sm">{titre}</h4>
                </div>
            )}
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Libellé</th>
                        {colonnes.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-right font-semibold text-gray-600">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {lignes.map((ligne, idx) => (
                        <tr
                            key={idx}
                            className={`border-b border-gray-100 ${ligne.isTotal ? 'bg-[#1e3a5f] text-white font-bold' :
                                ligne.isSubtotal ? 'bg-[#c9a227]/10 font-semibold' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                        >
                            <td className={`px-4 py-3 ${ligne.indent ? 'pl-8' : ''}`}>{ligne.label}</td>
                            {ligne.valeurs.map((val, i) => (
                                <td
                                    key={i}
                                    className={`px-4 py-3 text-right ${typeof val === 'number' && val < 0 ? 'text-red-500' : ''
                                        } ${ligne.isTotal ? 'text-[#c9a227]' : ''}`}
                                >
                                    {typeof val === 'number' ? formatCurrency(val) : val}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// Compte de Résultat Section
function CompteResultatSection({ donnees }: { donnees: DonneesRapport }) {
    const annees = donnees.compteResultat.map(c => c.annee.toString())
    const lignes = [
        { label: 'Chiffre d\'affaires HT', valeurs: donnees.compteResultat.map(c => c.ca), isSubtotal: true },
        { label: 'Achats consommés', valeurs: donnees.compteResultat.map(c => -c.achats), indent: true },
        { label: 'Services extérieurs', valeurs: donnees.compteResultat.map(c => -c.servicesExterieurs), indent: true },
        { label: 'Charges de personnel', valeurs: donnees.compteResultat.map(c => -c.chargesPersonnel), indent: true },
        { label: 'Impôts et taxes', valeurs: donnees.compteResultat.map(c => -c.impotsTaxes), indent: true },
        { label: 'EBE', valeurs: donnees.compteResultat.map(c => c.ebe), isSubtotal: true },
        { label: 'Dotations amortissements', valeurs: donnees.compteResultat.map(c => -c.dotationsAmortissements), indent: true },
        { label: 'Résultat d\'exploitation', valeurs: donnees.compteResultat.map(c => c.resultatExploitation), isSubtotal: true },
        { label: 'Charges financières', valeurs: donnees.compteResultat.map(c => -c.chargesFinancieres), indent: true },
        { label: 'Résultat Net', valeurs: donnees.compteResultat.map(c => c.resultatNet), isTotal: true },
    ]

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Compte de Résultat Prévisionnel</h2>
                    <p className="text-sm text-gray-500">Conforme au Plan Comptable Général</p>
                </div>
            </div>
            <TableauProfessionnel colonnes={annees} lignes={lignes} />
        </section>
    )
}

// Bilan Section
function BilanSection({ donnees }: { donnees: DonneesRapport }) {
    const annees = donnees.bilan.map(b => b.annee.toString())
    const lignesActif = [
        { label: 'Immobilisations nettes', valeurs: donnees.bilan.map(b => b.actifImmobilise) },
        { label: 'Stocks', valeurs: donnees.bilan.map(b => b.stocks), indent: true },
        { label: 'Créances clients', valeurs: donnees.bilan.map(b => b.creancesClients), indent: true },
        { label: 'Disponibilités', valeurs: donnees.bilan.map(b => b.disponibilites), indent: true },
        { label: 'TOTAL ACTIF', valeurs: donnees.bilan.map(b => b.totalActif), isTotal: true },
    ]
    const lignesPassif = [
        { label: 'Capital social', valeurs: donnees.bilan.map(b => b.capitalSocial) },
        { label: 'Réserves', valeurs: donnees.bilan.map(b => b.reserves), indent: true },
        { label: 'Résultat', valeurs: donnees.bilan.map(b => b.resultat), indent: true },
        { label: 'Capitaux propres', valeurs: donnees.bilan.map(b => b.capitauxPropres), isSubtotal: true },
        { label: 'Emprunts', valeurs: donnees.bilan.map(b => b.emprunts) },
        { label: 'Dettes fournisseurs', valeurs: donnees.bilan.map(b => b.dettesFournisseurs), indent: true },
        { label: 'TOTAL PASSIF', valeurs: donnees.bilan.map(b => b.totalPassif), isTotal: true },
    ]

    return (
        <section className="mb-10 page-break-before-always">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Bilan Prévisionnel</h2>
                    <p className="text-sm text-gray-500">Situation patrimoniale à la clôture</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <TableauProfessionnel titre="ACTIF" colonnes={annees} lignes={lignesActif} />
                <TableauProfessionnel titre="PASSIF" colonnes={annees} lignes={lignesPassif} />
            </div>
        </section>
    )
}

// Plan de Financement Section
function PlanFinancementSection({ donnees }: { donnees: DonneesRapport }) {
    const annees = donnees.financement.map(f => f.annee.toString())
    const lignes = [
        { label: 'RESSOURCES', valeurs: donnees.financement.map(() => ''), isSubtotal: true },
        { label: 'CAF', valeurs: donnees.financement.map(f => f.caf), indent: true },
        { label: 'Apports', valeurs: donnees.financement.map(f => f.apports), indent: true },
        { label: 'Emprunts', valeurs: donnees.financement.map(f => f.emprunts), indent: true },
        { label: 'Total ressources', valeurs: donnees.financement.map(f => f.totalRessources), isSubtotal: true },
        { label: 'EMPLOIS', valeurs: donnees.financement.map(() => ''), isSubtotal: true },
        { label: 'Investissements', valeurs: donnees.financement.map(f => f.investissements), indent: true },
        { label: 'Remboursement emprunts', valeurs: donnees.financement.map(f => f.remboursementEmprunts), indent: true },
        { label: 'Dividendes', valeurs: donnees.financement.map(f => f.dividendes), indent: true },
        { label: 'Variation BFR', valeurs: donnees.financement.map(f => f.variationBFR), indent: true },
        { label: 'Total emplois', valeurs: donnees.financement.map(f => f.totalEmplois), isSubtotal: true },
        { label: 'Variation trésorerie', valeurs: donnees.financement.map(f => f.variationTresorerie), isTotal: true },
        { label: 'Trésorerie fin', valeurs: donnees.financement.map(f => f.tresorerieFin), isTotal: true },
    ]

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Plan de Financement</h2>
                    <p className="text-sm text-gray-500">Équilibre ressources et emplois</p>
                </div>
            </div>
            <TableauProfessionnel colonnes={annees} lignes={lignes} />
        </section>
    )
}

// Trésorerie Mensuelle
function TresorerieMensuelleSection({ donnees }: { donnees: DonneesRapport }) {
    const tresoNegative = donnees.tresorerieMensuelle.some(t => t.tresorerieFin < 0)

    return (
        <section className="mb-10 page-break-before-always">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Plan de Trésorerie - Année 1</h2>
                    <p className="text-sm text-gray-500">Flux mensuels</p>
                </div>
            </div>

            {tresoNegative && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                        <div className="font-semibold text-amber-800">Attention : Trésorerie négative</div>
                        <p className="text-sm text-amber-700 mt-1">Prévoir une facilité de caisse ou ajuster les délais.</p>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#1e3a5f] text-white">
                            <th className="px-4 py-3 text-left font-semibold">Mois</th>
                            <th className="px-4 py-3 text-right font-semibold">Encaissements</th>
                            <th className="px-4 py-3 text-right font-semibold">Décaissements</th>
                            <th className="px-4 py-3 text-right font-semibold">Solde</th>
                            <th className="px-4 py-3 text-right font-semibold">Trésorerie fin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donnees.tresorerieMensuelle.map((mois, idx) => (
                            <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-4 py-3 font-medium">{mois.mois}</td>
                                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(mois.encaissements)}</td>
                                <td className="px-4 py-3 text-right text-red-500">{formatCurrency(mois.decaissements)}</td>
                                <td className={`px-4 py-3 text-right font-medium ${mois.solde >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {formatCurrency(mois.solde)}
                                </td>
                                <td className={`px-4 py-3 text-right font-bold ${mois.tresorerieFin >= 0 ? '' : 'text-red-600 bg-red-50'}`}>
                                    {formatCurrency(mois.tresorerieFin)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

// Indicateurs Section
function IndicateursSection({ donnees }: { donnees: DonneesRapport }) {
    return (
        <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-[#c9a227]" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-[#1e3a5f]">Indicateurs Clés</h2>
                    <p className="text-sm text-gray-500">Ratios et hypothèses</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card variant="bordered">
                    <CardHeader><CardTitle className="text-base text-[#1e3a5f]">Rentabilité</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />Seuil rentabilité</span>
                            <span className="font-semibold">{formatCurrency(donnees.indicateurs.seuilRentabilite)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm">Point mort</span>
                            <span className="font-semibold">{donnees.indicateurs.pointMort} mois</span>
                        </div>
                        {donnees.indicateurs.margeNette.map((m, i) => (
                            <div key={i} className="flex justify-between py-2 border-b last:border-0">
                                <span className="text-sm text-gray-500">Marge nette A{i + 1}</span>
                                <span className={`font-semibold ${m >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatPercent(m)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card variant="bordered">
                    <CardHeader><CardTitle className="text-base text-[#1e3a5f]">Hypothèses</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Taux TVA</span>
                            <span className="font-semibold">{donnees.hypotheses.tauxTVA}%</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Charges sociales</span>
                            <span className="font-semibold">{donnees.hypotheses.tauxChargesSociales}%</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-gray-500">Taux IS</span>
                            <span className="font-semibold">{donnees.hypotheses.tauxIS}%</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-500">Délai clients</span>
                            <span className="font-semibold">{donnees.indicateurs.delaiClients} jours</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

// Footer du rapport
function RapportFooter() {
    return (
        <footer className="mt-12 pt-8 border-t-2 border-[#1e3a5f]">
            <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                    <p className="font-medium text-[#1e3a5f]">Document généré par Expert-Comptable SAAS</p>
                    <p className="text-xs mt-1">Ce document est un prévisionnel. Les résultats réels peuvent différer.</p>
                </div>
                <div className="text-right">
                    <p className="font-medium text-[#c9a227]">Confidentiel</p>
                </div>
            </div>
        </footer>
    )
}

// Page principale
export default function RapportPage() {
    const params = useParams()
    const id = params.id as string
    const isDemo = id === 'demo'

    const rapportRef = useRef<HTMLDivElement>(null)
    const [donnees, setDonnees] = useState<DonneesRapport | null>(null)
    const [loading, setLoading] = useState(!isDemo)
    const [error, setError] = useState<string | null>(null)

    // Charger les données démo immédiatement si mode démo
    const donneesDemo = useMemo(() => getDonneesDemo(), [])

    useEffect(() => {
        if (isDemo) {
            setDonnees(donneesDemo)
            setLoading(false)
            return
        }

        // Charger les vraies données depuis l'API
        async function fetchData() {
            try {
                const response = await fetch(`/api/previsionnels/${id}`)

                if (!response.ok) {
                    if (response.status === 401) {
                        setError('Vous devez être connecté pour accéder à ce rapport.')
                    } else if (response.status === 403) {
                        setError('Vous n\'avez pas accès à ce prévisionnel.')
                    } else if (response.status === 404) {
                        setError('Prévisionnel non trouvé.')
                    } else {
                        setError('Erreur lors du chargement du rapport.')
                    }
                    setLoading(false)
                    return
                }

                const previsionnel = await response.json()

                // Transformer les données pour le format rapport
                // Pour l'instant, utiliser les données démo en attendant l'intégration complète
                // TODO: Utiliser les vraies données transformées
                const transformedData = transformPrevisionnelToRapport(previsionnel)
                setDonnees(transformedData)
            } catch (err) {
                console.error('Erreur fetch:', err)
                setError('Erreur de connexion au serveur.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, isDemo, donneesDemo])

    const sections = [
        { number: '1', title: 'Présentation du Projet' },
        { number: '2', title: 'Investissements et Amortissements' },
        { number: '3', title: 'Compte de Résultat Prévisionnel' },
        { number: '4', title: 'Soldes Intermédiaires de Gestion' },
        { number: '5', title: 'Bilan Prévisionnel' },
        { number: '6', title: 'Plan de Financement' },
        { number: '7', title: 'Plan de Trésorerie' },
        { number: '8', title: 'Indicateurs Clés' },
    ]

    const handlePrint = () => window.print()

    // État de chargement
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#1e3a5f] mx-auto mb-4" />
                    <p className="text-gray-600">Chargement du rapport...</p>
                </div>
            </div>
        )
    }

    // État d'erreur
    if (error || !donnees) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Card className="max-w-md p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error || 'Données non disponibles'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Impossible de charger les données du rapport.
                    </p>
                    <Link href="/previsionnel">
                        <Button variant="default" className="bg-[#1e3a5f]">
                            Retour aux prévisionnels
                        </Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Barre d'actions */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm print:hidden">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/previsionnel/demo/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
                        <ArrowLeft className="h-4 w-4" />
                        Retour au tableau de bord
                    </Link>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                        </Button>
                        <Button variant="default" className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenu du rapport */}
            <main className="max-w-5xl mx-auto px-6 py-8 print:py-0 print:px-0 print:max-w-none" ref={rapportRef}>
                {/* Cover Page */}
                <CoverPage entreprise={donnees.entreprise} previsionnel={donnees.previsionnel} />

                {/* Main content */}
                <div className="bg-white rounded-2xl border border-gray-200 p-10 mt-8 print:border-0 print:shadow-none print:rounded-none print:mt-0">
                    <TableOfContents sections={sections} />
                    <ProjectPresentation entreprise={donnees.entreprise} projet={donnees.projet} />
                    <InvestissementsSection investissements={donnees.investissements} amortissementsCumules={donnees.amortissementsCumules} />
                    <SyntheseExecutive donnees={donnees} />
                    <GraphicsSection data={donnees.compteResultat} />
                    <CompteResultatSection donnees={donnees} />
                    <SIGSection sig={donnees.sig} />
                    <BilanSection donnees={donnees} />
                    <PlanFinancementSection donnees={donnees} />
                    <TresorerieMensuelleSection donnees={donnees} />
                    <IndicateursSection donnees={donnees} />
                    <RapportFooter />
                </div>
            </main>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    .page-break-before-always { page-break-before: always; }
                    .page-break-after-always { page-break-after: always; }
                    .page-break-inside-avoid { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    )
}
