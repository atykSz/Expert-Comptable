import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, userOwnsPrevisionnel } from '@/lib/auth'
import { TypeScenario } from '@/generated/prisma'
import { calculerScenario, SCENARIOS_PREDEFINIS } from '@/lib/calculations/scenarios'

// GET /api/previsionnels/[id]/scenarios - Liste des scénarios
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthenticatedUser()
        if (!authUser) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const { id } = await params

        // Vérifier que le prévisionnel appartient à l'utilisateur
        const hasAccess = await userOwnsPrevisionnel(
            authUser.prismaUser.id,
            authUser.prismaUser.cabinetId,
            id
        )

        if (!hasAccess) {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
        }

        // Récupérer le prévisionnel avec ses données
        const previsionnel = await prisma.previsionnel.findUnique({
            where: { id },
            include: {
                scenarios: {
                    orderBy: { createdAt: 'asc' }
                },
                lignesCA: true,
                lignesCharge: true,
                hypotheses: true,
                financements: true,
                investissements: true
            }
        })

        if (!previsionnel) {
            return NextResponse.json({ error: 'Prévisionnel non trouvé' }, { status: 404 })
        }

        // Calculer les résultats pour chaque scénario
        const scenariosAvecResultats = previsionnel.scenarios.map(scenario => {
            const resultats = calculerScenario(previsionnel, {
                modifCA: scenario.modifCA,
                modifCharges: scenario.modifCharges,
                modifDelaiPaiement: scenario.modifDelaiPaiement
            })

            return {
                ...scenario,
                resultats
            }
        })

        return NextResponse.json({
            scenarios: scenariosAvecResultats,
            previsionnelId: id
        })

    } catch (error) {
        console.error('Erreur GET scenarios:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// POST /api/previsionnels/[id]/scenarios - Créer un scénario
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthenticatedUser()
        if (!authUser) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        // Vérifier que le prévisionnel appartient à l'utilisateur
        const hasAccess = await userOwnsPrevisionnel(
            authUser.prismaUser.id,
            authUser.prismaUser.cabinetId,
            id
        )

        if (!hasAccess) {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
        }

        // Récupérer le prévisionnel avec ses données
        const previsionnel = await prisma.previsionnel.findUnique({
            where: { id },
            include: {
                lignesCA: true,
                lignesCharge: true,
                hypotheses: true,
                financements: true,
                investissements: true
            }
        })

        if (!previsionnel) {
            return NextResponse.json({ error: 'Prévisionnel non trouvé' }, { status: 404 })
        }

        // Déterminer les modificateurs selon le type
        let modifCA = body.modifCA ?? 0
        let modifCharges = body.modifCharges ?? 0
        let modifDelaiPaiement = body.modifDelaiPaiement ?? 0

        if (body.type && body.type !== 'PERSONNALISE') {
            const predefini = SCENARIOS_PREDEFINIS[body.type as keyof typeof SCENARIOS_PREDEFINIS]
            if (predefini) {
                modifCA = predefini.modifCA
                modifCharges = predefini.modifCharges
                modifDelaiPaiement = predefini.modifDelaiPaiement
            }
        }

        // Calculer les résultats pour le cache
        const resultats = calculerScenario(previsionnel, {
            modifCA,
            modifCharges,
            modifDelaiPaiement
        })

        // Créer le scénario
        const scenario = await prisma.scenario.create({
            data: {
                previsionnelId: id,
                nom: body.nom || `Scénario ${body.type || 'Personnalisé'}`,
                type: (body.type as TypeScenario) || TypeScenario.PERSONNALISE,
                couleur: body.couleur || getCouleurParType(body.type),
                modifCA,
                modifCharges,
                modifDelaiPaiement,
                resultatNetAn1: resultats.resultatNet[0],
                resultatNetAn3: resultats.resultatNet[2] || resultats.resultatNet[resultats.resultatNet.length - 1],
                tresorerieFinAn3: resultats.tresorerieFin[2] || resultats.tresorerieFin[resultats.tresorerieFin.length - 1],
                isDefault: body.isDefault || false
            }
        })

        return NextResponse.json({
            scenario,
            resultats
        }, { status: 201 })

    } catch (error) {
        console.error('Erreur POST scenario:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// DELETE - Supprimer un scénario
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthenticatedUser()
        if (!authUser) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const { id } = await params

        // Vérifier que le prévisionnel appartient à l'utilisateur
        const hasAccess = await userOwnsPrevisionnel(
            authUser.prismaUser.id,
            authUser.prismaUser.cabinetId,
            id
        )

        if (!hasAccess) {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const scenarioId = searchParams.get('scenarioId')

        if (!scenarioId) {
            return NextResponse.json({ error: 'scenarioId requis' }, { status: 400 })
        }

        // Vérifier que le scénario appartient bien au prévisionnel
        const scenario = await prisma.scenario.findFirst({
            where: { id: scenarioId, previsionnelId: id }
        })

        if (!scenario) {
            return NextResponse.json({ error: 'Scénario non trouvé' }, { status: 404 })
        }

        await prisma.scenario.delete({
            where: { id: scenarioId }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Erreur DELETE scenario:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// Helper pour les couleurs par type
function getCouleurParType(type?: string): string {
    switch (type) {
        case 'OPTIMISTE': return '#10B981' // vert
        case 'REALISTE': return '#3B82F6'  // bleu
        case 'PESSIMISTE': return '#EF4444' // rouge
        default: return '#8B5CF6' // violet
    }
}
