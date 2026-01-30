'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateCabinet } from '@/app/profile/actions'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui'
import { User, Building2, Lock, Save } from 'lucide-react'

interface ProfileFormProps {
    user: {
        email: string
        name?: string | null
    }
    cabinet: {
        name: string
    }
}

export function ProfileForm({ user, cabinet }: ProfileFormProps) {
    const [cabinetName, setCabinetName] = useState(cabinet.name)
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Update Cabinet
            if (cabinetName !== cabinet.name) {
                await updateCabinet(cabinetName)
            }

            // Update Password
            if (password) {
                const supabase = createClient()
                const { error } = await supabase.auth.updateUser({ password })
                if (error) throw error
            }

            alert('Profil mis à jour avec succès !')
            setPassword('') // Clear password field
        } catch (error) {
            console.error(error)
            alert('Erreur lors de la mise à jour : ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informations Personnelles
                    </CardTitle>
                    <CardDescription>
                        Vos informations de connexion (Email: {user.email})
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nouveau mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                type="password"
                                placeholder="Laisser vide pour ne pas changer"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                                minLength={6}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Cabinet
                    </CardTitle>
                    <CardDescription>
                        Les informations de votre cabinet expert-comptable
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nom du cabinet</label>
                        <Input
                            placeholder="Nom du cabinet"
                            value={cabinetName}
                            onChange={(e) => setCabinetName(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="bg-[#1e3a5f]">
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
            </div>
        </form>
    )
}
