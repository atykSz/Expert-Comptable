import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Mot de passe', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email et mot de passe requis')
                }

                const email = credentials.email as string
                const password = credentials.password as string

                // Rechercher l'utilisateur
                const user = await prisma.user.findUnique({
                    where: { email },
                    include: {
                        cabinet: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                })

                if (!user || !user.password) {
                    throw new Error('Identifiants incorrects')
                }

                // Vérifier le mot de passe
                const isValidPassword = await compare(password, user.password)

                if (!isValidPassword) {
                    throw new Error('Identifiants incorrects')
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    cabinetId: user.cabinetId,
                    cabinetName: user.cabinet?.name,
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.cabinetId = user.cabinetId
                token.cabinetName = user.cabinetName
            }
            return token
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.cabinetId = token.cabinetId as string | undefined
                session.user.cabinetName = token.cabinetName as string | undefined
            }
            return session
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 heures
    },

    // Sécurité
    trustHost: true,
})

// Types étendus pour TypeScript
declare module 'next-auth' {
    interface User {
        role?: string
        cabinetId?: string | null
        cabinetName?: string
    }

    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            role?: string
            cabinetId?: string
            cabinetName?: string
        }
    }
}
