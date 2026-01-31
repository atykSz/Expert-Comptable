
interface SireneResponse {
    total_results: number
    results: any[]
}

export const sireneApi = {
    /**
     * Recherche le nombre d'établissements pour un code NAF dans une zone géographique
     */
    async countConcurrents(codeNAF: string, codePostal: string) {
        // Nettoyage du code NAF (ex: 56.10A -> 5610A)
        const nafClean = codeNAF.replace('.', '')

        // API Recherche d'entreprises (data.gouv.fr) - Gratuite sans clé
        // Note: On filtre par code activité principale (NAF) et code postal
        const params = new URLSearchParams({
            code_activite_principale: nafClean,
            code_postal: codePostal,
            etat_administratif: 'A', // Actifs uniquement
            per_page: '1', // On veut juste le total pour commencer
            limite_publication_legale_1: 'false' // Inclure ceux qui s'opposent à la diffusion commerciale (comptage statistique)
        })

        try {
            const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?${params}`)

            if (!response.ok) {
                throw new Error('Erreur API Recherche Entreprises')
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
    async searchConcurrents(codeNAF: string, codePostal: string, limit = 10) {
        const nafClean = codeNAF.replace('.', '')

        const params = new URLSearchParams({
            code_activite_principale: nafClean,
            code_postal: codePostal,
            etat_administratif: 'A',
            per_page: limit.toString(),
        })

        try {
            const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?${params}`)

            if (!response.ok) throw new Error('Erreur API')

            const data = await response.json() as SireneResponse

            return data.results.map((etab: any) => ({
                siret: etab.siret,
                nom: etab.nom_complet,
                adresse: etab.adresse,
                dateCreation: etab.date_creation,
                trancheEffectif: etab.tranche_effectif_salarie
            }))
        } catch (error) {
            console.error('Erreur searchConcurrents:', error)
            return []
        }
    }
}
