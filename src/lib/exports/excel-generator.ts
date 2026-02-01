import ExcelJS from 'exceljs'

export interface BenchmarkExportData {
    secteur: {
        codeNAF: string
        libelle: string
        annee: number
    }
    scoreGlobal: number
    comparaisons: {
        nom: string
        valeur: number
        mediane: number | null
        ecart: number | null
        position: string
        unite: string
    }[]
}

export interface ExcelExportData {
    titre: string
    client: {
        raisonSociale: string
        formeJuridique: string
    }
    dateDebut: Date
    nombreMois: number

    // Données Compte de Résultat
    compteResultat: {
        annee: number
        ca: number
        charges: number
        chargesPersonnel: number
        dotationsAmortissements: number
        resultatNet: number
        ebe: number
    }[]

    // Données Bilan
    bilan: {
        annee: number
        actifImmobilise: number
        actifCirculant: number
        tresorerie: number
        capitauxPropres: number
        dettes: number
    }[]

    // Données Financement
    financement: {
        annee: number
        ressources: number
        emplois: number
        variation: number
    }[]

    // Trésorerie mensuelle
    tresorerieMensuelle: {
        mois: string
        encaissements: number
        decaissements: number
        solde: number
        tresorerieFin: number
    }[]

    // Benchmarks sectoriels (optionnel)
    benchmarks?: BenchmarkExportData
}

export async function generateExcelExport(data: ExcelExportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Expert-Comptable SAAS'
    workbook.created = new Date()

    // ============================================
    // ONGLET 1 : COMPTE DE RÉSULTAT
    // ============================================
    const crSheet = workbook.addWorksheet('Compte de Résultat', {
        properties: { tabColor: { argb: '4CAF50' } },
    })

    // En-tête
    crSheet.mergeCells('A1:E1')
    crSheet.getCell('A1').value = `COMPTE DE RÉSULTAT PRÉVISIONNEL - ${data.client.raisonSociale}`
    crSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: '1565C0' } }
    crSheet.getCell('A1').alignment = { horizontal: 'center' }

    crSheet.getRow(3).values = ['Poste', ...data.compteResultat.map(d => `Année ${d.annee}`)]
    crSheet.getRow(3).font = { bold: true }
    crSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E3F2FD' } }

    // Données
    const crData = [
        ['Chiffre d\'affaires', ...data.compteResultat.map(d => d.ca)],
        ['Charges externes', ...data.compteResultat.map(d => -d.charges)],
        ['Charges de personnel', ...data.compteResultat.map(d => -d.chargesPersonnel)],
        ['Excédent Brut d\'Exploitation (EBE)', ...data.compteResultat.map(d => d.ebe)],
        ['Dotations aux amortissements', ...data.compteResultat.map(d => -d.dotationsAmortissements)],
        ['Résultat Net', ...data.compteResultat.map(d => d.resultatNet)],
    ]

    crData.forEach((row, idx) => {
        crSheet.getRow(4 + idx).values = row
        // Format nombre pour les colonnes de valeurs
        for (let col = 2; col <= data.compteResultat.length + 1; col++) {
            const cell = crSheet.getRow(4 + idx).getCell(col)
            cell.numFmt = '#,##0 €'
        }
        // Mise en forme spéciale pour EBE et Résultat Net
        if (row[0] === 'Excédent Brut d\'Exploitation (EBE)' || row[0] === 'Résultat Net') {
            crSheet.getRow(4 + idx).font = { bold: true }
            crSheet.getRow(4 + idx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E0' } }
        }
    })

    // Ajuster les largeurs de colonnes
    crSheet.columns = [
        { width: 35 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
    ]

    // Graphique Evolution CA (commenté car ExcelJS a un support limité des graphiques)
    // Les graphiques seront générés côté client avec une bibliothèque JS

    // ============================================
    // ONGLET 2 : BILAN PRÉVISIONNEL
    // ============================================
    const bilanSheet = workbook.addWorksheet('Bilan', {
        properties: { tabColor: { argb: '2196F3' } },
    })

    bilanSheet.mergeCells('A1:E1')
    bilanSheet.getCell('A1').value = `BILAN PRÉVISIONNEL - ${data.client.raisonSociale}`
    bilanSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: '1565C0' } }
    bilanSheet.getCell('A1').alignment = { horizontal: 'center' }

    // ACTIF
    bilanSheet.getRow(3).values = ['ACTIF', ...data.bilan.map(d => `${d.annee}`)]
    bilanSheet.getRow(3).font = { bold: true }
    bilanSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C8E6C9' } }

    const actifData = [
        ['Immobilisations nettes', ...data.bilan.map(d => d.actifImmobilise)],
        ['Actif circulant', ...data.bilan.map(d => d.actifCirculant)],
        ['Disponibilités', ...data.bilan.map(d => d.tresorerie)],
        ['TOTAL ACTIF', ...data.bilan.map(d => d.actifImmobilise + d.actifCirculant + d.tresorerie)],
    ]

    actifData.forEach((row, idx) => {
        bilanSheet.getRow(4 + idx).values = row
        for (let col = 2; col <= data.bilan.length + 1; col++) {
            bilanSheet.getRow(4 + idx).getCell(col).numFmt = '#,##0 €'
        }
        if (row[0] === 'TOTAL ACTIF') {
            bilanSheet.getRow(4 + idx).font = { bold: true }
            bilanSheet.getRow(4 + idx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A5D6A7' } }
        }
    })

    // PASSIF
    const passifStartRow = 9
    bilanSheet.getRow(passifStartRow).values = ['PASSIF', ...data.bilan.map(d => `${d.annee}`)]
    bilanSheet.getRow(passifStartRow).font = { bold: true }
    bilanSheet.getRow(passifStartRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCDD2' } }

    const passifData = [
        ['Capitaux propres', ...data.bilan.map(d => d.capitauxPropres)],
        ['Dettes', ...data.bilan.map(d => d.dettes)],
        ['TOTAL PASSIF', ...data.bilan.map(d => d.capitauxPropres + d.dettes)],
    ]

    passifData.forEach((row, idx) => {
        bilanSheet.getRow(passifStartRow + 1 + idx).values = row
        for (let col = 2; col <= data.bilan.length + 1; col++) {
            bilanSheet.getRow(passifStartRow + 1 + idx).getCell(col).numFmt = '#,##0 €'
        }
        if (row[0] === 'TOTAL PASSIF') {
            bilanSheet.getRow(passifStartRow + 1 + idx).font = { bold: true }
            bilanSheet.getRow(passifStartRow + 1 + idx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EF9A9A' } }
        }
    })

    bilanSheet.columns = [
        { width: 25 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
    ]

    // ============================================
    // ONGLET 3 : PLAN DE FINANCEMENT
    // ============================================
    const finSheet = workbook.addWorksheet('Plan de Financement', {
        properties: { tabColor: { argb: 'FF9800' } },
    })

    finSheet.mergeCells('A1:E1')
    finSheet.getCell('A1').value = `PLAN DE FINANCEMENT - ${data.client.raisonSociale}`
    finSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'E65100' } }
    finSheet.getCell('A1').alignment = { horizontal: 'center' }

    finSheet.getRow(3).values = ['Poste', ...data.financement.map(d => `${d.annee}`)]
    finSheet.getRow(3).font = { bold: true }
    finSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0B2' } }

    const finData = [
        ['Ressources', ...data.financement.map(d => d.ressources)],
        ['Emplois', ...data.financement.map(d => d.emplois)],
        ['Variation de trésorerie', ...data.financement.map(d => d.variation)],
    ]

    finData.forEach((row, idx) => {
        finSheet.getRow(4 + idx).values = row
        for (let col = 2; col <= data.financement.length + 1; col++) {
            const cell = finSheet.getRow(4 + idx).getCell(col)
            cell.numFmt = '#,##0 €'
            // Colorer en rouge/vert selon le signe pour la variation
            if (row[0] === 'Variation de trésorerie') {
                const value = row[col - 1] as number
                if (value < 0) {
                    cell.font = { color: { argb: 'D32F2F' } }
                } else {
                    cell.font = { color: { argb: '388E3C' } }
                }
            }
        }
        if (row[0] === 'Variation de trésorerie') {
            finSheet.getRow(4 + idx).font = { bold: true }
        }
    })

    finSheet.columns = [
        { width: 25 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
    ]

    // ============================================
    // ONGLET 4 : TRÉSORERIE MENSUELLE
    // ============================================
    const tresoSheet = workbook.addWorksheet('Trésorerie Mensuelle', {
        properties: { tabColor: { argb: '9C27B0' } },
    })

    tresoSheet.mergeCells('A1:F1')
    tresoSheet.getCell('A1').value = `PLAN DE TRÉSORERIE MENSUEL - Année 1`
    tresoSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: '6A1B9A' } }
    tresoSheet.getCell('A1').alignment = { horizontal: 'center' }

    tresoSheet.getRow(3).values = ['Mois', 'Encaissements', 'Décaissements', 'Solde mensuel', 'Trésorerie fin']
    tresoSheet.getRow(3).font = { bold: true }
    tresoSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E1BEE7' } }

    data.tresorerieMensuelle.forEach((mois, idx) => {
        tresoSheet.getRow(4 + idx).values = [
            mois.mois,
            mois.encaissements,
            mois.decaissements,
            mois.solde,
            mois.tresorerieFin,
        ]

        // Format nombre
        for (let col = 2; col <= 5; col++) {
            tresoSheet.getRow(4 + idx).getCell(col).numFmt = '#,##0 €'
        }

        // Colorer la trésorerie fin de mois
        const tresoCell = tresoSheet.getRow(4 + idx).getCell(5)
        if (mois.tresorerieFin < 0) {
            tresoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCDD2' } }
            tresoCell.font = { color: { argb: 'D32F2F' }, bold: true }
        } else {
            tresoCell.font = { color: { argb: '388E3C' } }
        }
    })

    tresoSheet.columns = [
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
    ]

    // ============================================
    // ONGLET 5 : GRAPHIQUES (Données pour graphiques)
    // ============================================
    const graphSheet = workbook.addWorksheet('Données Graphiques', {
        properties: { tabColor: { argb: '607D8B' } },
    })

    graphSheet.getCell('A1').value = 'Données pour graphiques (utilisables dans Excel)'
    graphSheet.getCell('A1').font = { bold: true, size: 14 }

    // Données CA pour graphique d'évolution
    graphSheet.getCell('A3').value = 'Évolution du CA'
    graphSheet.getCell('A3').font = { bold: true }
    graphSheet.getRow(4).values = ['Année', 'CA']
    data.compteResultat.forEach((d, idx) => {
        graphSheet.getRow(5 + idx).values = [d.annee, d.ca]
        graphSheet.getRow(5 + idx).getCell(2).numFmt = '#,##0 €'
    })

    // Données répartition charges pour camembert
    graphSheet.getCell('D3').value = 'Répartition des charges (Année 1)'
    graphSheet.getCell('D3').font = { bold: true }
    graphSheet.getRow(4).getCell(4).value = 'Type'
    graphSheet.getRow(4).getCell(5).value = 'Montant'

    const an1 = data.compteResultat[0]
    if (an1) {
        graphSheet.getRow(5).values = ['', '', '', 'Charges externes', an1.charges]
        graphSheet.getRow(6).values = ['', '', '', 'Personnel', an1.chargesPersonnel]
        graphSheet.getRow(7).values = ['', '', '', 'Amortissements', an1.dotationsAmortissements]
    }

    graphSheet.columns = [
        { width: 12 },
        { width: 15 },
        { width: 5 },
        { width: 20 },
        { width: 15 },
    ]

    // ============================================
    // ONGLET 6 : BENCHMARKS SECTORIELS
    // ============================================
    if (data.benchmarks) {
        const benchSheet = workbook.addWorksheet('Benchmarks Sectoriels', {
            properties: { tabColor: { argb: '00BCD4' } },
        })

        benchSheet.mergeCells('A1:F1')
        benchSheet.getCell('A1').value = `BENCHMARKS SECTORIELS - ${data.client.raisonSociale}`
        benchSheet.getCell('A1').font = { size: 16, bold: true, color: { argb: '006064' } }
        benchSheet.getCell('A1').alignment = { horizontal: 'center' }

        // Infos secteur
        benchSheet.getCell('A3').value = 'Secteur d\'activité :'
        benchSheet.getCell('A3').font = { bold: true }
        benchSheet.getCell('B3').value = `${data.benchmarks.secteur.codeNAF} - ${data.benchmarks.secteur.libelle}`

        benchSheet.getCell('A4').value = 'Année de référence :'
        benchSheet.getCell('A4').font = { bold: true }
        benchSheet.getCell('B4').value = data.benchmarks.secteur.annee

        // Score global
        benchSheet.getCell('A6').value = 'Score de positionnement :'
        benchSheet.getCell('A6').font = { bold: true }
        benchSheet.getCell('B6').value = `${Math.round(data.benchmarks.scoreGlobal)} / 100`
        const scoreCell = benchSheet.getCell('B6')
        if (data.benchmarks.scoreGlobal >= 75) {
            scoreCell.font = { bold: true, color: { argb: '388E3C' } }
        } else if (data.benchmarks.scoreGlobal >= 50) {
            scoreCell.font = { bold: true, color: { argb: 'F57C00' } }
        } else {
            scoreCell.font = { bold: true, color: { argb: 'D32F2F' } }
        }

        // Tableau des ratios
        benchSheet.getRow(8).values = ['Ratio', 'Votre valeur', 'Médiane secteur', 'Écart', 'Position']
        benchSheet.getRow(8).font = { bold: true }
        benchSheet.getRow(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B2EBF2' } }

        data.benchmarks.comparaisons.forEach((comp, idx) => {
            const row = benchSheet.getRow(9 + idx)
            row.values = [
                comp.nom,
                comp.unite === '%' ? `${comp.valeur.toFixed(1)}%` : `${Math.round(comp.valeur)} j`,
                comp.mediane !== null
                    ? (comp.unite === '%' ? `${comp.mediane.toFixed(1)}%` : `${Math.round(comp.mediane)} j`)
                    : 'N/A',
                comp.ecart !== null
                    ? (comp.ecart > 0 ? `+${comp.ecart.toFixed(1)}` : comp.ecart.toFixed(1))
                    : 'N/A',
                comp.position === 'SUPERIEUR' ? 'Au-dessus'
                    : comp.position === 'INFERIEUR' ? 'En-dessous'
                    : 'Aligné'
            ]

            // Colorer la position
            const posCell = row.getCell(5)
            if (comp.position === 'SUPERIEUR') {
                posCell.font = { color: { argb: '388E3C' } }
                posCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } }
            } else if (comp.position === 'INFERIEUR') {
                posCell.font = { color: { argb: 'D32F2F' } }
                posCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBEE' } }
            } else {
                posCell.font = { color: { argb: 'F57C00' } }
                posCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E0' } }
            }
        })

        benchSheet.columns = [
            { width: 28 },
            { width: 15 },
            { width: 18 },
            { width: 12 },
            { width: 14 },
        ]
    }

    // Générer le buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
}
