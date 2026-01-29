import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/previsionnels - Liste tous les prévisionnels
export async function GET() {
    try {
        const previsionnels = await prisma.previsionnel.findMany({
            include: {
                client: {
                    select: {
                        id: true,
                        raisonSociale: true,
                        formeJuridique: true,
                    },
                },
                hypotheses: true,
                _count: {
                    select: {
                        lignesCA: true,
                        lignesCharge: true,
                        investissements: true,
                        financements: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

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
        const body = await request.json()

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

        // Validation
        if (!clientId || !titre || !dateDebut) {
            return NextResponse.json(
                { error: 'clientId, titre et dateDebut sont requis' },
                { status: 400 }
            )
        }

        // Créer le prévisionnel avec les hypothèses par défaut
        const previsionnel = await prisma.previsionnel.create({
            data: {
                clientId,
                titre,
                description,
                dateDebut: new Date(dateDebut),
                nombreMois,
                regimeFiscal,
                formatDocument,
                hypotheses: hypotheses ? {
                    create: {
                        tauxTVAVentes: hypotheses.tauxTVAVentes || 20.0,
                        tauxTVAAchats: hypotheses.tauxTVAAchats || 20.0,
                        delaiPaiementClients: hypotheses.delaiPaiementClients || 30,
                        delaiPaiementFournisseurs: hypotheses.delaiPaiementFournisseurs || 30,
                        tauxChargesSocialesPatronales: hypotheses.tauxChargesSocialesPatronales || 45.0,
                        tauxChargesSocialesSalariales: hypotheses.tauxChargesSocialesSalariales || 22.0,
                        tauxIS: hypotheses.tauxIS || 25.0,
                        dureeStockJours: hypotheses.dureeStockJours || 30,
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
        return NextResponse.json(
            { error: 'Erreur lors de la création du prévisionnel' },
            { status: 500 }
        )
    }
}
