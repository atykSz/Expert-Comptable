import { geoApi } from './geo'

const INSEE_APP_KEY = process.env.INSEE_CLIENT_ID
const INSEE_APP_SECRET = process.env.INSEE_CLIENT_SECRET
const INSEE_TOKEN_URL = 'https://api.insee.fr/token'
const MELODI_API_URL = 'https://api.insee.fr/melodi/data/DS_RP_POPULATION_PRINC'

// Données démo pour fallback
const MOCK_DEMO_DATA = {
    elevation: 2.4, // Placeholder for evolution
    population: 12500,
    evolution5ans: 2.4,
    repartitionAges: {
        '0-14': 18,
        '15-29': 22,
        '30-44': 25,
        '45-59': 20,
        '60-74': 10,
        '75+': 5
    },
    revenuMedian: 22400
}

let cachedToken: { value: string, expiresAt: number } | null = null

export const inseeLocalApi = {
    async getDonneesCommune(codePostal: string) {
        // 1. Convertir CP -> Code Commune INSEE
        const commune = await geoApi.getCommuneByCodePostal(codePostal)

        // Si pas de tokens configurés
        if (!INSEE_APP_KEY || !INSEE_APP_SECRET) {
            console.log('Mode démo (pas de clés): Utilisation données INSEE simulées')
            return commune ? { ...MOCK_DEMO_DATA, population: commune.population, nomCommune: commune.nom } : MOCK_DEMO_DATA
        }

        if (!commune) {
            console.warn(`Aucune commune trouvée pour le code postal ${codePostal}`)
            return MOCK_DEMO_DATA
        }

        try {
            const token = await getInseeToken()

            // Appel à l'API Melodi (prévu pour les développements futurs)
            // https://api.insee.fr/melodi/data/DS_RP_POPULATION_PRINC?maxResult=200

            return {
                ...MOCK_DEMO_DATA,
                population: commune.population, // Source fiable de l'API Géo
                nomCommune: commune.nom
            }

        } catch (error) {
            console.error('Erreur API INSEE:', error)
            return { ...MOCK_DEMO_DATA, population: commune?.population || MOCK_DEMO_DATA.population }
        }
    }
}

async function getInseeToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.value
    }

    if (!INSEE_APP_KEY || !INSEE_APP_SECRET) {
        throw new Error("Clés API INSEE manquantes")
    }

    try {
        const response = await fetch(INSEE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${INSEE_APP_KEY}:${INSEE_APP_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        })

        if (!response.ok) {
            const err = await response.text()
            throw new Error(`Erreur Token INSEE: ${err}`)
        }

        const data = await response.json()

        cachedToken = {
            value: data.access_token,
            expiresAt: Date.now() + (data.expires_in * 1000) - 60000 // Marge 1min
        }

        return data.access_token
    } catch (e) {
        console.error("Impossible d'obtenir le token INSEE", e)
        throw e
    }
}
