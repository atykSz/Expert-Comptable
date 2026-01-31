/**
 * Tests unitaires pour les calculs financiers
 * Ces tests vérifient les fonctions critiques du prévisionnel
 */

import { calculatePrevisionnelCashFlow, calculateBilan, PrevisionnelWithRelations, MonthlyCashFlow } from '@/lib/financial-calculations'

// ============================================================================
// Données de test
// ============================================================================

const createMockPrevisionnel = (overrides: Partial<PrevisionnelWithRelations> = {}): PrevisionnelWithRelations => ({
    id: 'test-id',
    clientId: 'client-id',
    titre: 'Test Prévisionnel',
    description: null,
    dateDebut: new Date('2024-01-01'),
    nombreMois: 12,
    statut: 'BROUILLON',
    createdAt: new Date(),
    updatedAt: new Date(),
    lignesCA: [],
    lignesCharge: [],
    hypotheses: {
        id: 'hyp-id',
        previsionnelId: 'test-id',
        tauxTVAVentes: 20,
        tauxTVAAchats: 20,
        delaiPaiementClients: 30,
        delaiPaiementFournisseurs: 30,
        dureeStockJours: 0,
        tauxIS: 25,
        tauxChargesPatronales: 45,
        tauxChargesSalariales: 22,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    financements: [],
    investissements: [],
    ...overrides,
})

const createLigneCA = (montantsMensuels: number[], tauxTVA = 20) => ({
    id: 'ligne-ca-1',
    previsionnelId: 'test-id',
    libelle: 'Honoraires',
    categorie: 'PRESTATIONS_SERVICES',
    comptePCG: '706000',
    montantsMensuels,
    evolutionAn2: 0,
    evolutionAn3: 0,
    tauxTVA,
    createdAt: new Date(),
    updatedAt: new Date(),
})

const createLigneCharge = (montantsMensuels: number[], tauxTVA = 20) => ({
    id: 'ligne-charge-1',
    previsionnelId: 'test-id',
    libelle: 'Loyer',
    categorie: 'LOCATIONS',
    comptePCG: '613000',
    typeCharge: 'FIXE',
    montantsMensuels,
    evolutionAn2: 0,
    evolutionAn3: 0,
    tauxTVA,
    deductibleTVA: true,
    recurrence: 'MENSUEL',
    createdAt: new Date(),
    updatedAt: new Date(),
})

// ============================================================================
// Tests calculatePrevisionnelCashFlow
// ============================================================================

describe('calculatePrevisionnelCashFlow', () => {
    describe('Cas de base', () => {
        it('retourne un tableau de 12 éléments pour un prévisionnel de 12 mois', () => {
            const previsionnel = createMockPrevisionnel()
            const result = calculatePrevisionnelCashFlow(previsionnel)

            expect(result).toHaveLength(12)
        })

        it('retourne un tableau vide pour un prévisionnel de 0 mois', () => {
            const previsionnel = createMockPrevisionnel({ nombreMois: 0 })
            const result = calculatePrevisionnelCashFlow(previsionnel)

            expect(result).toHaveLength(0)
        })

        it('initialise correctement la trésorerie de départ', () => {
            const previsionnel = createMockPrevisionnel()
            const tresorerieInitiale = 10000
            const result = calculatePrevisionnelCashFlow(previsionnel, tresorerieInitiale)

            // Premier mois sans CA ni charges = trésorerie initiale
            expect(result[0].tresorerieFin).toBe(tresorerieInitiale)
        })
    })

    describe('Encaissements', () => {
        it('calcule correctement le CA TTC avec délai client de 30 jours', () => {
            const monthlyCA = Array(12).fill(10000) // 10 000 € HT/mois
            const previsionnel = createMockPrevisionnel({
                lignesCA: [createLigneCA(monthlyCA, 20)],
            })

            const result = calculatePrevisionnelCashFlow(previsionnel)

            // Délai 30j = 1 mois de décalage
            // Mois 0 : pas encore encaissé (décalage)
            expect(result[0].encaissements.caTTC).toBe(0)
            // Mois 1 : encaissement du CA de janvier (10000 * 1.20 = 12000)
            expect(result[1].encaissements.caTTC).toBe(12000)
        })

        it('gère correctement un délai client de 60 jours', () => {
            const monthlyCA = Array(12).fill(10000)
            const previsionnel = createMockPrevisionnel({
                lignesCA: [createLigneCA(monthlyCA, 20)],
                hypotheses: {
                    ...createMockPrevisionnel().hypotheses!,
                    delaiPaiementClients: 60,
                },
            })

            const result = calculatePrevisionnelCashFlow(previsionnel)

            // Délai 60j = 2 mois de décalage
            expect(result[0].encaissements.caTTC).toBe(0)
            expect(result[1].encaissements.caTTC).toBe(0)
            expect(result[2].encaissements.caTTC).toBe(12000)
        })
    })

    describe('Décaissements', () => {
        it('calcule correctement les charges TTC', () => {
            const monthlyCharges = Array(12).fill(1000) // 1 000 € HT/mois
            const previsionnel = createMockPrevisionnel({
                lignesCharge: [createLigneCharge(monthlyCharges, 20)],
            })

            const result = calculatePrevisionnelCashFlow(previsionnel)

            // Délai 30j = 1 mois de décalage
            expect(result[0].decaissements.achatsTTC).toBe(0)
            expect(result[1].decaissements.achatsTTC).toBe(1200) // 1000 * 1.20
        })
    })

    describe('Flux de trésorerie', () => {
        it('calcule correctement le solde mensuel', () => {
            const previsionnel = createMockPrevisionnel({
                lignesCA: [createLigneCA(Array(12).fill(10000), 0)], // Sans TVA pour simplifier
                lignesCharge: [createLigneCharge(Array(12).fill(3000), 0)],
            })

            const result = calculatePrevisionnelCashFlow(previsionnel)

            // Mois 1 : Encaissement 10000 - Décaissement 3000 = 7000
            expect(result[1].soldeFlux).toBe(7000)
        })

        it('cumule correctement la trésorerie', () => {
            const previsionnel = createMockPrevisionnel({
                lignesCA: [createLigneCA(Array(12).fill(10000), 0)],
                lignesCharge: [createLigneCharge(Array(12).fill(3000), 0)],
            })
            const tresorerieInitiale = 5000

            const result = calculatePrevisionnelCashFlow(previsionnel, tresorerieInitiale)

            // Trésorerie fin mois 11 = initiale + 11 * flux net (car mois 0 = 0)
            const expectedFinal = tresorerieInitiale + 11 * 7000
            expect(result[11].tresorerieFin).toBe(expectedFinal)
        })
    })

    describe('TVA', () => {
        it('calcule la TVA à décaisser avec un mois de décalage', () => {
            const previsionnel = createMockPrevisionnel({
                lignesCA: [createLigneCA(Array(12).fill(10000), 20)], // TVA collectée 2000/mois
                lignesCharge: [createLigneCharge(Array(12).fill(5000), 20)], // TVA déductible 1000/mois
            })

            const result = calculatePrevisionnelCashFlow(previsionnel)

            // Mois 0 : pas de TVA (M-1 = 0)
            expect(result[0].decaissements.tvaDecaissee).toBe(0)
            // Mois 1 : TVA collectée M0 (2000) - TVA déductible M0 (1000) = 1000
            expect(result[1].decaissements.tvaDecaissee).toBe(1000)
        })
    })
})

// ============================================================================
// Tests calculateBilan
// ============================================================================

describe('calculateBilan', () => {
    const createMockMonthlyFlows = (months: number = 12): MonthlyCashFlow[] => {
        return Array.from({ length: months }, (_, i) => ({
            mois: i + 1,
            encaissements: { caTTC: 12000, apportCapital: 0, emprunt: 0, total: 12000 },
            decaissements: { achatsTTC: 3000, chargesTTC: 0, chargesSociales: 0, salairesNet: 0, tvaDecaissee: 500, remboursementEmprunt: 0, total: 3500 },
            soldeFlux: 8500,
            tresorerieFin: 10000 + (i + 1) * 8500,
        }))
    }

    describe('Structure du bilan', () => {
        it('retourne un bilan par année', () => {
            const previsionnel = createMockPrevisionnel({ nombreMois: 36 })
            const flows = createMockMonthlyFlows(36)
            const resultats = [50000, 55000, 60000]

            const result = calculateBilan(previsionnel, flows, resultats)

            expect(result).toHaveLength(3)
            expect(result[0].annee).toBe(1)
            expect(result[1].annee).toBe(2)
            expect(result[2].annee).toBe(3)
        })

        it('retourne moins de bilans si le prévisionnel est plus court', () => {
            const previsionnel = createMockPrevisionnel({ nombreMois: 12 })
            const flows = createMockMonthlyFlows(12)
            const resultats = [50000]

            const result = calculateBilan(previsionnel, flows, resultats)

            expect(result).toHaveLength(1)
        })
    })

    describe('Équilibre Actif/Passif', () => {
        it('produit des bilans équilibrés (Actif = Passif)', () => {
            const previsionnel = createMockPrevisionnel({ nombreMois: 36 })
            const flows = createMockMonthlyFlows(36)
            const resultats = [50000, 55000, 60000]

            const result = calculateBilan(previsionnel, flows, resultats)

            result.forEach((bilan, i) => {
                expect(bilan.equilibre).toBe(true)
                expect(Math.abs(bilan.actif.total - bilan.passif.total)).toBeLessThan(1)
            })
        })
    })

    describe('Report à nouveau', () => {
        it('cumule le report à nouveau des années précédentes', () => {
            const previsionnel = createMockPrevisionnel({ nombreMois: 36 })
            const flows = createMockMonthlyFlows(36)
            const resultats = [10000, 20000, 30000]

            const result = calculateBilan(previsionnel, flows, resultats)

            expect(result[0].passif.reportANouveau).toBe(0)
            expect(result[1].passif.reportANouveau).toBe(10000) // Résultat année 1
            expect(result[2].passif.reportANouveau).toBe(30000) // Résultat année 1 + 2
        })
    })

    describe('Trésorerie', () => {
        it('classe la trésorerie positive en disponibilités (actif)', () => {
            const previsionnel = createMockPrevisionnel({ nombreMois: 12 })
            const flows = createMockMonthlyFlows(12)
            flows[11].tresorerieFin = 50000 // Trésorerie positive

            const result = calculateBilan(previsionnel, flows, [30000])

            expect(result[0].actif.disponibilites).toBe(50000)
            expect(result[0].passif.decouvertBancaire).toBe(0)
        })

        it('classe la trésorerie négative en découvert (passif)', () => {
            const previsionnel = createMockPrevisionnel({ nombreMois: 12 })
            const flows = createMockMonthlyFlows(12)
            flows[11].tresorerieFin = -25000 // Trésorerie négative

            const result = calculateBilan(previsionnel, flows, [30000])

            expect(result[0].actif.disponibilites).toBe(0)
            expect(result[0].passif.decouvertBancaire).toBe(25000)
        })
    })
})
