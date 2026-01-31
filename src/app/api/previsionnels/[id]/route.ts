import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser, userOwnsPrevisionnel } from '@/lib/auth'
import {
    StatutPrevisionnel,
    CategorieCA,
    CategorieCharge,
    TypeCharge,
    Recurrence,
    CategorieInvestissement,
    ModeAmortissement,
    TypeFinancement,
    TypeContrat
} from '@/generated/prisma/client'

// GET /api/previsionnels/[id] - Récupérer un prévisionnel complet
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

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
            id
        )

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            )
        }

        const previsionnel = await prisma.previsionnel.findUnique({
            where: { id },
            include: {
                client: true,
                hypotheses: true,
                lignesCA: {
                    orderBy: { createdAt: 'asc' },
                },
                lignesCharge: {
                    orderBy: { createdAt: 'asc' },
                },
                investissements: {
                    orderBy: { dateAcquisition: 'asc' },
                },
                financements: {
                    orderBy: { dateDebut: 'asc' },
                },
                effectifs: {
                    orderBy: { dateEmbauche: 'asc' },
                },
                lignes2035: {
                    orderBy: { numeroLigne: 'asc' },
                },
            },
        })

        if (!previsionnel) {
            return NextResponse.json(
                { error: 'Prévisionnel non trouvé' },
                { status: 404 }
            )
        }

        return NextResponse.json(previsionnel)
    } catch (error) {
        console.error('Erreur lors de la récupération du prévisionnel:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du prévisionnel' },
            { status: 500 }
        )
    }
}

// PUT /api/previsionnels/[id] - Mettre à jour un prévisionnel
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

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
            id
        )

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            )
        }

        const body = await request.json()

        // Validation Zod
        const { PrevisionnelUpdateSchema, validateWithErrors } = await import('@/lib/validations/previsionnel')
        const validation = validateWithErrors(PrevisionnelUpdateSchema, body)

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Données invalides',
                    details: validation.errors
                },
                { status: 400 }
            )
        }

        const {
            titre,
            description,
            statut,
            hypotheses,
            lignesCA,
            lignesCharge,
            investissements,
            financements,
            effectifs,
        } = validation.data

        // Mettre à jour le prévisionnel
        const previsionnel = await prisma.previsionnel.update({
            where: { id },
            data: {
                titre,
                description,
                statut: statut as StatutPrevisionnel | undefined,
                ...(hypotheses && {
                    hypotheses: {
                        update: hypotheses,
                    },
                }),
            },
            include: {
                hypotheses: true,
            },
        })

        // Mettre à jour les lignes de CA si fournies
        if (lignesCA) {
            // Supprimer les anciennes et recréer
            await prisma.ligneCA.deleteMany({ where: { previsionnelId: id } })
            if (lignesCA.length > 0) {
                await prisma.ligneCA.createMany({
                    data: lignesCA.map((ligne: {
                        libelle: string
                        categorie: string
                        comptePCG: string
                        montantsMensuels: number[]
                        evolutionAn2?: number
                        evolutionAn3?: number
                        tauxTVA?: number
                    }) => ({
                        previsionnelId: id,
                        libelle: ligne.libelle,
                        categorie: ligne.categorie as CategorieCA,
                        comptePCG: ligne.comptePCG || '701000',
                        montantsMensuels: ligne.montantsMensuels,
                        evolutionAn2: ligne.evolutionAn2 || 0,
                        evolutionAn3: ligne.evolutionAn3 || 0,
                        tauxTVA: ligne.tauxTVA || 20.0,
                    })),
                })
            }
        }

        // Mettre à jour les lignes de charge si fournies
        if (lignesCharge) {
            await prisma.ligneCharge.deleteMany({ where: { previsionnelId: id } })
            if (lignesCharge.length > 0) {
                await prisma.ligneCharge.createMany({
                    data: lignesCharge.map((ligne: {
                        libelle: string
                        categorie: string
                        comptePCG: string
                        typeCharge?: string
                        montantsMensuels: number[]
                        evolutionAn2?: number
                        evolutionAn3?: number
                        tauxTVA?: number | null
                        deductibleTVA?: boolean
                        recurrence?: string
                    }) => ({
                        previsionnelId: id,
                        libelle: ligne.libelle,
                        categorie: ligne.categorie as CategorieCharge,
                        comptePCG: ligne.comptePCG,
                        typeCharge: (ligne.typeCharge || 'FIXE') as TypeCharge,
                        montantsMensuels: ligne.montantsMensuels,
                        evolutionAn2: ligne.evolutionAn2 || 0,
                        evolutionAn3: ligne.evolutionAn3 || 0,
                        tauxTVA: ligne.tauxTVA,
                        deductibleTVA: ligne.deductibleTVA ?? true,
                        recurrence: (ligne.recurrence || 'MENSUEL') as Recurrence,
                    })),
                })
            }
        }

        // Mettre à jour les investissements si fournis
        if (investissements) {
            await prisma.investissement.deleteMany({ where: { previsionnelId: id } })
            if (investissements.length > 0) {
                await prisma.investissement.createMany({
                    data: investissements.map((inv: {
                        libelle: string
                        categorie: string
                        comptePCG: string
                        montantHT: number
                        tauxTVA?: number
                        dateAcquisition: string
                        dureeAmortissement: number
                        modeAmortissement?: string
                        valeurResiduelle?: number
                    }) => ({
                        previsionnelId: id,
                        libelle: inv.libelle,
                        categorie: inv.categorie as CategorieInvestissement,
                        comptePCG: inv.comptePCG,
                        montantHT: inv.montantHT,
                        tauxTVA: inv.tauxTVA || 20.0,
                        dateAcquisition: new Date(inv.dateAcquisition),
                        dureeAmortissement: inv.dureeAmortissement,
                        modeAmortissement: (inv.modeAmortissement || 'LINEAIRE') as ModeAmortissement,
                        valeurResiduelle: inv.valeurResiduelle || 0,
                    })),
                })
            }
        }

        // Mettre à jour les financements si fournis
        if (financements) {
            await prisma.financement.deleteMany({ where: { previsionnelId: id } })
            if (financements.length > 0) {
                await prisma.financement.createMany({
                    data: financements.map((fin: {
                        libelle: string
                        type: string
                        montant: number
                        dateDebut: string
                        duree?: number
                        tauxInteret?: number
                        differe?: number
                        echeancier?: unknown
                    }) => ({
                        previsionnelId: id,
                        libelle: fin.libelle,
                        type: fin.type as TypeFinancement,
                        montant: fin.montant,
                        dateDebut: new Date(fin.dateDebut),
                        duree: fin.duree,
                        tauxInteret: fin.tauxInteret,
                        differe: fin.differe,
                        echeancier: fin.echeancier as object | undefined,
                    })),
                })
            }
        }

        // Mettre à jour les effectifs si fournis
        if (effectifs) {
            await prisma.effectif.deleteMany({ where: { previsionnelId: id } })
            if (effectifs.length > 0) {
                await prisma.effectif.createMany({
                    data: effectifs.map((eff) => ({
                        previsionnelId: id,
                        poste: eff.poste,
                        typeContrat: eff.typeContrat as TypeContrat,
                        salaireBrutMensuel: eff.salaireBrutMensuel,
                        primes: eff.primes || 0,
                        dateEmbauche: new Date(eff.dateEmbauche),
                        dateFin: eff.dateFin ? new Date(eff.dateFin) : null,
                        tauxChargesPatronales: eff.tauxChargesPatronales || 45.0,
                    })),
                })
            }
        }

        return NextResponse.json(previsionnel)
    } catch (error) {
        console.error('Erreur lors de la mise à jour du prévisionnel:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour du prévisionnel' },
            { status: 500 }
        )
    }
}

// DELETE /api/previsionnels/[id] - Supprimer un prévisionnel
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

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
            id
        )

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            )
        }

        // Vérifier que le prévisionnel existe
        const previsionnel = await prisma.previsionnel.findUnique({
            where: { id },
        })

        if (!previsionnel) {
            return NextResponse.json(
                { error: 'Prévisionnel non trouvé' },
                { status: 404 }
            )
        }

        // Supprimer le prévisionnel (cascade vers les relations)
        await prisma.previsionnel.delete({
            where: { id },
        })

        return NextResponse.json({ success: true, message: 'Prévisionnel supprimé' })
    } catch (error) {
        console.error('Erreur lors de la suppression du prévisionnel:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la suppression du prévisionnel' },
            { status: 500 }
        )
    }
}
