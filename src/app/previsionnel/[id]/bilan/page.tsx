import { getAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BilanView } from '@/components/bilan/BilanView'
import { calculatePrevisionnelCashFlow, calculateBilan } from '@/lib/financial-calculations'
import { calculerSIG, DonneesCompteResultat } from '@/lib/calculations/compte-resultat'

export default async function BilanPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    // 1. Authentification
    const authUser = await getAuthenticatedUser()
    if (!authUser) redirect('/login')

    const { id } = await params

    // 2. Fetch du prévisionnel avec TOUTES les relations
    const previsionnel = await prisma.previsionnel.findUnique({
        where: { id },
        include: {
            lignesCA: true,
            lignesCharge: true,
            hypotheses: true,
            financements: true,
            investissements: true
        }
    })

    if (!previsionnel) return <div>Prévisionnel introuvable</div>

    // 3. Calculs Préliminaires (Nécessaires pour le Bilan)

    // A. Calcul du Compte de Résultat pour avoir le Résultat Net de chaque année
    const resultatsAnnuels = []

    for (let year = 1; year <= 3; year++) {
        // Extraction des données brutes pour l'année (similaire à compte-resultat/page.tsx)
        const yearOffset = (year - 1) * 12

        // Helper to sum monthly amounts for the specific year
        const sumYear = (montants: any) => {
            // Cast json to number[] safe
            const m = montants as number[]
            return m.slice(yearOffset, yearOffset + 12).reduce((a, b) => a + b, 0)
        }

        const donnees: DonneesCompteResultat = {
            venteMarchandises: previsionnel.lignesCA
                .filter(l => l.categorie === 'VENTE_MARCHANDISES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            productionVendueBiens: previsionnel.lignesCA
                .filter(l => l.categorie === 'PRODUCTION_VENDUE_BIENS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            productionVendueServices: previsionnel.lignesCA
                .filter(l => l.categorie === 'PRODUCTION_VENDUE_SERVICES' || l.categorie === 'PRESTATIONS_SERVICES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            subventionsExploitation: previsionnel.lignesCA
                .filter(l => l.categorie === 'SUBVENTIONS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            autresProduits: previsionnel.lignesCA
                .filter(l => l.categorie === 'AUTRES_PRODUITS')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            produitsFin: 0, // TODO
            produitsExceptionnels: 0, // TODO

            achatsMarchandises: previsionnel.lignesCharge
                .filter(l => l.categorie === 'ACHATS_MARCHANDISES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            variationStockMarchandises: 0, // TODO
            achatsMatieresPrem: previsionnel.lignesCharge
                .filter(l => l.categorie === 'ACHATS_MATIERES_PREMIERES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            variationStockMatieres: 0,
            autresAchats: previsionnel.lignesCharge
                .filter(l => l.categorie === 'ACHATS_FOURNITURES') // + autres
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            servicesExterieurs: previsionnel.lignesCharge
                // Simplification: Tout ce qui n'est pas Achat/Personnel/Impot
                // Note: categorie typing might be loose, ensure exact match or expanding list
                .filter(l => ['LOCATIONS', 'ENTRETIEN', 'ASSURANCES', 'HONORAIRES', 'PUBLICITE', 'DEPLACEMENTS', 'TELECOM', 'SERVICES_BANCAIRES', 'AUTRES_CHARGES_EXTERNES'].includes(l.categorie))
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            autresServicesExterieurs: 0,
            impotsTaxes: previsionnel.lignesCharge
                .filter(l => l.categorie === 'IMPOTS_TAXES')
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            chargesPersonnel: previsionnel.lignesCharge
                .filter(l => ['REMUNERATION_DIRIGEANT', 'SALAIRES_BRUTS', 'CHARGES_SOCIALES'].includes(l.categorie))
                .reduce((sum, l) => sum + sumYear(l.montantsMensuels), 0),
            dotationsAmortissements: 0, // TODO: From Investissements
            dotationsProvisions: 0,
            chargesFinancieres: 0, // TODO: From Emprunts
            chargesExceptionnelles: 0,
            participationSalaries: 0,
            impotSurBenefices: 0 // Calculated internally by calculerSIG if needed, or 0
        }

        const sig = calculerSIG(donnees)
        resultatsAnnuels.push(sig.resultatNet)
    }

    // B. Calcul de la Trésorerie Mensuelle
    const monthlyFlows = calculatePrevisionnelCashFlow(previsionnel)

    // C. Calcul du Bilan (Enfin !)
    const bilans = calculateBilan(previsionnel, monthlyFlows, resultatsAnnuels)

    // 4. Rendu
    return <BilanView previsionnel={previsionnel} bilans={bilans} />
}
