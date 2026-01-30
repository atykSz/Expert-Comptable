/**
 * API Route pour l'export PDF du rapport
 * Utilise l'impression navigateur (print CSS)
 * Cette route fournit les métadonnées pour le PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, userOwnsPrevisionnel } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const previsionnelId = searchParams.get('id')

        if (!previsionnelId) {
            return NextResponse.json(
                { error: 'ID du prévisionnel requis' },
                { status: 400 }
            )
        }

        // Mode démo : autoriser
        if (previsionnelId === 'demo') {
            return NextResponse.json({
                success: true,
                message: 'Utilisez window.print() pour imprimer le rapport',
                printUrl: `/previsionnel/demo/rapport`,
            })
        }

        // Vérifier l'authentification
        const authUser = await getAuthenticatedUser()

        if (!authUser) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Vérifier l'accès
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

        // Retourner l'URL pour l'impression
        return NextResponse.json({
            success: true,
            message: 'Utilisez window.print() pour imprimer le rapport',
            printUrl: `/previsionnel/${previsionnelId}/rapport`,
        })

    } catch (error) {
        console.error('Erreur PDF:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la préparation du PDF' },
            { status: 500 }
        )
    }
}
