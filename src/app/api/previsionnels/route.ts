import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser, getUserPrevisionnels } from '@/lib/auth'

// GET /api/previsionnels - Liste les prévisionnels de l'utilisateur connecté
export async function GET() {
    try {
        // Vérifier l'authentification
        const authUser = await getAuthenticatedUser()

        if (!authUser) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Récupérer uniquement les prévisionnels du cabinet de l'utilisateur
        const previsionnels = await getUserPrevisionnels(authUser.prismaUser.cabinetId)

        return NextResponse.json(previsionnels)
    } catch (error) {
        console.error('Erreur lors de la récupération des prévisionnels:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des prévisionnels' },
            { status: 500 }
        )
    }
}

// POST /api/previsionnels - Créer un nouveau prévisionnel
export async function POST(request: Request) {
    try {
        // Vérifier l'authentification
        const authUser = await getAuthenticatedUser()

        if (!authUser) {
            console.log('API POST /previsionnels: User not authenticated')
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const body = await request.json()
        console.log('API POST /previsionnels Body:', JSON.stringify(body))

        const {
            clientId,
            titre,
            description,
            dateDebut,
            nombreMois = 36,
            regimeFiscal = 'IS',
            formatDocument = 'PCG_STANDARD',
            hypotheses,
        } = body

        // Utiliser le client par défaut si non fourni
        let effectiveClientId = clientId || authUser.defaultClientId
        console.log(`API POST /previsionnels: defaultClientId=${authUser.defaultClientId}, providedClientId=${clientId}, effective=${effectiveClientId}, cabinetId=${authUser.prismaUser.cabinetId}`)

        // Si aucun client n'existe, on en crée un par défaut (Fallback robustesse)

        // Si aucun client n'existe, on en crée un par défaut (Fallback robustesse)
        if (!effectiveClientId && authUser.prismaUser.cabinetId) {
            const userName = authUser.prismaUser.name || authUser.prismaUser.email.split('@')[0]
            const newClient = await prisma.client.create({
                data: {
                    cabinetId: authUser.prismaUser.cabinetId,
                    raisonSociale: `Entreprise de ${userName}`,
                    formeJuridique: 'SARL',
                }
            })
            effectiveClientId = newClient.id
        }

        // Validation
        if (!effectiveClientId || !titre || !dateDebut) {
            return NextResponse.json(
                {
                    error: 'Données manquantes (Titre ou Date)',
                    details: {
                        effectiveClientId: effectiveClientId ? 'Present' : 'Missing',
                        titre: titre || 'Missing',
                        dateDebut: dateDebut || 'Missing'
                    }
                },
                { status: 400 }
            )
        }

        // Vérifier que le client appartient au cabinet de l'utilisateur
        const client = await prisma.client.findFirst({
            where: {
                id: effectiveClientId,
                cabinetId: authUser.prismaUser.cabinetId!,
            },
        })

        if (!client) {
            return NextResponse.json(
                { error: 'Client non trouvé ou accès non autorisé' },
                { status: 403 }
            )
        }

        // Créer le prévisionnel avec les hypothèses par défaut
        const previsionnel = await prisma.previsionnel.create({
            data: {
                clientId: effectiveClientId,
                titre,
                description,
                dateDebut: new Date(dateDebut),
                nombreMois,
                regimeFiscal,
                formatDocument,
                hypotheses: hypotheses ? {
                    create: {
                        tauxTVAVentes: hypotheses.tauxTVAVentes ?? 20.0,
                        tauxTVAAchats: hypotheses.tauxTVAAchats ?? 20.0,
                        delaiPaiementClients: hypotheses.delaiPaiementClients ?? 30,
                        delaiPaiementFournisseurs: hypotheses.delaiPaiementFournisseurs ?? 30,
                        tauxChargesSocialesPatronales: hypotheses.tauxChargesSocialesPatronales ?? 45.0,
                        tauxChargesSocialesSalariales: hypotheses.tauxChargesSocialesSalariales ?? 22.0,
                        tauxIS: hypotheses.tauxIS ?? 25.0,
                        dureeStockJours: hypotheses.dureeStockJours ?? 30,
                    },
                } : {
                    create: {},
                },
            },
            include: {
                client: true,
                hypotheses: true,
            },
        })

        return NextResponse.json(previsionnel, { status: 201 })
    } catch (error) {
        console.error('Erreur lors de la création du prévisionnel:', error)

        // Robust error serialization
        let errorMessage = 'Erreur inconnue'
        let errorStack = undefined
        let fullDebug = ''

        if (error instanceof Error) {
            errorMessage = error.message
            errorStack = error.stack
            fullDebug = JSON.stringify(error, Object.getOwnPropertyNames(error))
        } else if (typeof error === 'string') {
            errorMessage = error
        } else {
            errorMessage = String(error)
            try {
                fullDebug = JSON.stringify(error)
            } catch (e) {
                fullDebug = 'Circular or non-serializable error'
            }
        }

        // Si message vide, on force quelque chose
        if (!errorMessage) {
            errorMessage = `Erreur vide (Type: ${typeof error})`
        }

        return NextResponse.json(
            {
                error: 'Erreur technique lors de la création',
                details: `[${errorMessage}] DBG:${fullDebug.substring(0, 200)}`, // On met tout dans details pour être sûr
                stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
            },
            { status: 500 }
        )
    }
}
