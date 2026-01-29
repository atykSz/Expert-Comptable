import { NextResponse } from 'next/server'
import { generateExcelExport, ExcelExportData } from '@/lib/exports/excel-generator'

// GET /api/exports/excel/[id] - Générer et télécharger l'export Excel
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // TODO: Récupérer les vraies données depuis la base de données
        // Pour l'instant, données de démonstration
        const demoData: ExcelExportData = {
            titre: 'Prévisionnel Démo',
            client: {
                raisonSociale: 'Ma Société SAS',
                formeJuridique: 'SAS',
            },
            dateDebut: new Date('2026-01-01'),
            nombreMois: 36,

            compteResultat: [
                { annee: 2026, ca: 60000, charges: 20000, chargesPersonnel: 30000, dotationsAmortissements: 5000, resultatNet: 5000, ebe: 10000 },
                { annee: 2027, ca: 72000, charges: 22000, chargesPersonnel: 32000, dotationsAmortissements: 5000, resultatNet: 13000, ebe: 18000 },
                { annee: 2028, ca: 87000, charges: 24000, chargesPersonnel: 35000, dotationsAmortissements: 5000, resultatNet: 23000, ebe: 28000 },
            ],

            bilan: [
                { annee: 2026, actifImmobilise: 33000, actifCirculant: 8000, tresorerie: 10000, capitauxPropres: 15000, dettes: 36000 },
                { annee: 2027, actifImmobilise: 28000, actifCirculant: 10000, tresorerie: 15000, capitauxPropres: 28000, dettes: 25000 },
                { annee: 2028, actifImmobilise: 23000, actifCirculant: 12000, tresorerie: 22000, capitauxPropres: 43000, dettes: 14000 },
            ],

            financement: [
                { annee: 2026, ressources: 40000, emplois: 43000, variation: -3000 },
                { annee: 2027, ressources: 18000, emplois: 13000, variation: 5000 },
                { annee: 2028, ressources: 28000, emplois: 11000, variation: 17000 },
            ],

            tresorerieMensuelle: [
                { mois: 'Jan', encaissements: 5000, decaissements: 4500, solde: 500, tresorerieFin: 10500 },
                { mois: 'Fév', encaissements: 5000, decaissements: 4500, solde: 500, tresorerieFin: 11000 },
                { mois: 'Mar', encaissements: 5000, decaissements: 4500, solde: 500, tresorerieFin: 11500 },
                { mois: 'Avr', encaissements: 5000, decaissements: 4500, solde: 500, tresorerieFin: 12000 },
                { mois: 'Mai', encaissements: 5000, decaissements: 4500, solde: 500, tresorerieFin: 12500 },
                { mois: 'Jun', encaissements: 5000, decaissements: 4500, solde: 500, tresorerieFin: 13000 },
                { mois: 'Jul', encaissements: 4000, decaissements: 4500, solde: -500, tresorerieFin: 12500 },
                { mois: 'Aoû', encaissements: 3000, decaissements: 4500, solde: -1500, tresorerieFin: 11000 },
                { mois: 'Sep', encaissements: 5500, decaissements: 4500, solde: 1000, tresorerieFin: 12000 },
                { mois: 'Oct', encaissements: 5500, decaissements: 4500, solde: 1000, tresorerieFin: 13000 },
                { mois: 'Nov', encaissements: 6000, decaissements: 4500, solde: 1500, tresorerieFin: 14500 },
                { mois: 'Déc', encaissements: 6000, decaissements: 5500, solde: 500, tresorerieFin: 15000 },
            ],
        }

        // Générer le fichier Excel
        const buffer = await generateExcelExport(demoData)

        // Retourner le fichier
        const fileName = `previsionnel_${id}_${new Date().toISOString().split('T')[0]}.xlsx`

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Cache-Control': 'no-store',
            },
        })
    } catch (error) {
        console.error('Erreur lors de la génération Excel:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la génération du fichier Excel' },
            { status: 500 }
        )
    }
}
