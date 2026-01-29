import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

// POST /api/auth/register - Créer un nouveau compte utilisateur
export async function POST(request: Request) {
    try {
        const body = await request.json()

        const { name, email, password, cabinetName } = body

        // Validation des champs requis
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Nom, email et mot de passe sont requis' },
                { status: 400 }
            )
        }

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format email invalide' },
                { status: 400 }
            )
        }

        // Validation du mot de passe (sécurité)
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            )
        }

        if (!/[A-Z]/.test(password)) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins une majuscule' },
                { status: 400 }
            )
        }

        if (!/[0-9]/.test(password)) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins un chiffre' },
                { status: 400 }
            )
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins un caractère spécial' },
                { status: 400 }
            )
        }

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Un compte avec cet email existe déjà' },
                { status: 409 }
            )
        }

        // Hasher le mot de passe avec bcrypt (12 rounds = sécurité renforcée)
        const hashedPassword = await hash(password, 12)

        // Créer le cabinet si un nom est fourni
        let cabinetId: string | undefined

        if (cabinetName && cabinetName.trim()) {
            const cabinet = await prisma.cabinet.create({
                data: {
                    name: cabinetName.trim(),
                },
            })
            cabinetId = cabinet.id
        }

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name: name.trim(),
                password: hashedPassword,
                role: cabinetId ? 'EXPERT_COMPTABLE' : 'CLIENT',
                cabinetId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                // Ne jamais retourner le mot de passe hashé
            },
        })

        return NextResponse.json(
            {
                message: 'Compte créé avec succès',
                user,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Erreur lors de la création du compte:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la création du compte' },
            { status: 500 }
        )
    }
}
