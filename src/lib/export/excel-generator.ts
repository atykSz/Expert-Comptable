/**
 * Générateur Excel pour le prévisionnel
 * Crée un classeur avec tous les onglets du prévisionnel
 */

import ExcelJS from 'exceljs'
import prisma from '@/lib/prisma'

// Types pour les données de l'export
interface ExportData {
    previsionnel: {
        id: string
        titre: string
        description: string | null
        dateDebut: Date
        nombreMois: number
        regimeFiscal: string
    }
    client: {
        raisonSociale: string
        formeJuridique: string
    }
    hypotheses: {
        tauxTVAVentes: number
        tauxTVAAchats: number
        delaiPaiementClients: number
        delaiPaiementFournisseurs: number
        tauxChargesSocialesPatronales: number
        tauxIS: number
    } | null
    lignesCA: Array<{
        libelle: string
        categorie: string
        montantsMensuels: number[]
        tauxTVA: number
        evolutionAn2: number
        evolutionAn3: number
    }>
    lignesCharge: Array<{
        libelle: string
        categorie: string
        comptePCG: string
        montantsMensuels: number[]
        tauxTVA: number | null
        evolutionAn2: number
        evolutionAn3: number
    }>
    investissements: Array<{
        libelle: string
        categorie: string
        montantHT: number
        tauxTVA: number
        dateAcquisition: Date
        dureeAmortissement: number
        modeAmortissement: string
    }>
    financements: Array<{
        libelle: string
        type: string
        montant: number
        dateDebut: Date
        duree: number | null
        tauxInteret: number | null
        differe: number | null
    }>
    effectifs: Array<{
        poste: string
        typeContrat: string
        salaireBrutMensuel: number
        primes: number
        dateEmbauche: Date
        tauxChargesPatronales: number
    }>
}

// Couleurs pour le style
const COLORS = {
    navy: '1E3A5F',
    gold: 'C9A227',
    lightGray: 'F5F5F5',
    white: 'FFFFFF',
    green: '22C55E',
    red: 'EF4444',
}

// Style pour les en-têtes
function styleHeader(row: ExcelJS.Row) {
    row.eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.navy },
        }
        cell.font = { bold: true, color: { argb: COLORS.white } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
            bottom: { style: 'thin', color: { argb: COLORS.gold } },
        }
    })
    row.height = 25
}

// Style pour les totaux
function styleTotal(row: ExcelJS.Row) {
    row.eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.gold },
        }
        cell.font = { bold: true, color: { argb: COLORS.navy } }
    })
}

// Style pour les sous-totaux
function styleSubtotal(row: ExcelJS.Row) {
    row.eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: COLORS.lightGray },
        }
        cell.font = { bold: true }
    })
}

// Format monétaire - unused but kept for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatMoney(worksheet: ExcelJS.Worksheet, col: number, startRow: number, endRow: number) {
    for (let r = startRow; r <= endRow; r++) {
        const cell = worksheet.getCell(r, col)
        cell.numFmt = '#,##0.00 €'
    }
}

// Récupérer les données complètes du prévisionnel
async function fetchPrevisionnelData(id: string): Promise<ExportData | null> {
    const prev = await prisma.previsionnel.findUnique({
        where: { id },
        include: {
            client: true,
            hypotheses: true,
            lignesCA: true,
            lignesCharge: true,
            investissements: true,
            financements: true,
            effectifs: true,
        },
    })

    if (!prev) return null

    return {
        previsionnel: {
            id: prev.id,
            titre: prev.titre,
            description: prev.description,
            dateDebut: prev.dateDebut,
            nombreMois: prev.nombreMois,
            regimeFiscal: prev.regimeFiscal,
        },
        client: {
            raisonSociale: prev.client.raisonSociale,
            formeJuridique: prev.client.formeJuridique,
        },
        hypotheses: prev.hypotheses ? {
            tauxTVAVentes: Number(prev.hypotheses.tauxTVAVentes),
            tauxTVAAchats: Number(prev.hypotheses.tauxTVAAchats),
            delaiPaiementClients: prev.hypotheses.delaiPaiementClients,
            delaiPaiementFournisseurs: prev.hypotheses.delaiPaiementFournisseurs,
            tauxChargesSocialesPatronales: Number(prev.hypotheses.tauxChargesSocialesPatronales),
            tauxIS: Number(prev.hypotheses.tauxIS),
        } : null,
        lignesCA: prev.lignesCA.map(l => ({
            libelle: l.libelle,
            categorie: l.categorie,
            montantsMensuels: Array.isArray(l.montantsMensuels) ? l.montantsMensuels as number[] : [],
            tauxTVA: Number(l.tauxTVA),
            evolutionAn2: Number(l.evolutionAn2),
            evolutionAn3: Number(l.evolutionAn3),
        })),
        lignesCharge: prev.lignesCharge.map(l => ({
            libelle: l.libelle,
            categorie: l.categorie,
            comptePCG: l.comptePCG,
            montantsMensuels: Array.isArray(l.montantsMensuels) ? l.montantsMensuels as number[] : [],
            tauxTVA: l.tauxTVA ? Number(l.tauxTVA) : null,
            evolutionAn2: Number(l.evolutionAn2),
            evolutionAn3: Number(l.evolutionAn3),
        })),
        investissements: prev.investissements.map(i => ({
            libelle: i.libelle,
            categorie: i.categorie,
            montantHT: Number(i.montantHT),
            tauxTVA: Number(i.tauxTVA),
            dateAcquisition: i.dateAcquisition,
            dureeAmortissement: i.dureeAmortissement,
            modeAmortissement: i.modeAmortissement,
        })),
        financements: prev.financements.map(f => ({
            libelle: f.libelle,
            type: f.type,
            montant: Number(f.montant),
            dateDebut: f.dateDebut,
            duree: f.duree,
            tauxInteret: f.tauxInteret ? Number(f.tauxInteret) : null,
            differe: f.differe,
        })),
        effectifs: prev.effectifs.map(e => ({
            poste: e.poste,
            typeContrat: e.typeContrat,
            salaireBrutMensuel: Number(e.salaireBrutMensuel),
            primes: Number(e.primes),
            dateEmbauche: e.dateEmbauche,
            tauxChargesPatronales: Number(e.tauxChargesPatronales),
        })),
    }
}

// Calculer CA annuel
function calculerCAAnnuel(lignesCA: ExportData['lignesCA'], annee: number): number {
    let total = 0
    for (const ligne of lignesCA) {
        const montantAn1 = ligne.montantsMensuels.slice(0, 12).reduce((a, b) => a + b, 0)
        if (annee === 1) total += montantAn1
        else if (annee === 2) total += montantAn1 * (1 + ligne.evolutionAn2 / 100)
        else if (annee === 3) total += montantAn1 * (1 + ligne.evolutionAn2 / 100) * (1 + ligne.evolutionAn3 / 100)
    }
    return Math.round(total)
}

// Calculer charges annuelles
function calculerChargesAnnuelles(lignesCharge: ExportData['lignesCharge'], annee: number): number {
    let total = 0
    for (const ligne of lignesCharge) {
        const montantAn1 = ligne.montantsMensuels.slice(0, 12).reduce((a, b) => a + b, 0)
        if (annee === 1) total += montantAn1
        else if (annee === 2) total += montantAn1 * (1 + ligne.evolutionAn2 / 100)
        else if (annee === 3) total += montantAn1 * (1 + ligne.evolutionAn2 / 100) * (1 + ligne.evolutionAn3 / 100)
    }
    return Math.round(total)
}

// Calculer charges de personnel
function calculerChargesPersonnel(effectifs: ExportData['effectifs'], tauxDefault: number): number {
    return effectifs.reduce((sum, e) => {
        const salaire = e.salaireBrutMensuel * 12
        const primes = e.primes
        const charges = (salaire + primes) * (e.tauxChargesPatronales || tauxDefault) / 100
        return sum + salaire + primes + charges
    }, 0)
}

// Calculer dotations aux amortissements
function calculerDotations(investissements: ExportData['investissements']): number {
    return investissements.reduce((sum, inv) => {
        if (inv.modeAmortissement === 'NON_AMORTISSABLE') return sum
        return sum + inv.montantHT / (inv.dureeAmortissement / 12)
    }, 0)
}

// ============================================
// FEUILLE 1 : SYNTHÈSE
// ============================================
function ajouterFeuilleSynthese(workbook: ExcelJS.Workbook, data: ExportData) {
    const ws = workbook.addWorksheet('Synthèse', { properties: { tabColor: { argb: COLORS.navy } } })
    const dateDebut = new Date(data.previsionnel.dateDebut)
    const annee1 = dateDebut.getFullYear()

    // Titre
    ws.mergeCells('A1:D1')
    const titleCell = ws.getCell('A1')
    titleCell.value = `PRÉVISIONNEL FINANCIER - ${data.client.raisonSociale}`
    titleCell.font = { bold: true, size: 16, color: { argb: COLORS.navy } }
    titleCell.alignment = { horizontal: 'center' }

    // Infos générales
    ws.getCell('A3').value = 'Entreprise'
    ws.getCell('B3').value = data.client.raisonSociale
    ws.getCell('A4').value = 'Forme juridique'
    ws.getCell('B4').value = data.client.formeJuridique
    ws.getCell('A5').value = 'Titre'
    ws.getCell('B5').value = data.previsionnel.titre
    ws.getCell('A6').value = 'Date de début'
    ws.getCell('B6').value = dateDebut.toLocaleDateString('fr-FR')
    ws.getCell('A7').value = 'Durée'
    ws.getCell('B7').value = `${data.previsionnel.nombreMois} mois`

    // KPIs
    ws.getCell('A9').value = 'INDICATEURS CLÉS'
    ws.getCell('A9').font = { bold: true, size: 12, color: { argb: COLORS.navy } }

    const tauxCharges = data.hypotheses?.tauxChargesSocialesPatronales || 45
    const tauxIS = data.hypotheses?.tauxIS || 25

    // Calculs
    const ca1 = calculerCAAnnuel(data.lignesCA, 1)
    const ca2 = calculerCAAnnuel(data.lignesCA, 2)
    const ca3 = calculerCAAnnuel(data.lignesCA, 3)
    const charges1 = calculerChargesAnnuelles(data.lignesCharge, 1)
    const charges2 = calculerChargesAnnuelles(data.lignesCharge, 2)
    const charges3 = calculerChargesAnnuelles(data.lignesCharge, 3)
    const personnel = calculerChargesPersonnel(data.effectifs, tauxCharges)
    const dotations = calculerDotations(data.investissements)

    const ebe1 = ca1 - charges1 - personnel
    const ebe2 = ca2 - charges2 - personnel
    const ebe3 = ca3 - charges3 - personnel

    const resultat1 = (ebe1 - dotations) * (1 - tauxIS / 100)
    const resultat2 = (ebe2 - dotations) * (1 - tauxIS / 100)
    const resultat3 = (ebe3 - dotations) * (1 - tauxIS / 100)

    // Tableau synthèse
    ws.columns = [
        { key: 'label', width: 25 },
        { key: 'an1', width: 15 },
        { key: 'an2', width: 15 },
        { key: 'an3', width: 15 },
    ]

    // Add rows to get to row 11
    while (ws.rowCount < 10) {
        ws.addRow([])
    }
    ws.addRow(['', `Année ${annee1}`, `Année ${annee1 + 1}`, `Année ${annee1 + 2}`])
    styleHeader(ws.getRow(11))

    ws.getRow(12).values = ["Chiffre d'affaires HT", ca1, ca2, ca3]
    ws.getRow(13).values = ['Charges externes', charges1, charges2, charges3]
    ws.getRow(14).values = ['Charges de personnel', personnel, personnel, personnel]
    ws.getRow(15).values = ['EBE', ebe1, ebe2, ebe3]
    styleSubtotal(ws.getRow(15))
    ws.getRow(16).values = ['Dotations amortissements', dotations, dotations, dotations]
    ws.getRow(17).values = ['Résultat net', Math.round(resultat1), Math.round(resultat2), Math.round(resultat3)]
    styleTotal(ws.getRow(17))

    // Format monétaire
    for (let r = 12; r <= 17; r++) {
        for (let c = 2; c <= 4; c++) {
            ws.getCell(r, c).numFmt = '#,##0 €'
        }
    }
}

// ============================================
// FEUILLE 2 : CA & CHARGES
// ============================================
function ajouterFeuilleCACharges(workbook: ExcelJS.Workbook, data: ExportData) {
    const ws = workbook.addWorksheet('CA & Charges', { properties: { tabColor: { argb: COLORS.gold } } })
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    // Colonnes
    ws.columns = [
        { key: 'libelle', width: 25 },
        { key: 'categorie', width: 20 },
        ...mois.map(m => ({ key: m, width: 10 })),
        { key: 'total', width: 12 },
        { key: 'evolAn2', width: 10 },
        { key: 'evolAn3', width: 10 },
    ]

    // CHIFFRE D'AFFAIRES
    ws.addRow(["CHIFFRE D'AFFAIRES"])
    ws.getRow(1).font = { bold: true, size: 12, color: { argb: COLORS.navy } }

    const caHeader = ws.addRow(['Libellé', 'Catégorie', ...mois, 'Total An 1', 'Évol. An 2', 'Évol. An 3'])
    styleHeader(caHeader)

    let totalCA = Array(12).fill(0)
    for (const ligne of data.lignesCA) {
        const montants = ligne.montantsMensuels.slice(0, 12)
        while (montants.length < 12) montants.push(0)
        const total = montants.reduce((a, b) => a + b, 0)
        ws.addRow([ligne.libelle, ligne.categorie, ...montants, total, `${ligne.evolutionAn2}%`, `${ligne.evolutionAn3}%`])
        montants.forEach((v, i) => totalCA[i] += v)
    }

    const totalCARow = ws.addRow(['TOTAL CA', '', ...totalCA, totalCA.reduce((a, b) => a + b, 0), '', ''])
    styleTotal(totalCARow)

    // Espace
    ws.addRow([])
    ws.addRow([])

    // CHARGES
    const chargesStartRow = ws.rowCount + 1
    ws.addRow(['CHARGES EXTERNES'])
    ws.getRow(chargesStartRow).font = { bold: true, size: 12, color: { argb: COLORS.navy } }

    const chargesHeader = ws.addRow(['Libellé', 'Catégorie', ...mois, 'Total An 1', 'Évol. An 2', 'Évol. An 3'])
    styleHeader(chargesHeader)

    let totalCharges = Array(12).fill(0)
    for (const ligne of data.lignesCharge) {
        const montants = ligne.montantsMensuels.slice(0, 12)
        while (montants.length < 12) montants.push(0)
        const total = montants.reduce((a, b) => a + b, 0)
        ws.addRow([ligne.libelle, ligne.categorie, ...montants, total, `${ligne.evolutionAn2}%`, `${ligne.evolutionAn3}%`])
        montants.forEach((v, i) => totalCharges[i] += v)
    }

    const totalChargesRow = ws.addRow(['TOTAL CHARGES', '', ...totalCharges, totalCharges.reduce((a, b) => a + b, 0), '', ''])
    styleTotal(totalChargesRow)
}

// ============================================
// FEUILLE 3 : SIG (Soldes Intermédiaires de Gestion)
// ============================================
function ajouterFeuilleSIG(workbook: ExcelJS.Workbook, data: ExportData) {
    const ws = workbook.addWorksheet('SIG', { properties: { tabColor: { argb: COLORS.green } } })
    const dateDebut = new Date(data.previsionnel.dateDebut)
    const annee1 = dateDebut.getFullYear()
    const tauxCharges = data.hypotheses?.tauxChargesSocialesPatronales || 45
    const tauxIS = data.hypotheses?.tauxIS || 25

    ws.columns = [
        { key: 'label', width: 35 },
        { key: 'an1', width: 15 },
        { key: 'an2', width: 15 },
        { key: 'an3', width: 15 },
    ]

    // Titre
    ws.mergeCells('A1:D1')
    ws.getCell('A1').value = 'SOLDES INTERMÉDIAIRES DE GESTION'
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: COLORS.navy } }

    // En-têtes
    ws.getRow(3).values = ['Libellé', `${annee1}`, `${annee1 + 1}`, `${annee1 + 2}`]
    styleHeader(ws.getRow(3))

    // Calculs pour chaque année
    const calculSIG = (annee: number) => {
        const ca = calculerCAAnnuel(data.lignesCA, annee)
        const achats = Math.round(calculerChargesAnnuelles(data.lignesCharge, annee) * 0.6)
        const services = Math.round(calculerChargesAnnuelles(data.lignesCharge, annee) * 0.4)
        const personnel = calculerChargesPersonnel(data.effectifs, tauxCharges)
        const dotations = calculerDotations(data.investissements)

        const margeCommerciale = ca - achats
        const valeurAjoutee = margeCommerciale - services
        const ebe = valeurAjoutee - personnel
        const resultatExploitation = ebe - dotations
        const resultatNet = Math.round(resultatExploitation * (1 - tauxIS / 100))
        const caf = resultatNet + dotations

        return { ca, achats, services, personnel, margeCommerciale, valeurAjoutee, ebe, dotations, resultatExploitation, resultatNet, caf }
    }

    const sig1 = calculSIG(1)
    const sig2 = calculSIG(2)
    const sig3 = calculSIG(3)

    // Lignes SIG
    let row = 4
    const addSIGRow = (label: string, v1: number, v2: number, v3: number, isTotal = false, isSubtotal = false) => {
        ws.getRow(row).values = [label, v1, v2, v3]
        if (isTotal) styleTotal(ws.getRow(row))
        else if (isSubtotal) styleSubtotal(ws.getRow(row))
        for (let c = 2; c <= 4; c++) ws.getCell(row, c).numFmt = '#,##0 €'
        row++
    }

    addSIGRow("Ventes de marchandises", sig1.ca, sig2.ca, sig3.ca)
    addSIGRow("- Coût d'achat des marchandises", -sig1.achats, -sig2.achats, -sig3.achats)
    addSIGRow("= MARGE COMMERCIALE", sig1.margeCommerciale, sig2.margeCommerciale, sig3.margeCommerciale, false, true)
    row++
    addSIGRow("Production de l'exercice", sig1.ca, sig2.ca, sig3.ca)
    addSIGRow("- Consommations intermédiaires", -sig1.services, -sig2.services, -sig3.services)
    addSIGRow("= VALEUR AJOUTÉE", sig1.valeurAjoutee, sig2.valeurAjoutee, sig3.valeurAjoutee, false, true)
    row++
    addSIGRow("- Charges de personnel", -sig1.personnel, -sig2.personnel, -sig3.personnel)
    addSIGRow("= EBE (Excédent Brut d'Exploitation)", sig1.ebe, sig2.ebe, sig3.ebe, true)
    row++
    addSIGRow("- Dotations aux amortissements", -sig1.dotations, -sig2.dotations, -sig3.dotations)
    addSIGRow("= RÉSULTAT D'EXPLOITATION", sig1.resultatExploitation, sig2.resultatExploitation, sig3.resultatExploitation, false, true)
    row++
    addSIGRow("- Impôt sur les bénéfices",
        -Math.round(sig1.resultatExploitation * tauxIS / 100),
        -Math.round(sig2.resultatExploitation * tauxIS / 100),
        -Math.round(sig3.resultatExploitation * tauxIS / 100))
    addSIGRow("= RÉSULTAT NET", sig1.resultatNet, sig2.resultatNet, sig3.resultatNet, true)
    row++
    addSIGRow("+ Dotations aux amortissements", sig1.dotations, sig2.dotations, sig3.dotations)
    addSIGRow("= CAF (Capacité d'Autofinancement)", sig1.caf, sig2.caf, sig3.caf, true)
}

// ============================================
// FEUILLE 4 : INVESTISSEMENTS
// ============================================
function ajouterFeuilleInvestissements(workbook: ExcelJS.Workbook, data: ExportData) {
    const ws = workbook.addWorksheet('Investissements', { properties: { tabColor: { argb: COLORS.navy } } })
    const dateDebut = new Date(data.previsionnel.dateDebut)
    const annee1 = dateDebut.getFullYear()

    ws.columns = [
        { key: 'libelle', width: 25 },
        { key: 'categorie', width: 20 },
        { key: 'montant', width: 15 },
        { key: 'date', width: 12 },
        { key: 'duree', width: 12 },
        { key: 'mode', width: 12 },
        { key: 'dotAn1', width: 12 },
        { key: 'dotAn2', width: 12 },
        { key: 'dotAn3', width: 12 },
    ]

    // Titre
    ws.mergeCells('A1:I1')
    ws.getCell('A1').value = 'PLAN D\'INVESTISSEMENT ET AMORTISSEMENTS'
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: COLORS.navy } }

    // En-têtes
    ws.getRow(3).values = ['Libellé', 'Catégorie', 'Montant HT', 'Date acq.', 'Durée (ans)', 'Mode', `Dot. ${annee1}`, `Dot. ${annee1 + 1}`, `Dot. ${annee1 + 2}`]
    styleHeader(ws.getRow(3))

    let totalMontant = 0
    let totalDot = [0, 0, 0]

    for (const inv of data.investissements) {
        const dureeAns = inv.dureeAmortissement / 12
        const dotAnnuelle = inv.modeAmortissement === 'NON_AMORTISSABLE' ? 0 : Math.round(inv.montantHT / dureeAns)

        ws.addRow([
            inv.libelle,
            inv.categorie,
            inv.montantHT,
            new Date(inv.dateAcquisition).toLocaleDateString('fr-FR'),
            dureeAns,
            inv.modeAmortissement,
            dotAnnuelle,
            dotAnnuelle,
            dotAnnuelle,
        ])

        totalMontant += inv.montantHT
        totalDot[0] += dotAnnuelle
        totalDot[1] += dotAnnuelle
        totalDot[2] += dotAnnuelle
    }

    const totalRow = ws.addRow(['TOTAL', '', totalMontant, '', '', '', totalDot[0], totalDot[1], totalDot[2]])
    styleTotal(totalRow)

    // Format
    for (let r = 4; r <= ws.rowCount; r++) {
        ws.getCell(r, 3).numFmt = '#,##0 €'
        ws.getCell(r, 7).numFmt = '#,##0 €'
        ws.getCell(r, 8).numFmt = '#,##0 €'
        ws.getCell(r, 9).numFmt = '#,##0 €'
    }
}

// ============================================
// FEUILLE 5 : FINANCEMENT
// ============================================
function ajouterFeuilleFinancement(workbook: ExcelJS.Workbook, data: ExportData) {
    const ws = workbook.addWorksheet('Financement', { properties: { tabColor: { argb: COLORS.gold } } })

    ws.columns = [
        { key: 'libelle', width: 25 },
        { key: 'type', width: 20 },
        { key: 'montant', width: 15 },
        { key: 'date', width: 12 },
        { key: 'duree', width: 12 },
        { key: 'taux', width: 10 },
        { key: 'mensualite', width: 12 },
    ]

    // Titre
    ws.mergeCells('A1:G1')
    ws.getCell('A1').value = 'PLAN DE FINANCEMENT'
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: COLORS.navy } }

    // En-têtes
    ws.getRow(3).values = ['Libellé', 'Type', 'Montant', 'Date', 'Durée (mois)', 'Taux %', 'Mensualité']
    styleHeader(ws.getRow(3))

    const typeLabels: Record<string, string> = {
        'CAPITAL_SOCIAL': 'Capital social',
        'COMPTE_COURANT_ASSOCIE': 'Compte courant',
        'EMPRUNT_BANCAIRE': 'Emprunt bancaire',
        'SUBVENTION': 'Subvention',
        'CREDIT_BAIL': 'Crédit-bail',
    }

    let totalFinancement = 0
    for (const fin of data.financements) {
        let mensualite = 0
        if (fin.tauxInteret && fin.duree && fin.duree > 0) {
            const tauxMensuel = (fin.tauxInteret / 100) / 12
            mensualite = fin.montant * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -fin.duree))
        }

        ws.addRow([
            fin.libelle,
            typeLabels[fin.type] || fin.type,
            fin.montant,
            new Date(fin.dateDebut).toLocaleDateString('fr-FR'),
            fin.duree || '-',
            fin.tauxInteret ? `${fin.tauxInteret}%` : '-',
            mensualite > 0 ? Math.round(mensualite) : '-',
        ])

        totalFinancement += fin.montant
    }

    const totalRow = ws.addRow(['TOTAL FINANCEMENT', '', totalFinancement, '', '', '', ''])
    styleTotal(totalRow)

    // Format monétaire
    for (let r = 4; r <= ws.rowCount; r++) {
        ws.getCell(r, 3).numFmt = '#,##0 €'
        if (typeof ws.getCell(r, 7).value === 'number') {
            ws.getCell(r, 7).numFmt = '#,##0 €'
        }
    }
}

// ============================================
// FEUILLE 6 : TRÉSORERIE
// ============================================
function ajouterFeuilleTresorerie(workbook: ExcelJS.Workbook, data: ExportData) {
    const ws = workbook.addWorksheet('Trésorerie', { properties: { tabColor: { argb: COLORS.green } } })
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const delaiClients = data.hypotheses?.delaiPaiementClients || 30
    const delaiFournisseurs = data.hypotheses?.delaiPaiementFournisseurs || 30

    ws.columns = [
        { key: 'label', width: 25 },
        ...mois.map(m => ({ key: m, width: 10 })),
        { key: 'total', width: 12 },
    ]

    // Titre
    ws.mergeCells('A1:N1')
    ws.getCell('A1').value = 'BUDGET DE TRÉSORERIE - ANNÉE 1'
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: COLORS.navy } }

    // En-têtes
    ws.getRow(3).values = ['', ...mois, 'TOTAL']
    styleHeader(ws.getRow(3))

    // Calcul CA mensuel avec TVA et délai
    const decalageMois = Math.round(delaiClients / 30)

    // Encaissements (CA décalé du délai client)
    const encaissements = Array(12).fill(0)
    for (const ligne of data.lignesCA) {
        for (let m = 0; m < 12; m++) {
            const moisEncaissement = m + decalageMois
            if (moisEncaissement < 12) {
                encaissements[moisEncaissement] += (ligne.montantsMensuels[m] || 0) * (1 + ligne.tauxTVA / 100)
            }
        }
    }

    // Apports initiaux (mois 1)
    const apportsInitiaux = data.financements.reduce((sum, f) => {
        if (['CAPITAL_SOCIAL', 'COMPTE_COURANT_ASSOCIE', 'EMPRUNT_BANCAIRE'].includes(f.type)) {
            return sum + f.montant
        }
        return sum
    }, 0)
    encaissements[0] += apportsInitiaux

    // Décaissements
    const decaissements = Array(12).fill(0)
    for (const ligne of data.lignesCharge) {
        for (let m = 0; m < 12; m++) {
            decaissements[m] += ligne.montantsMensuels[m] || 0
        }
    }

    // Salaires mensuels
    const salaireMensuel = data.effectifs.reduce((sum, e) => {
        return sum + e.salaireBrutMensuel * (1 + e.tauxChargesPatronales / 100)
    }, 0)
    for (let m = 0; m < 12; m++) {
        decaissements[m] += salaireMensuel
    }

    // Investissements mois 1
    const investissementsTotal = data.investissements.reduce((sum, i) => sum + i.montantHT * (1 + i.tauxTVA / 100), 0)
    decaissements[0] += investissementsTotal

    // Soldes
    const soldes = encaissements.map((e, i) => Math.round(e - decaissements[i]))
    let cumul = 0
    const cumulatifs = soldes.map(s => { cumul += s; return cumul })

    // Ajout des lignes
    ws.addRow(['ENCAISSEMENTS'])
    ws.getRow(4).font = { bold: true, color: { argb: COLORS.navy } }
    ws.addRow(["  Ventes encaissées", ...encaissements.map(e => Math.round(e)), encaissements.reduce((a, b) => a + b, 0)])

    ws.addRow([])
    ws.addRow(['DÉCAISSEMENTS'])
    ws.getRow(ws.rowCount).font = { bold: true, color: { argb: COLORS.navy } }
    ws.addRow(["  Charges décaissées", ...decaissements.map(d => Math.round(d)), decaissements.reduce((a, b) => a + b, 0)])

    ws.addRow([])
    const soldeRow = ws.addRow(['SOLDE DU MOIS', ...soldes, soldes.reduce((a, b) => a + b, 0)])
    styleSubtotal(soldeRow)

    const cumulRow = ws.addRow(['TRÉSORERIE CUMULÉE', ...cumulatifs.map(c => Math.round(c)), ''])
    styleTotal(cumulRow)

    // Format et couleurs conditionnelles
    for (let r = 5; r <= ws.rowCount; r++) {
        for (let c = 2; c <= 14; c++) {
            ws.getCell(r, c).numFmt = '#,##0 €'
        }
    }
}

// ============================================
// FEUILLE 7 : BILAN
// ============================================
function ajouterFeuilleBilan(workbook: ExcelJS.Workbook, data: ExportData) {
    const ws = workbook.addWorksheet('Bilan', { properties: { tabColor: { argb: COLORS.navy } } })
    const dateDebut = new Date(data.previsionnel.dateDebut)
    const annee1 = dateDebut.getFullYear()
    const tauxCharges = data.hypotheses?.tauxChargesSocialesPatronales || 45
    const tauxIS = data.hypotheses?.tauxIS || 25

    ws.columns = [
        { key: 'label', width: 30 },
        { key: 'an1', width: 15 },
        { key: 'an2', width: 15 },
        { key: 'an3', width: 15 },
    ]

    // Calculs
    const immobilisationsBrutes = data.investissements.reduce((sum, i) => sum + i.montantHT, 0)
    const dotationAnnuelle = calculerDotations(data.investissements)

    const calculBilan = (annee: number) => {
        const ca = calculerCAAnnuel(data.lignesCA, annee)
        const charges = calculerChargesAnnuelles(data.lignesCharge, annee)
        const personnel = calculerChargesPersonnel(data.effectifs, tauxCharges)
        const ebe = ca - charges - personnel
        const resultat = Math.round((ebe - dotationAnnuelle) * (1 - tauxIS / 100))

        const amortissementsCumules = dotationAnnuelle * annee
        const immobilisationsNettes = Math.max(0, immobilisationsBrutes - amortissementsCumules)

        const capital = data.financements
            .filter(f => f.type === 'CAPITAL_SOCIAL')
            .reduce((sum, f) => sum + f.montant, 0)

        const empruntsInitiaux = data.financements
            .filter(f => f.type === 'EMPRUNT_BANCAIRE')
            .reduce((sum, f) => sum + f.montant, 0)
        const empruntsRestants = Math.max(0, empruntsInitiaux - (empruntsInitiaux / 5 * annee))

        return { immobilisationsNettes, ca, resultat, capital, empruntsRestants }
    }

    const b1 = calculBilan(1)
    const b2 = calculBilan(2)
    const b3 = calculBilan(3)

    // ACTIF
    ws.mergeCells('A1:D1')
    ws.getCell('A1').value = 'BILAN PRÉVISIONNEL'
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: COLORS.navy } }

    ws.getRow(3).values = ['ACTIF', `${annee1}`, `${annee1 + 1}`, `${annee1 + 2}`]
    styleHeader(ws.getRow(3))

    ws.getRow(4).values = ['Immobilisations nettes', b1.immobilisationsNettes, b2.immobilisationsNettes, b3.immobilisationsNettes]
    ws.getRow(5).values = ['Créances clients', Math.round(b1.ca * 0.1), Math.round(b2.ca * 0.1), Math.round(b3.ca * 0.1)]
    ws.getRow(6).values = ['Disponibilités', Math.round(b1.resultat * 0.5), Math.round((b1.resultat + b2.resultat) * 0.5), Math.round((b1.resultat + b2.resultat + b3.resultat) * 0.5)]

    const totalActif = (b: typeof b1, resultatsCumules: number) => b.immobilisationsNettes + Math.round(b.ca * 0.1) + Math.round(resultatsCumules * 0.5)
    ws.getRow(7).values = ['TOTAL ACTIF', totalActif(b1, b1.resultat), totalActif(b2, b1.resultat + b2.resultat), totalActif(b3, b1.resultat + b2.resultat + b3.resultat)]
    styleTotal(ws.getRow(7))

    // PASSIF
    ws.addRow([])
    ws.getRow(9).values = ['PASSIF', `${annee1}`, `${annee1 + 1}`, `${annee1 + 2}`]
    styleHeader(ws.getRow(9))

    ws.getRow(10).values = ['Capital social', b1.capital, b1.capital, b1.capital]
    ws.getRow(11).values = ['Réserves', 0, b1.resultat, b1.resultat + b2.resultat]
    ws.getRow(12).values = ["Résultat de l'exercice", b1.resultat, b2.resultat, b3.resultat]
    ws.getRow(13).values = ['Emprunts', b1.empruntsRestants, b2.empruntsRestants, b3.empruntsRestants]
    ws.getRow(14).values = ['Dettes fournisseurs', Math.round(b1.ca * 0.05), Math.round(b2.ca * 0.05), Math.round(b3.ca * 0.05)]

    const totalPassif = (b: typeof b1, reservesCumulees: number) => b.capital + reservesCumulees + b.resultat + b.empruntsRestants + Math.round(b.ca * 0.05)
    ws.getRow(15).values = ['TOTAL PASSIF', totalPassif(b1, 0), totalPassif(b2, b1.resultat), totalPassif(b3, b1.resultat + b2.resultat)]
    styleTotal(ws.getRow(15))

    // Format monétaire
    for (let r = 4; r <= 15; r++) {
        for (let c = 2; c <= 4; c++) {
            ws.getCell(r, c).numFmt = '#,##0 €'
        }
    }
}

// ============================================
// FONCTION PRINCIPALE
// ============================================
export async function genererExcelPrevisionnel(previsionnelId: string): Promise<Buffer> {
    const data = await fetchPrevisionnelData(previsionnelId)

    if (!data) {
        throw new Error('Prévisionnel non trouvé')
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Expert-Comptable SAAS'
    workbook.created = new Date()
    workbook.modified = new Date()

    // Ajouter toutes les feuilles
    ajouterFeuilleSynthese(workbook, data)
    ajouterFeuilleCACharges(workbook, data)
    ajouterFeuilleSIG(workbook, data)
    ajouterFeuilleInvestissements(workbook, data)
    ajouterFeuilleFinancement(workbook, data)
    ajouterFeuilleTresorerie(workbook, data)
    ajouterFeuilleBilan(workbook, data)

    // Générer le buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
}

export { fetchPrevisionnelData }
