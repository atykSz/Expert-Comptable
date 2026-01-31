/**
 * Tests des calculs d'amortissements
 * Vérifie la conformité au CGI (linéaire et dégressif)
 */

import {
    calculerAmortissementLineaire,
    calculerAmortissementDegressif,
    calculerAmortissement,
    getDotationPourAnnee,
    calculerDotationsTotales,
    Investissement,
} from '@/lib/calculations/amortissements'

describe('Amortissements', () => {
    describe('calculerAmortissementLineaire', () => {
        const investissement: Investissement = {
            id: '1',
            libelle: 'Ordinateur',
            montantHT: 1200,
            dateAcquisition: new Date('2024-01-01'),
            dureeAmortissement: 36, // 3 ans
            modeAmortissement: 'LINEAIRE',
        }

        it('calcule correctement la dotation annuelle', () => {
            const tableau = calculerAmortissementLineaire(investissement)

            // 1200€ / 3 ans = 400€ par an
            expect(tableau[0].dotation).toBe(400)
            expect(tableau[1].dotation).toBe(400)
            expect(tableau[2].dotation).toBe(400)
        })

        it('retourne un tableau de 3 lignes pour 3 ans', () => {
            const tableau = calculerAmortissementLineaire(investissement)
            expect(tableau).toHaveLength(3)
        })

        it('a une VNC finale de 0', () => {
            const tableau = calculerAmortissementLineaire(investissement)
            const derniereLigne = tableau[tableau.length - 1]
            expect(derniereLigne.valeurNetteComptable).toBe(0)
        })

        it('applique le prorata temporis pour acquisition en cours d\'année', () => {
            const invMiAnnee: Investissement = {
                ...investissement,
                dateAcquisition: new Date('2024-07-01'),
            }
            const tableau = calculerAmortissementLineaire(invMiAnnee)

            // Environ 6 mois sur 12 = 50% de 400€ = 200€ (avec marge d'arrondi)
            expect(tableau[0].dotation).toBeLessThan(400)
            expect(tableau[0].dotation).toBeGreaterThan(150)
        })

        it('prend en compte la valeur résiduelle', () => {
            const invAvecResiduelle: Investissement = {
                ...investissement,
                valeurResiduelle: 200,
            }
            const tableau = calculerAmortissementLineaire(invAvecResiduelle)

            // Base amortissable = 1200 - 200 = 1000€
            // Dotation annuelle = 1000 / 3 = 333.33€
            const totalDotations = tableau.reduce((sum, l) => sum + l.dotation, 0)
            expect(totalDotations).toBeCloseTo(1000, 0)
        })

        it('retourne un tableau vide pour un bien non amortissable', () => {
            const invNonAmortissable: Investissement = {
                ...investissement,
                modeAmortissement: 'NON_AMORTISSABLE',
            }
            const tableau = calculerAmortissementLineaire(invNonAmortissable)
            expect(tableau).toHaveLength(0)
        })
    })

    describe('calculerAmortissementDegressif', () => {
        const investissement: Investissement = {
            id: '1',
            libelle: 'Machine industrielle',
            montantHT: 10000,
            dateAcquisition: new Date('2024-01-01'),
            dureeAmortissement: 60, // 5 ans
            modeAmortissement: 'DEGRESSIF',
        }

        it('applique le coefficient dégressif de 1.75 pour 5 ans', () => {
            const tableau = calculerAmortissementDegressif(investissement)

            // Coefficient 1.75 pour durée 5 ans
            // Taux linéaire = 20%, taux dégressif = 35%
            // Première dotation = 10000 * 35% = 3500€
            expect(tableau[0].dotation).toBe(3500)
        })

        it('a des dotations dégressives puis constantes', () => {
            const tableau = calculerAmortissementDegressif(investissement)

            // Les premières années sont dégressives
            expect(tableau[0].dotation).toBeGreaterThan(tableau[1].dotation)

            // La VNC finale doit être 0
            const derniereLigne = tableau[tableau.length - 1]
            expect(derniereLigne.valeurNetteComptable).toBe(0)
        })

        it('amortit complètement le bien', () => {
            const tableau = calculerAmortissementDegressif(investissement)
            const totalDotations = tableau.reduce((sum, l) => sum + l.dotation, 0)
            expect(totalDotations).toBeCloseTo(10000, 0)
        })
    })

    describe('calculerAmortissement', () => {
        it('choisit la bonne méthode selon le mode', () => {
            const invLineaire: Investissement = {
                id: '1',
                libelle: 'Test',
                montantHT: 1000,
                dateAcquisition: new Date('2024-01-01'),
                dureeAmortissement: 24,
                modeAmortissement: 'LINEAIRE',
            }

            const invDegressif: Investissement = {
                ...invLineaire,
                modeAmortissement: 'DEGRESSIF',
            }

            const tableauLineaire = calculerAmortissement(invLineaire)
            const tableauDegressif = calculerAmortissement(invDegressif)

            // Linéaire = dotations constantes
            expect(tableauLineaire[0].dotation).toBe(tableauLineaire[1].dotation)

            // Dégressif = première dotation plus importante
            expect(tableauDegressif[0].dotation).toBeGreaterThan(tableauDegressif[1].dotation)
        })
    })

    describe('getDotationPourAnnee', () => {
        it('retourne la dotation pour une année spécifique', () => {
            const investissement: Investissement = {
                id: '1',
                libelle: 'Test',
                montantHT: 1200,
                dateAcquisition: new Date('2024-01-01'),
                dureeAmortissement: 36,
                modeAmortissement: 'LINEAIRE',
            }
            const tableau = calculerAmortissement(investissement)

            expect(getDotationPourAnnee(tableau, 2024)).toBe(400)
            expect(getDotationPourAnnee(tableau, 2025)).toBe(400)
            expect(getDotationPourAnnee(tableau, 2026)).toBe(400)
        })

        it('retourne 0 pour une année sans dotation', () => {
            const investissement: Investissement = {
                id: '1',
                libelle: 'Test',
                montantHT: 1200,
                dateAcquisition: new Date('2024-01-01'),
                dureeAmortissement: 36,
                modeAmortissement: 'LINEAIRE',
            }
            const tableau = calculerAmortissement(investissement)

            expect(getDotationPourAnnee(tableau, 2030)).toBe(0)
        })
    })

    describe('calculerDotationsTotales', () => {
        it('cumule les dotations de plusieurs investissements', () => {
            const investissements: Investissement[] = [
                {
                    id: '1',
                    libelle: 'Ordi 1',
                    montantHT: 1200,
                    dateAcquisition: new Date('2024-01-01'),
                    dureeAmortissement: 36,
                    modeAmortissement: 'LINEAIRE',
                },
                {
                    id: '2',
                    libelle: 'Ordi 2',
                    montantHT: 600,
                    dateAcquisition: new Date('2024-01-01'),
                    dureeAmortissement: 36,
                    modeAmortissement: 'LINEAIRE',
                },
            ]

            const total = calculerDotationsTotales(investissements, 2024)

            // 1200/3 + 600/3 = 400 + 200 = 600€
            expect(total).toBe(600)
        })
    })
})
