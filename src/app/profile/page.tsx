import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
    const authUser = await getAuthenticatedUser()

    if (!authUser || !authUser.prismaUser.cabinetId) {
        redirect('/login')
    }

    const cabinet = await prisma.cabinet.findUnique({
        where: { id: authUser.prismaUser.cabinetId }
    })

    if (!cabinet) {
        return <div>Erreur : Cabinet introuvable</div>
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mon Profil</h1>
                <p className="text-muted-foreground mt-1">
                    Gérez vos informations personnelles et celles de votre cabinet
                </p>
            </div>

            <ProfileForm
                user={authUser.prismaUser}
                cabinet={cabinet}
            />
        </div>
    )
}
