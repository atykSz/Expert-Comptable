import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes protégées nécessitant une authentification
const protectedRoutes = [
    '/previsionnel',
    '/dashboard',
    '/clients',
]

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/auth/callback',
    '/politique-confidentialite',
    '/cgu',
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Update session and get user
    const { user, supabaseResponse } = await updateSession(request)

    // Add security headers
    supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Check if it's a public route or home
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    if (isPublicRoute || pathname === '/') {
        return supabaseResponse
    }

    // Check if it's a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !user) {
        // Redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
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
