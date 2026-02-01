
interface SireneResponse {
    total_results: number
    results: any[]
}

export const sireneApi = {
    /**
     * Recherche le nombre d'établissements pour un code NAF
     * Supporte filtre par Code Postal OU par Rayon géospatial (prioritaire)
     */
    async countConcurrents(codeNAF: string, codePostal: string, lat?: number, lon?: number, radiusKm?: number) {
        // Pour /search (texte/CP), il faut le NAF sans point (ex: 5610A)
        // Pour /near_point (geo), il faut le NAF AVEC point (ex: 56.10A)

        let url = ''

        // Priorité à la recherche géographique si les coordonnées sont fournies
        if (lat && lon && radiusKm) {
            // Endpoint géospatial
            // Note: activite_principale attend le format AVEC point (ex 56.10A)
            const params = new URLSearchParams({
                activite_principale: codeNAF, // Garder le point
                lat: lat.toString(),
                long: lon.toString(),
                radius: radiusKm.toString(),
                etat_administratif: 'A', // Actifs
                per_page: '1', // Juste pour le count
                limite_publication_legale_1: 'false'
            })
            url = `https://recherche-entreprises.api.gouv.fr/near_point?${params}`
        } else {
            // Endpoint recherche textuelle standard
            const nafClean = codeNAF.replace('.', '')
            const params = new URLSearchParams({
                code_activite_principale: nafClean,
                code_postal: codePostal,
                etat_administratif: 'A',
                per_page: '1',
                limite_publication_legale_1: 'false'
            })
            url = `https://recherche-entreprises.api.gouv.fr/search?${params}`
        }

        try {
            const response = await fetch(url)

            if (!response.ok) {
                console.warn('Erreur API Sirene Count:', response.statusText)
                return 0
            }

            const data = await response.json() as SireneResponse
            return data.total_results
        } catch (error) {
            console.error('Erreur sireneApi:', error)
            return null
        }
    },

    /**
     * Récupère un échantillon de concurrents avec détails
     */
    async searchConcurrents(codeNAF: string, codePostal: string, limit = 10, lat?: number, lon?: number, radiusKm?: number) {
        let url = ''

        if (lat && lon && radiusKm) {
            const params = new URLSearchParams({
                activite_principale: codeNAF, // Avec point
                lat: lat.toString(),
                long: lon.toString(),
                radius: radiusKm.toString(),
                etat_administratif: 'A',
                per_page: limit.toString(),
                limite_publication_legale_1: 'false'
            })
            url = `https://recherche-entreprises.api.gouv.fr/near_point?${params}`
        } else {
            const nafClean = codeNAF.replace('.', '')
            const params = new URLSearchParams({
                code_activite_principale: nafClean,
                code_postal: codePostal,
                etat_administratif: 'A',
                per_page: limit.toString(),
                limite_publication_legale_1: 'false'
            })
            url = `https://recherche-entreprises.api.gouv.fr/search?${params}`
        }

        try {
            const response = await fetch(url)

            if (!response.ok) {
                console.warn('Erreur API Sirene Search:', response.statusText)
                return []
            }

            const data = await response.json() as SireneResponse

            if (!data.results) return []

            return data.results.map((etab: any) => ({
                siret: etab.siret,
                nom: etab.nom_complet || etab.nom_raison_sociale || 'Nom inconnu',
                adresse: etab.adresse,
                dateCreation: etab.date_creation,
                trancheEffectif: etab.tranche_effectif_salarie,
            }))
        } catch (error) {
            console.error('Erreur searchConcurrents:', error)
            return []
        }
    }
}
