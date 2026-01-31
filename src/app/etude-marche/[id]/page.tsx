'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { EtudeResultats } from '@/components/etude-marche/EtudeResultats'
import { ArrowLeft, Download, FileText } from 'lucide-react'

export default function EtudeResultatsPage() {
    const params = useParams()
    const id = params.id as string
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        // Récupération des données (MVP via localStorage)
        // Dans la version finale, on ferait un fetch /api/etude-marche/${id}
        const stored = localStorage.getItem(`etude_${id}`)
        if (stored) {
            setData(JSON.parse(stored))
        }
    }, [id])

    if (!data) {
        return <div className="p-8 text-center text-muted-foreground">Chargement de l&apos;étude...</div>
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/etude-marche">
                        <Button variant="ghost" size="sm" className="w-9 px-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Résultats de l&apos;analyse</h1>
                        <p className="text-muted-foreground">
                            {data.libelleNAF} à {data.commune} ({data.codePostal})
                        </p>
                    </div>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exporter en PDF
                </Button>
            </div>

            <EtudeResultats data={data} />

            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-4">
                <FileText className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                    <h3 className="font-semibold text-blue-900">Intégrer au prévisionnel</h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Ces données peuvent être automatiquement annexées à votre dossier prévisionnel pour renforcer votre demande de financement.
                    </p>
                    <Button variant="ghost" className="text-blue-700 p-0 h-auto mt-2 font-semibold hover:bg-transparent hover:underline">
                        Lier à un dossier existant &rarr;
                    </Button>
                </div>
            </div>
        </div>
    )
}
