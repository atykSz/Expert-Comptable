import { NextResponse } from 'next/server'
import { sireneApi } from '@/lib/apis/sirene'
import { inseeLocalApi } from '@/lib/apis/insee-local'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { codeNAF, codePostal, rayonKm } = body

        if (!codeNAF || !codePostal) {
            return NextResponse.json(
                { error: 'Code NAF et Code Postal requis' },
                { status: 400 }
            )
        }

        // 1. Appel API Sirene (Concurrence)
        const [nbConcurrents, concurrents] = await Promise.all([
            sireneApi.countConcurrents(codeNAF, codePostal),
            sireneApi.searchConcurrents(codeNAF, codePostal, 5) // Top 5
        ])

        // 2. Appel API INSEE (Démographie)
        // Note: Pour l'instant mocké dans le lib si pas de clé
        const demoData = await inseeLocalApi.getDonneesCommune(codePostal)

        // 3. Calculs / Scoring
        // Ratio : nb habitants / nb concurrents (plus c'est haut, mieux c'est)
        // Si 0 concurrent, ratio est la population totale
        const ratio = nbConcurrents && nbConcurrents > 0
            ? (demoData.population / nbConcurrents)
            : demoData.population

        // Logique simpliste de potentiel pour le MVP
        let potentiel = 'MOYEN'
        if (ratio > 2000) potentiel = 'FORT' // Beaucoup de clients potentiels par établissement
        if (ratio < 300) potentiel = 'FAIBLE' // Marché saturé

        const results = {
            nbConcurrents: nbConcurrents || 0,
            concurrents: concurrents || [],
            populationZone: demoData.population,
            repartitionAges: demoData.repartitionAges,
            ratioHabConcurrent: ratio,
            potentielMarche: potentiel,
            // Metadata
            dateAnalyse: new Date()
        }

        // Optionnel : Sauvegarde en base de données ici via Prisma
        // const saved = await prisma.etudeMarche.create({ ... })

        return NextResponse.json(results)

    } catch (error) {
        console.error('Erreur API Analyse:', error)
        return NextResponse.json(
            { error: 'Erreur lors de l\'analyse du marché' },
            { status: 500 }
        )
    }
}
