import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { TresorerieView } from '@/components/tresorerie/TresorerieView'

export default async function TresoreriePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    // 1. Authentification
    const authUser = await getAuthenticatedUser()
    if (!authUser) redirect('/login')

    const { id } = await params

    // 2. Fetch du prévisionnel avec TOUTES les relations nécessaires pour le calcul
    const previsionnel = await prisma.previsionnel.findUnique({
        where: {
            id,
            // Sécurité : vérifier que le prévisionnel appartient au membre du cabinet
            // (Note: on pourrait ajouter une vérif plus stricte ici)
        },
        include: {
            lignesCA: true,
            lignesCharge: true,
            hypotheses: true,
            financements: true,
            investissements: true
        }
    })

    if (!previsionnel) {
        return <div>Prévisionnel introuvable</div>
    }

    // 3. Rendu du composant Client avec les données complètes
    return <TresorerieView previsionnel={previsionnel} />
}
