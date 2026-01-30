'use server'

import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateCabinet(cabinetName: string) {
    const user = await getAuthenticatedUser()
    const cabinetId = user?.prismaUser.cabinetId

    if (!user || !cabinetId) throw new Error('Not authenticated or no cabinet')

    await prisma.cabinet.update({
        where: { id: cabinetId },
        data: { name: cabinetName }
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true }
}
