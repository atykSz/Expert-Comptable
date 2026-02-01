
interface PappersSearchResponse {
    resultats: PappersCompany[]
    total: number
}

interface PappersCompany {
    siren: string
    nom_entreprise: string
    siege?: {
        adresse_ligne_1: string
        code_postal: string
        ville: string
        latitude?: number
        longitude?: number
    }
    chiffre_affaires?: number
    resultat?: number
    effectif?: number
    date_creation?: string
    // ... autres champs
}

export const pappersApi = {
    /**
     * Recherche des entreprises via Pappers
     * (Plus riche en données financières que Sirene)
     */
    async searchCompany(q: string, codeNAF?: string, codePostal?: string) {
        const apiKey = process.env.PAPPERS_API_KEY
        if (!apiKey) {
            console.warn('PAPPERS_API_KEY non configurée')
            return []
        }

        const params = new URLSearchParams({
            api_token: apiKey,
            par_page: '10',
            precision: 'standard'
        })

        if (q) params.append('q', q)
        if (codeNAF) params.append('code_naf', codeNAF.replace('.', ''))
        if (codePostal) params.append('code_postal', codePostal)

        try {
            const res = await fetch(`https://api.pappers.fr/v2/recherche?${params}`)
            if (!res.ok) throw new Error(`Pappers Error: ${res.statusText}`)
            const data = await res.json() as PappersSearchResponse
            return data.resultats || []
        } catch (error) {
            console.error('Erreur Pappers Search:', error)
            return []
        }
    },

    /**
     * Récupère les détails financiers d'une entreprise par SIREN
     */
    async getFinancials(siren: string) {
        const apiKey = process.env.PAPPERS_API_KEY
        if (!apiKey) return null

        try {
            const res = await fetch(`https://api.pappers.fr/v2/entreprise?api_token=${apiKey}&siren=${siren}`)
            if (!res.ok) return null
            const data = await res.json()

            // Extraction du dernier bilan disponible
            const finances = data.finances || []
            const lastFinance = finances[0] || {}

            return {
                ca: lastFinance.chiffre_affaires,
                resultat: lastFinance.resultat,
                annee: lastFinance.annee
            }
        } catch (error) {
            console.error('Erreur Pappers Financials:', error)
            return null
        }
    }
}
