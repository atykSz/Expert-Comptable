
interface GeoCommune {
    nom: string
    code: string // Code INSEE
    codesPostaux: string[]
    population: number
}

export const geoApi = {
    /**
     * Trouve la commune principale pour un code postal
     */
    async getCommuneByCodePostal(codePostal: string): Promise<GeoCommune | null> {
        try {
            const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,code,codesPostaux,population&format=json&geometry=centre`)

            if (!response.ok) throw new Error('Erreur API Geo')

            const data = await response.json()

            if (!data || data.length === 0) return null

            // Retourne la commune avec la plus grande population si plusieurs correspondent (ex: codes postaux partagés)
            return data.sort((a: any, b: any) => b.population - a.population)[0]
        } catch (error) {
            console.error('Erreur geoApi:', error)
            return null
        }
    }
}
