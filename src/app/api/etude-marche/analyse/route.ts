import { NextResponse } from 'next/server'
import { sireneApi } from '@/lib/apis/sirene'
import { inseeLocalApi } from '@/lib/apis/insee-local'
import { pappersApi } from '@/lib/apis/pappers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { codeNAF, codePostal, rayonKm, lat, lng, libelleNAF, adresse, commune } = body

        if (!codeNAF || !codePostal) {
            return NextResponse.json(
                { error: 'Code NAF et Code Postal requis' },
                { status: 400 }
            )
        }

        // 1. Appel API Sirene (Concurrence) avec support géospatial si dispo
        const [nbConcurrents, concurrentsBase] = await Promise.all([
            sireneApi.countConcurrents(codeNAF, codePostal, lat, lng, rayonKm),
            sireneApi.searchConcurrents(codeNAF, codePostal, 20, lat, lng, rayonKm) // Top 20 pour voir large
        ])

        // 2. Enrichissement Pappers (Financier) sur le Top 5 uniquement pour économiser les quotas/temps
        const concurrentsEnrichis = await Promise.all(
            (concurrentsBase || []).slice(0, 5).map(async (c: any) => {
                const siren = c.siret ? c.siret.substring(0, 9) : null
                if (!siren) return c

                try {
                    const finance = await pappersApi.getFinancials(siren)
                    return {
                        ...c,
                        chiffreAffaires: finance?.ca,
                        resultat: finance?.resultat,
                        anneeFiscale: finance?.annee
                    }
                } catch (e) {
                    return c
                }
            })
        )

        // On fusionne le top 5 enrichi avec le reste (non enrichi)
        const concurrents = [
            ...concurrentsEnrichis,
            ...(concurrentsBase || []).slice(5)
        ]

        // 3. Appel API INSEE (Démographie)
        // Note: Pour l'instant mocké dans le lib si pas de clé
        const demoData = await inseeLocalApi.getDonneesCommune(codePostal)

        // 4. Calculs / Scoring
        // Ratio : nb habitants / nb concurrents (plus c'est haut, mieux c'est)
        // Si 0 concurrent, ratio est la population totale
        const ratio = nbConcurrents && nbConcurrents > 0
            ? (demoData.population / nbConcurrents)
            : demoData.population

        // Logique simpliste de potentiel pour le MVP
        let potentiel = 'MOYEN'
        if (ratio > 2000) potentiel = 'FORT'
        if (ratio < 300) potentiel = 'FAIBLE'

        // Métadonnées
        const resultData = {
            nbConcurrents: nbConcurrents || 0,
            concurrents: concurrents || [],
            populationZone: demoData.population,
            repartitionAges: demoData.repartitionAges,
            ratioHabConcurrent: ratio,
            potentielMarche: potentiel,
            dateAnalyse: new Date()
        }

        // 5. Sauvegarde en BDD
        const savedEtude = await prisma.etudeMarche.create({
            data: {
                previsionnelId: body.previsionnelId || undefined,
                codeNAF,
                libelleNAF: libelleNAF || 'Activité non spécifiée',
                adresse: adresse || codePostal,
                codePostal,
                commune: commune || demoData.nomCommune || '',
                latitude: lat,
                longitude: lng,
                rayonKm: rayonKm || 10,

                // Résultats
                nbConcurrents: resultData.nbConcurrents,
                concurrents: resultData.concurrents || [],
                // repartitionEffectifs (TODO si dispo)

                populationZone: resultData.populationZone,
                repartitionAges: resultData.repartitionAges ? resultData.repartitionAges : undefined,

                ratioHabConcurrent: resultData.ratioHabConcurrent,
                potentielMarche: resultData.potentielMarche,

                scoreAttraction: 50, // TODO calcul plus fin
            }
        })

        return NextResponse.json({
            ...resultData,
            id: savedEtude.id
        })

    } catch (error) {
        console.error('Erreur API Analyse:', error)
        return NextResponse.json(
            { error: 'Erreur lors de l\'analyse du marché' },
            { status: 500 }
        )
    }
}
