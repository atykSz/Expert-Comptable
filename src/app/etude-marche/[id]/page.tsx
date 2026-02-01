import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EtudeResultats } from '@/components/etude-marche/EtudeResultats'
import { Button } from '@/components/ui'
import { ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EtudeResultatsPage({ params }: PageProps) {
    const { id } = await params

    // Fetch study
    const etude = await prisma.etudeMarche.findUnique({
        where: { id }
    })

    if (!etude) {
        notFound()
    }

    return (
        <div className="space-y-6 pb-20 p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/etude-marche">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Button>
                </Link>
                <div className="flex-1" />
                <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimer
                </Button>
            </div>

            <EtudeResultats etude={etude} />
        </div>
    )
}
