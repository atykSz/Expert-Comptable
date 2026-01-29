import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes protégées nécessitant une authentification
const protectedRoutes = [
    '/previsionnel',
    '/dashboard',
    '/clients',
]

// Routes d'API protégées
const protectedApiRoutes = [
    '/api/previsionnels',
    '/api/clients',
]

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/api/auth',
    '/api/exports',          // Exports accessibles sans auth
    '/previsionnel/demo',    // Mode démo sans authentification
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Créer la réponse avec les headers de sécurité
    const response = NextResponse.next()

    // Headers de sécurité pour toutes les réponses
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )

    // Vérifier si c'est une route publique
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    if (isPublicRoute || pathname === '/') {
        return response
    }

    // Vérifier si c'est une route protégée (pages ou API)
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute || isProtectedApi) {
        // Vérifier le token JWT (compatible Edge Runtime)
        const token = await getToken({
            req: request,
            secret: process.env.AUTH_SECRET,
        })

        if (!token) {
            if (isProtectedApi) {
                // Pour les APIs, retourner 401
                return NextResponse.json(
                    { error: 'Non authentifié' },
                    { status: 401 }
                )
            }

            // Pour les pages, rediriger vers login
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Vérifier les permissions selon le rôle
        if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
