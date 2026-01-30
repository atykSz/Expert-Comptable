'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, FileSpreadsheet, Shield } from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
    const errorParam = searchParams.get('error')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(errorParam === 'auth_callback_error' ? 'Erreur d\'authentification. Veuillez réessayer.' : '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const supabase = createClient()

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                if (error.message === 'Invalid login credentials') {
                    setError('Email ou mot de passe incorrect')
                } else if (error.message === 'Email not confirmed') {
                    setError('Veuillez confirmer votre email avant de vous connecter')
                } else {
                    setError(error.message)
                }
            } else {
                router.push(callbackUrl)
                router.refresh()
            }
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="relative">
                <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                    type="email"
                    label="Email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                />
            </div>

            <div className="relative">
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Mot de passe"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Se souvenir de moi</span>
                </label>
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                    Mot de passe oublié ?
                </Link>
            </div>

            <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
            >
                {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
        </form>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo et titre */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                        <FileSpreadsheet className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Expert-Comptable</h1>
                    <p className="text-gray-500 mt-1">Plateforme de prévisionnels comptables</p>
                </div>

                {/* Indicateur de sécurité */}
                <div className="flex items-center justify-center gap-2 mb-6 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Connexion sécurisée</span>
                </div>

                {/* Formulaire */}
                <Card variant="bordered" className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">Connexion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<div className="text-center py-4">Chargement...</div>}>
                            <LoginForm />
                        </Suspense>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="text-blue-600 hover:underline font-medium">
                                Créer un compte
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer sécurité */}
                <p className="mt-6 text-center text-xs text-gray-400">
                    Vos données sont chiffrées et protégées.
                    Nous ne partageons jamais vos informations.
                </p>
            </div>
        </div>
    )
}
