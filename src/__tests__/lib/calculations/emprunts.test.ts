/**
 * Tests des calculs d'emprunts
 * Vérifie les échéanciers à mensualités constantes et amortissement constant
 */

import {
    calculerEcheancierMensualiteConstante,
    calculerEcheancierAmortissementConstant,
    calculerEcheancier,
    calculerCoutTotalEmprunt,
    getRemboursementsAnnee,
    getCapitalRestantDu,
    Emprunt,
} from '@/lib/calculations/emprunts'

describe('Emprunts', () => {
    describe('calculerEcheancierMensualiteConstante', () => {
        const emprunt: Emprunt = {
            id: '1',
            libelle: 'Emprunt bancaire',
            montant: 100000,
            tauxAnnuel: 3, // 3%
            dureeMois: 120, // 10 ans
            dateDebut: new Date('2024-01-01'),
            typeRemboursement: 'CONSTANT',
        }

        it('génère le bon nombre d\'échéances', () => {
            const echeancier = calculerEcheancierMensualiteConstante(emprunt)
            expect(echeancier).toHaveLength(120)
        })

        it('a des mensualités constantes', () => {
            const echeancier = calculerEcheancierMensualiteConstante(emprunt)
            const premiereEcheance = echeancier[0].mensualite

            // Toutes les mensualités doivent être égales (sauf dernière pour arrondi)
            for (let i = 0; i < echeancier.length - 1; i++) {
                expect(echeancier[i].mensualite).toBe(premiereEcheance)
            }
        })

        it('rembourse exactement le capital emprunté', () => {
            const echeancier = calculerEcheancierMensualiteConstante(emprunt)
            const derniereLigne = echeancier[echeancier.length - 1]
            expect(derniereLigne.capitalFin).toBe(0)
        })

        it('a des amortissements croissants (intérêts décroissants)', () => {
            const echeancier = calculerEcheancierMensualiteConstante(emprunt)

            // L'amortissement augmente au fil du temps
            expect(echeancier[1].amortissement).toBeGreaterThan(echeancier[0].amortissement)
            expect(echeancier[50].amortissement).toBeGreaterThan(echeancier[0].amortissement)
        })

        it('gère le différé de remboursement', () => {
            const empruntAvecDiffere: Emprunt = {
                ...emprunt,
                differeMois: 6,
            }
            const echeancier = calculerEcheancierMensualiteConstante(empruntAvecDiffere)

            // Pendant le différé, amortissement = 0
            expect(echeancier[0].amortissement).toBe(0)
            expect(echeancier[5].amortissement).toBe(0)

            // Après le différé, amortissement > 0
            expect(echeancier[6].amortissement).toBeGreaterThan(0)
        })
    })

    describe('calculerEcheancierAmortissementConstant', () => {
        const emprunt: Emprunt = {
            id: '1',
            libelle: 'Emprunt bancaire',
            montant: 120000,
            tauxAnnuel: 4,
            dureeMois: 120,
            dateDebut: new Date('2024-01-01'),
            typeRemboursement: 'DEGRESSIF',
        }

        it('a des amortissements constants', () => {
            const echeancier = calculerEcheancierAmortissementConstant(emprunt)
            const amortissementAttendu = 1000 // 120000 / 120

            // Tous les amortissements doivent être égaux
            for (let i = 0; i < echeancier.length - 1; i++) {
                expect(echeancier[i].amortissement).toBe(amortissementAttendu)
            }
        })

        it('a des mensualités dégressives', () => {
            const echeancier = calculerEcheancierAmortissementConstant(emprunt)

            // La mensualité diminue car les intérêts baissent
            expect(echeancier[0].mensualite).toBeGreaterThan(echeancier[10].mensualite)
            expect(echeancier[10].mensualite).toBeGreaterThan(echeancier[50].mensualite)
        })
    })

    describe('calculerEcheancier', () => {
        it('choisit la bonne méthode selon le type', () => {
            const empruntConstant: Emprunt = {
                id: '1',
                libelle: 'Test',
                montant: 10000,
                tauxAnnuel: 5,
                dureeMois: 12,
                dateDebut: new Date('2024-01-01'),
                typeRemboursement: 'CONSTANT',
            }

            const empruntDegressif: Emprunt = {
                ...empruntConstant,
                typeRemboursement: 'DEGRESSIF',
            }

            const echeancierConstant = calculerEcheancier(empruntConstant)
            const echeancierDegressif = calculerEcheancier(empruntDegressif)

            // Mensualités constantes = toutes égales
            expect(echeancierConstant[0].mensualite).toBe(echeancierConstant[1].mensualite)

            // Amortissement constant = toutes les dotations égales
            expect(echeancierDegressif[0].amortissement).toBe(echeancierDegressif[1].amortissement)
        })
    })

    describe('calculerCoutTotalEmprunt', () => {
        it('calcule correctement le coût total', () => {
            const emprunt: Emprunt = {
                id: '1',
                libelle: 'Test',
                montant: 10000,
                tauxAnnuel: 5,
                dureeMois: 24,
                dateDebut: new Date('2024-01-01'),
                typeRemboursement: 'CONSTANT',
            }

            const echeancier = calculerEcheancier(emprunt)
            const cout = calculerCoutTotalEmprunt(echeancier)

            expect(cout.totalCapital).toBe(10000) // Le capital est bien remboursé
            expect(cout.totalInterets).toBeGreaterThan(0) // Il y a des intérêts
            expect(cout.totalRembourse).toBe(cout.totalCapital + cout.totalInterets)
        })
    })

    describe('getRemboursementsAnnee', () => {
        it('retourne les remboursements pour une année donnée', () => {
            const emprunt: Emprunt = {
                id: '1',
                libelle: 'Test',
                montant: 12000,
                tauxAnnuel: 0, // Simplifié sans intérêts
                dureeMois: 24,
                dateDebut: new Date('2024-01-01'),
                typeRemboursement: 'CONSTANT',
            }

            const echeancier = calculerEcheancier(emprunt)
            const rembourse2024 = getRemboursementsAnnee(echeancier, 2024)

            // 11 mois en 2024 (février à décembre) à 500€/mois = 5500€
            expect(rembourse2024.capitalRembourse).toBeCloseTo(5500, 0)
        })
    })

    describe('getCapitalRestantDu', () => {
        it('retourne le capital restant à une date donnée', () => {
            const emprunt: Emprunt = {
                id: '1',
                libelle: 'Test',
                montant: 12000,
                tauxAnnuel: 0,
                dureeMois: 12,
                dateDebut: new Date('2024-01-01'),
                typeRemboursement: 'CONSTANT',
            }

            const echeancier = calculerEcheancier(emprunt)

            // Après 6 mois, la moitié doit être remboursée
            const capitalRestant = getCapitalRestantDu(echeancier, new Date('2024-07-15'))
            expect(capitalRestant).toBeCloseTo(6000, 0)
        })
    })
})
