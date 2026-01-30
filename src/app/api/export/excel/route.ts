/**
 * API Route pour l'export Excel du prévisionnel
 * GET /api/export/excel?id=<previsionnelId>
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, userOwnsPrevisionnel } from '@/lib/auth'
import { genererExcelPrevisionnel, fetchPrevisionnelData } from '@/lib/export/excel-generator'

export async function GET(request: NextRequest) {
    try {
        // Récupérer l'ID du prévisionnel
        const { searchParams } = new URL(request.url)
        const previsionnelId = searchParams.get('id')

        if (!previsionnelId) {
            return NextResponse.json(
                { error: 'ID du prévisionnel requis' },
                { status: 400 }
            )
        }

        // Mode démo : générer un fichier exemple
        if (previsionnelId === 'demo') {
            // Pour la démo, on retourne un message
            return NextResponse.json(
                { error: 'Export non disponible en mode démonstration. Créez un prévisionnel pour exporter.' },
                { status: 400 }
            )
        }

        // Vérifier l'authentification
        const authUser = await getAuthenticatedUser()

        if (!authUser) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Vérifier que le prévisionnel appartient à l'utilisateur
        const hasAccess = await userOwnsPrevisionnel(
            authUser.prismaUser.id,
            authUser.prismaUser.cabinetId,
            previsionnelId
        )

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            )
        }

        // Récupérer les infos pour le nom du fichier
        const data = await fetchPrevisionnelData(previsionnelId)
        if (!data) {
            return NextResponse.json(
                { error: 'Prévisionnel non trouvé' },
                { status: 404 }
            )
        }

        // Générer le fichier Excel
        const buffer = await genererExcelPrevisionnel(previsionnelId)

        // Nom du fichier
        const dateStr = new Date().toISOString().split('T')[0]
        const nomEntreprise = data.client.raisonSociale
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 30)
        const filename = `Previsionnel_${nomEntreprise}_${dateStr}.xlsx`

        // Retourner le fichier
        const uint8Array = new Uint8Array(buffer)
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': buffer.length.toString(),
            },
        })

    } catch (error) {
        console.error('Erreur lors de l\'export Excel:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la génération du fichier Excel' },
            { status: 500 }
        )
    }
}
