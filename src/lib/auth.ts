import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import type { User } from '@supabase/supabase-js'

export interface AuthenticatedUser {
    supabaseUser: User
    prismaUser: {
        id: string
        email: string
        name: string | null
        role: string
        cabinetId: string | null
    }
    defaultClientId: string | null
}

/**
 * Get the authenticated user from Supabase and sync with Prisma
 * Creates the Prisma user and default client if they don't exist
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    // Try to find existing Prisma user
    let prismaUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            cabinetId: true,
        },
    })

    // If no Prisma user exists, create one with a default cabinet and client
    if (!prismaUser) {
        const created = await createUserWithDefaultClient(user)
        prismaUser = created.user
    }

    // Initialize defaultClient variable
    let defaultClient: { id: string } | null = null

    // If user has no cabinet (e.g. Admin seeded manually), create one
    if (!prismaUser.cabinetId) {
        const result = await prisma.$transaction(async (tx) => {
            const userName = prismaUser.name || prismaUser.email.split('@')[0]

            const cabinet = await tx.cabinet.create({
                data: {
                    name: `Cabinet de ${userName}`,
                    email: prismaUser.email,
                },
            })

            await tx.user.update({
                where: { id: prismaUser.id },
                data: { cabinetId: cabinet.id },
            })

            const client = await tx.client.create({
                data: {
                    cabinetId: cabinet.id,
                    raisonSociale: `Entreprise de ${userName}`,
                    formeJuridique: 'SARL',
                },
            })

            return { cabinet, client }
        })

        // Update local variables after creation
        prismaUser.cabinetId = result.cabinet.id
        defaultClient = result.client
    } else {
        // If user has cabinet but no default client
        let existingDefaultClient = await getDefaultClient(prismaUser.id, prismaUser.cabinetId)

        if (!existingDefaultClient) {
            existingDefaultClient = await prisma.client.create({
                data: {
                    cabinetId: prismaUser.cabinetId,
                    raisonSociale: `Entreprise de ${prismaUser.name || prismaUser.email.split('@')[0]}`,
                    formeJuridique: 'SARL',
                },
            })
        }
        defaultClient = existingDefaultClient
    }

    return {
        supabaseUser: user,
        prismaUser,
        defaultClientId: defaultClient?.id || null,
    }
}

/**
 * Create a new Prisma user with a personal cabinet and client
 */
async function createUserWithDefaultClient(supabaseUser: User) {
    const userEmail = supabaseUser.email!
    const userName = supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.full_name ||
        userEmail.split('@')[0]

    // Create cabinet, user, and client in a transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create personal cabinet
        const cabinet = await tx.cabinet.create({
            data: {
                name: `Cabinet de ${userName}`,
                email: userEmail,
            },
        })

        // Create user linked to cabinet
        const user = await tx.user.create({
            data: {
                email: userEmail,
                name: userName,
                role: 'CLIENT',
                cabinetId: cabinet.id,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                cabinetId: true,
            },
        })

        // Create default client (the user's own company)
        const client = await tx.client.create({
            data: {
                cabinetId: cabinet.id,
                raisonSociale: `Entreprise de ${userName}`,
                formeJuridique: 'SARL',
            },
        })

        return { user, cabinet, client }
    })

    return result
}

/**
 * Get the default client for a user
 */
async function getDefaultClient(userId: string, cabinetId: string | null) {
    if (!cabinetId) return null

    // Get the first client from the user's cabinet
    const client = await prisma.client.findFirst({
        where: { cabinetId },
        orderBy: { createdAt: 'asc' },
    })

    return client
}

/**
 * Check if a previsionnel belongs to the authenticated user
 */
export async function userOwnsPrevisionnel(
    userId: string,
    cabinetId: string | null,
    previsionnelId: string
): Promise<boolean> {
    if (!cabinetId) return false

    const previsionnel = await prisma.previsionnel.findFirst({
        where: {
            id: previsionnelId,
            client: {
                cabinetId: cabinetId,
            },
        },
    })

    return !!previsionnel
}

/**
 * Get all prévisionnels for the authenticated user
 */
export async function getUserPrevisionnels(cabinetId: string | null) {
    if (!cabinetId) return []

    const previsionnels = await prisma.previsionnel.findMany({
        where: {
            client: {
                cabinetId: cabinetId,
            },
        },
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
        orderBy: { updatedAt: 'desc' },
    })

    return previsionnels
}
