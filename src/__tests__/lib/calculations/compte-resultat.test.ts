/**
 * Tests des calculs du Compte de Résultat (SIG)
 * Vérifie la conformité au Plan Comptable Général
 */

import {
    calculerMargeCommerciale,
    calculerProductionExercice,
    calculerValeurAjoutee,
    calculerEBE,
    calculerResultatExploitation,
    calculerResultatCourant,
    calculerResultatNet,
    calculerCAF,
    calculerIS,
    calculerSIG,
    DonneesCompteResultat,
} from '@/lib/calculations/compte-resultat'

describe('Compte de Résultat (SIG)', () => {
    describe('calculerMargeCommerciale', () => {
        it('calcule la marge commerciale correctement', () => {
            // Marge = Ventes - (Achats + Variation stock)
            const marge = calculerMargeCommerciale(100000, 60000, -5000)
            expect(marge).toBe(45000) // 100000 - (60000 - 5000)
        })

        it('retourne 0 si pas de ventes', () => {
            const marge = calculerMargeCommerciale(0, 0, 0)
            expect(marge).toBe(0)
        })
    })

    describe('calculerProductionExercice', () => {
        it('additionne les différentes productions', () => {
            const production = calculerProductionExercice(
                50000, // Biens vendus
                100000, // Services vendus
                5000, // Production stockée
                2000 // Production immobilisée
            )
            expect(production).toBe(157000)
        })

        it('fonctionne avec seulement les services', () => {
            const production = calculerProductionExercice(0, 80000)
            expect(production).toBe(80000)
        })
    })

    describe('calculerValeurAjoutee', () => {
        it('calcule la VA = Marge + Production - Consommations', () => {
            const va = calculerValeurAjoutee(
                20000, // Marge commerciale
                100000, // Production
                40000 // Consommations
            )
            expect(va).toBe(80000)
        })
    })

    describe('calculerEBE', () => {
        it('calcule l\'EBE correctement', () => {
            const ebe = calculerEBE(
                80000, // Valeur ajoutée
                5000, // Subventions
                3000, // Impôts & taxes
                30000 // Charges personnel
            )
            // EBE = 80000 + 5000 - 3000 - 30000 = 52000
            expect(ebe).toBe(52000)
        })

        it('peut être négatif (insuffisance brute)', () => {
            const ebe = calculerEBE(20000, 0, 5000, 30000)
            expect(ebe).toBe(-15000)
        })
    })

    describe('calculerResultatExploitation', () => {
        it('calcule le RE en ajoutant/soustrayant les dotations', () => {
            const re = calculerResultatExploitation(
                50000, // EBE
                2000, // Autres produits
                1000, // Reprises provisions
                8000, // Dotations amortissements
                2000, // Dotations provisions
                1000 // Autres charges
            )
            // RE = 50000 + 2000 + 1000 - 8000 - 2000 - 1000 = 42000
            expect(re).toBe(42000)
        })
    })

    describe('calculerResultatCourant', () => {
        it('intègre le résultat financier', () => {
            const rcai = calculerResultatCourant(
                40000, // Résultat exploitation
                500, // Produits financiers
                3000 // Charges financières
            )
            // RCAI = 40000 + 500 - 3000 = 37500
            expect(rcai).toBe(37500)
        })
    })

    describe('calculerResultatNet', () => {
        it('déduit participation et IS', () => {
            const rn = calculerResultatNet(
                37500, // RCAI
                0, // Résultat exceptionnel
                0, // Participation
                6250 // IS
            )
            expect(rn).toBe(31250)
        })

        it('intègre le résultat exceptionnel', () => {
            const rn = calculerResultatNet(
                30000, // RCAI
                5000, // Résultat exceptionnel
                0, // Participation
                7000 // IS
            )
            expect(rn).toBe(28000)
        })
    })

    describe('calculerCAF', () => {
        it('ajoute les dotations au résultat net', () => {
            const caf = calculerCAF(
                30000, // Résultat net
                8000, // Dotations amortissements
                2000 // Dotations provisions
            )
            // CAF = RN + Dotations = 30000 + 8000 + 2000 = 40000
            expect(caf).toBe(40000)
        })

        it('prend en compte les reprises et cessions', () => {
            const caf = calculerCAF(
                30000, // RN
                8000, // Dotations amortissements
                2000, // Dotations provisions
                1000, // Reprises
                500, // Plus-values cessions
                200 // Moins-values cessions
            )
            // CAF = 30000 + 8000 + 2000 - 1000 - 500 + 200 = 38700
            expect(caf).toBe(38700)
        })
    })

    describe('calculerIS', () => {
        it('applique le taux réduit de 15% jusqu\'à 42500€ pour PME', () => {
            const is = calculerIS(42500, true)
            expect(is).toBe(6375) // 42500 * 15%
        })

        it('applique 25% au-delà du seuil PME', () => {
            const is = calculerIS(100000, true)
            // 42500 * 15% + (100000 - 42500) * 25%
            // = 6375 + 14375 = 20750
            expect(is).toBe(20750)
        })

        it('applique 25% sur tout le bénéfice pour non-PME', () => {
            const is = calculerIS(100000, false)
            expect(is).toBe(25000)
        })

        it('retourne 0 si résultat négatif', () => {
            const is = calculerIS(-10000, true)
            expect(is).toBe(0)
        })
    })

    describe('calculerSIG (intégration)', () => {
        it('calcule tous les SIG correctement', () => {
            const donnees: DonneesCompteResultat = {
                venteMarchandises: 50000,
                productionVendueBiens: 0,
                productionVendueServices: 200000,
                subventionsExploitation: 0,
                autresProduits: 0,
                produitsFin: 0,
                produitsExceptionnels: 0,
                achatsMarchandises: 30000,
                variationStockMarchandises: 0,
                achatsMatieresPrem: 10000,
                variationStockMatieres: 0,
                autresAchats: 40000,
                servicesExterieurs: 20000,
                autresServicesExterieurs: 10000,
                impotsTaxes: 5000,
                chargesPersonnel: 60000,
                dotationsAmortissements: 15000,
                dotationsProvisions: 0,
                chargesFinancieres: 2000,
                chargesExceptionnelles: 0,
                participationSalaries: 0,
                impotSurBenefices: 12000,
            }

            const sig = calculerSIG(donnees)

            // Vérifications des principaux indicateurs
            expect(sig.margeCommerciale).toBe(20000) // 50000 - 30000
            expect(sig.productionExercice).toBe(200000)
            expect(sig.valeurAjoutee).toBeGreaterThan(0)
            expect(sig.excedentBrutExploitation).toBeDefined()
            expect(sig.resultatNet).toBeDefined()
            expect(sig.capaciteAutofinancement).toBeDefined()
        })
    })
})
