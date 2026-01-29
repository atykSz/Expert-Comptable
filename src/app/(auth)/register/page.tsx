'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, User, Building, FileSpreadsheet, Shield, Check } from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

export default function RegisterPage() {
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        cabinetName: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Validation du mot de passe
    const passwordValidation = {
        minLength: formData.password.length >= 8,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasLowercase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    }

    const isPasswordValid = Object.values(passwordValidation).every(Boolean)
    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validations
        if (!isPasswordValid) {
            setError('Le mot de passe ne respecte pas les critères de sécurité')
            return
        }

        if (!passwordsMatch) {
            setError('Les mots de passe ne correspondent pas')
            return
        }

        setIsLoading(true)

        const supabase = createClient()

        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        cabinet_name: formData.cabinetName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                if (error.message === 'User already registered') {
                    setError('Un compte existe déjà avec cet email')
                } else {
                    setError(error.message)
                }
                return
            }

            setSuccess(true)
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <Card variant="bordered" className="shadow-xl max-w-md text-center p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Vérifiez votre email !</h2>
                    <p className="text-gray-500 mb-4">
                        Un email de confirmation a été envoyé à <strong>{formData.email}</strong>.
                        Cliquez sur le lien pour activer votre compte.
                    </p>
                    <Link href="/login">
                        <Button variant="primary">Retour à la connexion</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo et titre */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                        <FileSpreadsheet className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
                    <p className="text-gray-500 mt-1">Rejoignez notre plateforme sécurisée</p>
                </div>

                {/* Indicateur de sécurité */}
                <div className="flex items-center justify-center gap-2 mb-6 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Données chiffrées et sécurisées</span>
                </div>

                {/* Formulaire */}
                <Card variant="bordered" className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">Inscription</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="relative">
                                <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    name="name"
                                    label="Nom complet"
                                    placeholder="Jean Dupont"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                                <Input
                                    type="email"
                                    name="email"
                                    label="Email professionnel"
                                    placeholder="jean@cabinet.fr"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Building className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    name="cabinetName"
                                    label="Nom du cabinet (optionnel)"
                                    placeholder="Cabinet Dupont & Associés"
                                    value={formData.cabinetName}
                                    onChange={handleChange}
                                    className="pl-10"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    label="Mot de passe"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
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

                            {/* Critères mot de passe */}
                            <div className="space-y-1 text-xs">
                                <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                                    <Check className="h-3 w-3" /> Au moins 8 caractères
                                </div>
                                <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                    <Check className="h-3 w-3" /> Une majuscule
                                </div>
                                <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                    <Check className="h-3 w-3" /> Un chiffre
                                </div>
                                <div className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                                    <Check className="h-3 w-3" /> Un caractère spécial (!@#$...)
                                </div>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    label="Confirmer le mot de passe"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="pl-10"
                                    required
                                />
                            </div>

                            {formData.confirmPassword && (
                                <div className={`text-xs flex items-center gap-2 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                                    <Check className="h-3 w-3" />
                                    {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={isLoading || !isPasswordValid || !passwordsMatch}
                            >
                                {isLoading ? 'Création...' : 'Créer mon compte'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="text-blue-600 hover:underline font-medium">
                                Se connecter
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer légal */}
                <p className="mt-6 text-center text-xs text-gray-400">
                    En créant un compte, vous acceptez nos{' '}
                    <Link href="/cgu" className="underline">Conditions d&apos;utilisation</Link>
                    {' '}et notre{' '}
                    <Link href="/politique-confidentialite" className="underline">Politique de confidentialité</Link>.
                </p>
            </div>
        </div>
    )
}
