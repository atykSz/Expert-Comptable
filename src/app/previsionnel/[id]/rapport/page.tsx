'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Download,
    Printer,
    FileText,
    Building2,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    PiggyBank,
    Calculator,
    Users,
    Target,
    Shield
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency, formatPercent } from '@/lib/utils'

// Types pour le rapport
interface DonneesRapport {
    // Informations générales
    entreprise: {
        raisonSociale: string
        formeJuridique: string
        secteurActivite: string
        dateCreation: string
    }
    previsionnel: {
        titre: string
        dateDebut: string
        duree: number
        dateGeneration: string
    }

    // Données financières sur 3 ans
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
    }[]

    // Bilan
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

    // Plan de financement
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

    // Trésorerie mensuelle année 1
    tresorerieMensuelle: {
        mois: string
        encaissements: number
        decaissements: number
        solde: number
        tresorerieFin: number
    }[]

    // Indicateurs clés
    indicateurs: {
        seuilRentabilite: number
        pointMort: number // en mois
        margeNette: number[]
        tauxEndettement: number[]
        autonomieFinanciere: number[]
        rotationBFR: number
        delaiClients: number
        delaiFournisseurs: number
    }

    // Hypothèses
    hypotheses: {
        tauxTVA: number
        tauxChargesSociales: number
        tauxIS: number
        evolutionCA: number[]
    }
}

// Données de démonstration
function getDonneesDemo(): DonneesRapport {
    return {
        entreprise: {
            raisonSociale: 'Cabinet Expertise Conseil',
            formeJuridique: 'SARL',
            secteurActivite: 'Conseil en gestion d\'entreprise',
            dateCreation: '01/01/2026',
        },
        previsionnel: {
            titre: 'Prévisionnel 2026-2028',
            dateDebut: '01/01/2026',
            duree: 36,
            dateGeneration: new Date().toLocaleDateString('fr-FR'),
        },
        compteResultat: [
            {
                annee: 2026,
                ca: 120000,
                achats: 12000,
                servicesExterieurs: 24000,
                chargesPersonnel: 48000,
                impotsTaxes: 3600,
                dotationsAmortissements: 8000,
                chargesFinancieres: 2400,
                autresCharges: 2000,
                totalCharges: 100000,
                ebe: 32400,
                resultatExploitation: 24400,
                resultatNet: 16500,
                caf: 24500,
            },
            {
                annee: 2027,
                ca: 150000,
                achats: 15000,
                servicesExterieurs: 28000,
                chargesPersonnel: 54000,
                impotsTaxes: 4500,
                dotationsAmortissements: 8000,
                chargesFinancieres: 1800,
                autresCharges: 2200,
                totalCharges: 113500,
                ebe: 48500,
                resultatExploitation: 40500,
                resultatNet: 29000,
                caf: 37000,
            },
            {
                annee: 2028,
                ca: 180000,
                achats: 18000,
                servicesExterieurs: 32000,
                chargesPersonnel: 62000,
                impotsTaxes: 5400,
                dotationsAmortissements: 7000,
                chargesFinancieres: 1200,
                autresCharges: 2400,
                totalCharges: 128000,
                ebe: 62600,
                resultatExploitation: 55600,
                resultatNet: 41000,
                caf: 48000,
            },
        ],
        bilan: [
            {
                annee: 2026,
                actifImmobilise: 45000,
                actifCirculant: 35000,
                stocks: 5000,
                creancesClients: 20000,
                disponibilites: 10000,
                totalActif: 80000,
                capitalSocial: 20000,
                reserves: 0,
                resultat: 16500,
                capitauxPropres: 36500,
                emprunts: 30000,
                dettesFournisseurs: 8000,
                autresDettes: 5500,
                totalPassif: 80000,
            },
            {
                annee: 2027,
                actifImmobilise: 37000,
                actifCirculant: 48000,
                stocks: 6000,
                creancesClients: 25000,
                disponibilites: 17000,
                totalActif: 85000,
                capitalSocial: 20000,
                reserves: 16500,
                resultat: 29000,
                capitauxPropres: 65500,
                emprunts: 24000,
                dettesFournisseurs: 10000,
                autresDettes: 5500,
                totalPassif: 105000,
            },
            {
                annee: 2028,
                actifImmobilise: 30000,
                actifCirculant: 62000,
                stocks: 7000,
                creancesClients: 30000,
                disponibilites: 25000,
                totalActif: 92000,
                capitalSocial: 20000,
                reserves: 45500,
                resultat: 41000,
                capitauxPropres: 106500,
                emprunts: 18000,
                dettesFournisseurs: 12000,
                autresDettes: 5500,
                totalPassif: 142000,
            },
        ],
        financement: [
            {
                annee: 2026,
                caf: 24500,
                apports: 20000,
                emprunts: 30000,
                cessionActifs: 0,
                totalRessources: 74500,
                investissements: 50000,
                remboursementEmprunts: 6000,
                dividendes: 0,
                variationBFR: 12000,
                totalEmplois: 68000,
                variationTresorerie: 6500,
                tresorerieDebut: 3500,
                tresorerieFin: 10000,
            },
            {
                annee: 2027,
                caf: 37000,
                apports: 0,
                emprunts: 0,
                cessionActifs: 0,
                totalRessources: 37000,
                investissements: 0,
                remboursementEmprunts: 6000,
                dividendes: 10000,
                variationBFR: 8000,
                totalEmplois: 24000,
                variationTresorerie: 13000,
                tresorerieDebut: 10000,
                tresorerieFin: 23000,
            },
            {
                annee: 2028,
                caf: 48000,
                apports: 0,
                emprunts: 0,
                cessionActifs: 0,
                totalRessources: 48000,
                investissements: 0,
                remboursementEmprunts: 6000,
                dividendes: 15000,
                variationBFR: 5000,
                totalEmplois: 26000,
                variationTresorerie: 22000,
                tresorerieDebut: 23000,
                tresorerieFin: 45000,
            },
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

// Composant pour l'en-tête du rapport
function RapportHeader({ entreprise, previsionnel }: { entreprise: DonneesRapport['entreprise'], previsionnel: DonneesRapport['previsionnel'] }) {
    return (
        <div className="border-b-2 border-foreground pb-8 mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Document Confidentiel</div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">PRÉVISIONNEL FINANCIER</h1>
                    <p className="text-xl text-muted-foreground">{previsionnel.titre}</p>
                </div>
                <div className="text-right">
                    <div className="w-16 h-16 bg-foreground rounded-xl flex items-center justify-center mb-3">
                        <BarChart3 className="h-8 w-8 text-background" />
                    </div>
                    <div className="text-xs text-muted-foreground">Expert-Comptable</div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mt-8 pt-6 border-t border-border">
                <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Entreprise</div>
                    <div className="font-semibold">{entreprise.raisonSociale}</div>
                    <div className="text-sm text-muted-foreground">{entreprise.formeJuridique}</div>
                </div>
                <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Activité</div>
                    <div className="font-semibold">{entreprise.secteurActivite}</div>
                </div>
                <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Période couverte</div>
                    <div className="font-semibold">{previsionnel.duree} mois</div>
                    <div className="text-sm text-muted-foreground">À partir du {previsionnel.dateDebut}</div>
                </div>
                <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Date d'édition</div>
                    <div className="font-semibold">{previsionnel.dateGeneration}</div>
                </div>
            </div>
        </div>
    )
}

// Composant pour la synthèse exécutive
function SyntheseExecutive({ donnees }: { donnees: DonneesRapport }) {
    const cr = donnees.compteResultat
    const croissanceCA = ((cr[2].ca - cr[0].ca) / cr[0].ca * 100).toFixed(1)
    const resultatCumule = cr.reduce((sum, c) => sum + c.resultatNet, 0)

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold">Synthèse Exécutive</h2>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-6 mb-6">
                <p className="text-muted-foreground leading-relaxed">
                    Le présent document présente les projections financières de <strong>{donnees.entreprise.raisonSociale}</strong> sur 
                    une période de {donnees.previsionnel.duree} mois. L'analyse démontre une trajectoire de croissance 
                    avec un chiffre d'affaires passant de <strong>{formatCurrency(cr[0].ca)}</strong> en année 1 
                    à <strong>{formatCurrency(cr[2].ca)}</strong> en année 3, soit une progression de <strong>+{croissanceCA}%</strong>.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card variant="bordered" className="p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        CA Année 3
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(cr[2].ca)}</div>
                    <div className="text-xs text-success mt-1">+{croissanceCA}% vs A1</div>
                </Card>

                <Card variant="bordered" className="p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calculator className="h-4 w-4 text-accent" />
                        Résultat cumulé
                    </div>
                    <div className={`text-2xl font-bold ${resultatCumule >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(resultatCumule)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">sur 3 ans</div>
                </Card>

                <Card variant="bordered" className="p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <PiggyBank className="h-4 w-4 text-accent" />
                        Trésorerie fin A3
                    </div>
                    <div className="text-2xl font-bold text-accent">
                        {formatCurrency(donnees.financement[2].tresorerieFin)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">solde disponible</div>
                </Card>

                <Card variant="bordered" className="p-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Shield className="h-4 w-4 text-success" />
                        Seuil de rentabilité
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(donnees.indicateurs.seuilRentabilite)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{donnees.indicateurs.pointMort} mois</div>
                </Card>
            </div>
        </section>
    )
}

// Composant tableau professionnel
function TableauProfessionnel({
    titre,
    colonnes,
    lignes,
    totaux
}: {
    titre?: string
    colonnes: string[]
    lignes: { label: string; valeurs: (number | string)[]; isTotal?: boolean; isSubtotal?: boolean; indent?: boolean }[]
    totaux?: { label: string; valeurs: (number | string)[] }
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border">
            {titre && (
                <div className="bg-foreground text-background px-4 py-3">
                    <h4 className="font-semibold text-sm">{titre}</h4>
                </div>
            )}
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Libellé</th>
                        {colonnes.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-right font-semibold text-muted-foreground">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {lignes.map((ligne, idx) => (
                        <tr
                            key={idx}
                            className={`border-b border-border last:border-0 ${ligne.isTotal ? 'bg-foreground text-background font-bold' :
                                    ligne.isSubtotal ? 'bg-secondary/50 font-semibold' : ''
                                }`}
                        >
                            <td className={`px-4 py-3 ${ligne.indent ? 'pl-8' : ''}`}>{ligne.label}</td>
                            {ligne.valeurs.map((val, i) => (
                                <td
                                    key={i}
                                    className={`px-4 py-3 text-right ${typeof val === 'number' && val < 0 ? 'text-danger' : ''
                                        }`}
                                >
                                    {typeof val === 'number' ? formatCurrency(val) : val}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {totaux && (
                    <tfoot>
                        <tr className="bg-foreground text-background font-bold">
                            <td className="px-4 py-3">{totaux.label}</td>
                            {totaux.valeurs.map((val, i) => (
                                <td key={i} className="px-4 py-3 text-right">
                                    {typeof val === 'number' ? formatCurrency(val) : val}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    )
}

// Composant Compte de Résultat
function CompteResultatSection({ donnees }: { donnees: DonneesRapport }) {
    const annees = donnees.compteResultat.map(c => c.annee.toString())

    const lignes = [
        { label: 'Chiffre d\'affaires HT', valeurs: donnees.compteResultat.map(c => c.ca), isSubtotal: true },
        { label: 'Achats consommés', valeurs: donnees.compteResultat.map(c => -c.achats), indent: true },
        { label: 'Services extérieurs', valeurs: donnees.compteResultat.map(c => -c.servicesExterieurs), indent: true },
        { label: 'Charges de personnel', valeurs: donnees.compteResultat.map(c => -c.chargesPersonnel), indent: true },
        { label: 'Impôts et taxes', valeurs: donnees.compteResultat.map(c => -c.impotsTaxes), indent: true },
        { label: 'Excédent Brut d\'Exploitation (EBE)', valeurs: donnees.compteResultat.map(c => c.ebe), isSubtotal: true },
        { label: 'Dotations aux amortissements', valeurs: donnees.compteResultat.map(c => -c.dotationsAmortissements), indent: true },
        { label: 'Résultat d\'exploitation', valeurs: donnees.compteResultat.map(c => c.resultatExploitation), isSubtotal: true },
        { label: 'Charges financières', valeurs: donnees.compteResultat.map(c => -c.chargesFinancieres), indent: true },
        { label: 'Résultat Net', valeurs: donnees.compteResultat.map(c => c.resultatNet), isTotal: true },
    ]

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-success" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Compte de Résultat Prévisionnel</h2>
                    <p className="text-sm text-muted-foreground">Conforme au Plan Comptable Général</p>
                </div>
            </div>

            <TableauProfessionnel colonnes={annees} lignes={lignes} />

            {/* Soldes Intermédiaires de Gestion */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                {donnees.compteResultat.map((cr, idx) => (
                    <Card key={idx} variant="bordered" className="p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-3">Année {cr.annee}</div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Marge brute</span>
                                <span className="font-medium">{formatPercent((cr.ca - cr.achats) / cr.ca * 100)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Taux d'EBE</span>
                                <span className="font-medium">{formatPercent(cr.ebe / cr.ca * 100)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Marge nette</span>
                                <span className={`font-medium ${cr.resultatNet >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {formatPercent(cr.resultatNet / cr.ca * 100)}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    )
}

// Composant Bilan
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
        { label: 'Résultat de l\'exercice', valeurs: donnees.bilan.map(b => b.resultat), indent: true },
        { label: 'Capitaux propres', valeurs: donnees.bilan.map(b => b.capitauxPropres), isSubtotal: true },
        { label: 'Emprunts', valeurs: donnees.bilan.map(b => b.emprunts) },
        { label: 'Dettes fournisseurs', valeurs: donnees.bilan.map(b => b.dettesFournisseurs), indent: true },
        { label: 'TOTAL PASSIF', valeurs: donnees.bilan.map(b => b.totalPassif), isTotal: true },
    ]

    return (
        <section className="mb-10 page-break-before-always">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-accent" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Bilan Prévisionnel</h2>
                    <p className="text-sm text-muted-foreground">Situation patrimoniale à la clôture de chaque exercice</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <TableauProfessionnel titre="ACTIF" colonnes={annees} lignes={lignesActif} />
                <TableauProfessionnel titre="PASSIF" colonnes={annees} lignes={lignesPassif} />
            </div>

            {/* Ratios bilanciels */}
            <div className="mt-6 bg-secondary/50 rounded-xl p-6">
                <h4 className="font-semibold mb-4">Ratios de structure financière</h4>
                <div className="grid grid-cols-3 gap-6">
                    {donnees.bilan.map((b, idx) => (
                        <div key={idx}>
                            <div className="text-sm font-medium text-muted-foreground mb-3">Année {b.annee}</div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taux d'endettement</span>
                                    <span className={`font-medium ${donnees.indicateurs.tauxEndettement[idx] > 100 ? 'text-warning' : 'text-success'}`}>
                                        {formatPercent(donnees.indicateurs.tauxEndettement[idx])}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Autonomie financière</span>
                                    <span className="font-medium">{formatPercent(donnees.indicateurs.autonomieFinanciere[idx])}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fonds de roulement</span>
                                    <span className="font-medium">{formatCurrency(b.capitauxPropres + b.emprunts - b.actifImmobilise)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Composant Plan de Financement
function PlanFinancementSection({ donnees }: { donnees: DonneesRapport }) {
    const annees = donnees.financement.map(f => f.annee.toString())

    const lignes = [
        { label: 'RESSOURCES', valeurs: donnees.financement.map(() => ''), isSubtotal: true },
        { label: 'Capacité d\'autofinancement (CAF)', valeurs: donnees.financement.map(f => f.caf), indent: true },
        { label: 'Apports en capital', valeurs: donnees.financement.map(f => f.apports), indent: true },
        { label: 'Emprunts nouveaux', valeurs: donnees.financement.map(f => f.emprunts), indent: true },
        { label: 'Total des ressources', valeurs: donnees.financement.map(f => f.totalRessources), isSubtotal: true },
        { label: 'EMPLOIS', valeurs: donnees.financement.map(() => ''), isSubtotal: true },
        { label: 'Investissements', valeurs: donnees.financement.map(f => f.investissements), indent: true },
        { label: 'Remboursement emprunts', valeurs: donnees.financement.map(f => f.remboursementEmprunts), indent: true },
        { label: 'Dividendes distribués', valeurs: donnees.financement.map(f => f.dividendes), indent: true },
        { label: 'Variation du BFR', valeurs: donnees.financement.map(f => f.variationBFR), indent: true },
        { label: 'Total des emplois', valeurs: donnees.financement.map(f => f.totalEmplois), isSubtotal: true },
        { label: 'Variation de trésorerie', valeurs: donnees.financement.map(f => f.variationTresorerie), isTotal: true },
        { label: 'Trésorerie début', valeurs: donnees.financement.map(f => f.tresorerieDebut) },
        { label: 'Trésorerie fin', valeurs: donnees.financement.map(f => f.tresorerieFin), isTotal: true },
    ]

    return (
        <section className="mb-10 page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Plan de Financement</h2>
                    <p className="text-sm text-muted-foreground">Équilibre entre ressources et emplois</p>
                </div>
            </div>

            <TableauProfessionnel colonnes={annees} lignes={lignes} />
        </section>
    )
}

// Composant Trésorerie Mensuelle
function TresorerieMensuelleSection({ donnees }: { donnees: DonneesRapport }) {
    const tresoNegative = donnees.tresorerieMensuelle.some(t => t.tresorerieFin < 0)

    return (
        <section className="mb-10 page-break-before-always">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-accent" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Plan de Trésorerie - Année 1</h2>
                    <p className="text-sm text-muted-foreground">Suivi mensuel des flux de trésorerie</p>
                </div>
            </div>

            {tresoNegative && (
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                        <div className="font-semibold text-warning">Attention : Trésorerie négative détectée</div>
                        <p className="text-sm text-warning/80 mt-1">
                            Certains mois présentent une trésorerie négative. Il est recommandé de prévoir une facilité de caisse 
                            ou d'ajuster le calendrier des encaissements/décaissements.
                        </p>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-foreground text-background">
                            <th className="px-4 py-3 text-left font-semibold">Mois</th>
                            <th className="px-4 py-3 text-right font-semibold">Encaissements</th>
                            <th className="px-4 py-3 text-right font-semibold">Décaissements</th>
                            <th className="px-4 py-3 text-right font-semibold">Solde mensuel</th>
                            <th className="px-4 py-3 text-right font-semibold">Trésorerie fin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donnees.tresorerieMensuelle.map((mois, idx) => (
                            <tr key={idx} className="border-b border-border">
                                <td className="px-4 py-3 font-medium">{mois.mois}</td>
                                <td className="px-4 py-3 text-right text-success">{formatCurrency(mois.encaissements)}</td>
                                <td className="px-4 py-3 text-right text-danger">{formatCurrency(mois.decaissements)}</td>
                                <td className={`px-4 py-3 text-right font-medium ${mois.solde >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {formatCurrency(mois.solde)}
                                </td>
                                <td className={`px-4 py-3 text-right font-bold ${mois.tresorerieFin >= 0 ? '' : 'text-danger bg-danger/10'}`}>
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

// Composant Indicateurs et Hypothèses
function IndicateursSection({ donnees }: { donnees: DonneesRapport }) {
    return (
        <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-foreground/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-foreground" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Indicateurs Clés et Hypothèses</h2>
                    <p className="text-sm text-muted-foreground">Synthèse des paramètres et ratios financiers</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Indicateurs de rentabilité */}
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-base">Rentabilité</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-success" />
                                <span className="text-sm">Seuil de rentabilité</span>
                            </div>
                            <span className="font-semibold">{formatCurrency(donnees.indicateurs.seuilRentabilite)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-success" />
                                <span className="text-sm">Point mort</span>
                            </div>
                            <span className="font-semibold">{donnees.indicateurs.pointMort} mois</span>
                        </div>
                        {donnees.indicateurs.margeNette.map((marge, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                <span className="text-sm text-muted-foreground">Marge nette A{idx + 1}</span>
                                <span className={`font-semibold ${marge >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {formatPercent(marge)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Hypothèses retenues */}
                <Card variant="bordered">
                    <CardHeader>
                        <CardTitle className="text-base">Hypothèses retenues</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Taux de TVA</span>
                            <span className="font-semibold">{donnees.hypotheses.tauxTVA}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Charges sociales</span>
                            <span className="font-semibold">{donnees.hypotheses.tauxChargesSociales}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Taux d'IS</span>
                            <span className="font-semibold">{donnees.hypotheses.tauxIS}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Délai clients</span>
                            <span className="font-semibold">{donnees.indicateurs.delaiClients} jours</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                            <span className="text-sm text-muted-foreground">Délai fournisseurs</span>
                            <span className="font-semibold">{donnees.indicateurs.delaiFournisseurs} jours</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

// Composant Footer du rapport
function RapportFooter() {
    return (
        <footer className="mt-12 pt-8 border-t-2 border-foreground">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>
                    <p>Document généré par Expert-Comptable SAAS</p>
                    <p className="text-xs mt-1">
                        Ce document est un prévisionnel et ne constitue pas un engagement. 
                        Les résultats réels peuvent différer des projections.
                    </p>
                </div>
                <div className="text-right">
                    <p>Confidentiel</p>
                    <p className="text-xs mt-1">Page 1/1</p>
                </div>
            </div>
        </footer>
    )
}

// Page principale du rapport
export default function RapportPage() {
    const rapportRef = useRef<HTMLDivElement>(null)
    const donnees = useMemo(() => getDonneesDemo(), [])

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Barre d'actions (masquée à l'impression) */}
            <div className="sticky top-0 z-50 bg-card border-b border-border print:hidden">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link
                        href={`/previsionnel/demo/dashboard`}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour au tableau de bord
                    </Link>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                        </Button>
                        <Button variant="default">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenu du rapport */}
            <main className="max-w-5xl mx-auto px-6 py-12 print:py-0 print:px-0" ref={rapportRef}>
                <div className="bg-card rounded-2xl border border-border p-10 print:border-0 print:shadow-none print:rounded-none">
                    <RapportHeader
                        entreprise={donnees.entreprise}
                        previsionnel={donnees.previsionnel}
                    />

                    <SyntheseExecutive donnees={donnees} />

                    <CompteResultatSection donnees={donnees} />

                    <BilanSection donnees={donnees} />

                    <PlanFinancementSection donnees={donnees} />

                    <TresorerieMensuelleSection donnees={donnees} />

                    <IndicateursSection donnees={donnees} />

                    <RapportFooter />
                </div>
            </main>

            {/* Styles pour l'impression */}
            <style jsx global>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .page-break-before-always {
                        page-break-before: always;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    )
}
