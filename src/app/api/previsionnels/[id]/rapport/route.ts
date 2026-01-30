import { NextResponse } from 'next/server'
import { getAuthenticatedUser, userOwnsPrevisionnel } from '@/lib/auth'
import { aggregateRapportData } from '@/lib/rapport/data-aggregation'

/**
 * GET /api/previsionnels/[id]/rapport
 * Retourne les données calculées pour le rapport prévisionnel
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Authentification
        const authUser = await getAuthenticatedUser()
        if (!authUser) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const { id } = await params

        // 2. Vérifier que l'utilisateur a accès à ce prévisionnel
        const hasAccess = await userOwnsPrevisionnel(authUser.prismaUser.id, authUser.prismaUser.cabinetId, id)
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            )
        }

        // 3. Agréger les données du rapport
        const rapportData = await aggregateRapportData(id)

        if (!rapportData) {
            return NextResponse.json(
                { error: 'Prévisionnel non trouvé' },
                { status: 404 }
            )
        }

        return NextResponse.json(rapportData)

    } catch (error) {
        console.error('Erreur lors de la génération des données du rapport:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la génération du rapport' },
            { status: 500 }
        )
    }
}
