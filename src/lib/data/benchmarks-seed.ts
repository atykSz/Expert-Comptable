/**
 * Données de référence pour les benchmarks sectoriels
 * Sources : Données publiques Banque de France / INSEE ESANE
 *
 * Ces données représentent les quartiles (Q1, Médiane, Q3) des principaux
 * ratios financiers par secteur d'activité NAF.
 */

export interface BenchmarkSeedData {
  codeNAF: string
  codeNAF2: string
  division: string
  libelleNAF: string
  annee: number
  source: 'BANQUE_DE_FRANCE' | 'INSEE' | 'INTERNE'
  nbEntreprises?: number

  // Ratios de rentabilité (en %)
  margeBruteQ1?: number
  margeBruteMedian?: number
  margeBruteQ3?: number
  margeNetteQ1?: number
  margeNetteMedian?: number
  margeNetteQ3?: number
  tauxVAQ1?: number
  tauxVAMedian?: number
  tauxVAQ3?: number
  ebeCAQ1?: number
  ebeCAMedian?: number
  ebeCAQ3?: number

  // Ratios de structure (en %)
  tauxEndettementQ1?: number
  tauxEndettementMedian?: number
  tauxEndettementQ3?: number

  // Délais (en jours)
  delaiClientsQ1?: number
  delaiClientsMedian?: number
  delaiClientsQ3?: number
  delaiFournisseursQ1?: number
  delaiFournisseursMedian?: number
  delaiFournisseursQ3?: number
}

/**
 * Données de benchmark pour les secteurs courants
 * Basées sur les statistiques publiques 2023
 */
export const BENCHMARKS_SEED_DATA: BenchmarkSeedData[] = [
  // ============================================
  // RESTAURATION (56)
  // ============================================
  {
    codeNAF: '56.10A',
    codeNAF2: '56.10',
    division: '56',
    libelleNAF: 'Restauration traditionnelle',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 85000,
    margeBruteQ1: 62,
    margeBruteMedian: 68,
    margeBruteQ3: 73,
    margeNetteQ1: 1.5,
    margeNetteMedian: 3.5,
    margeNetteQ3: 6.5,
    tauxVAQ1: 38,
    tauxVAMedian: 44,
    tauxVAQ3: 50,
    ebeCAQ1: 5,
    ebeCAMedian: 10,
    ebeCAQ3: 16,
    tauxEndettementQ1: 80,
    tauxEndettementMedian: 150,
    tauxEndettementQ3: 280,
    delaiClientsQ1: 0,
    delaiClientsMedian: 3,
    delaiClientsQ3: 10,
    delaiFournisseursQ1: 15,
    delaiFournisseursMedian: 28,
    delaiFournisseursQ3: 45,
  },
  {
    codeNAF: '56.10B',
    codeNAF2: '56.10',
    division: '56',
    libelleNAF: 'Cafétérias et autres libres-services',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 2500,
    margeBruteQ1: 58,
    margeBruteMedian: 64,
    margeBruteQ3: 70,
    margeNetteQ1: 1,
    margeNetteMedian: 3,
    margeNetteQ3: 5.5,
    tauxVAQ1: 35,
    tauxVAMedian: 42,
    tauxVAQ3: 48,
    ebeCAQ1: 4,
    ebeCAMedian: 8,
    ebeCAQ3: 13,
    tauxEndettementQ1: 90,
    tauxEndettementMedian: 170,
    tauxEndettementQ3: 300,
    delaiClientsQ1: 0,
    delaiClientsMedian: 2,
    delaiClientsQ3: 8,
    delaiFournisseursQ1: 18,
    delaiFournisseursMedian: 32,
    delaiFournisseursQ3: 50,
  },
  {
    codeNAF: '56.10C',
    codeNAF2: '56.10',
    division: '56',
    libelleNAF: 'Restauration de type rapide',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 45000,
    margeBruteQ1: 55,
    margeBruteMedian: 62,
    margeBruteQ3: 68,
    margeNetteQ1: 2,
    margeNetteMedian: 4.5,
    margeNetteQ3: 8,
    tauxVAQ1: 32,
    tauxVAMedian: 40,
    tauxVAQ3: 47,
    ebeCAQ1: 6,
    ebeCAMedian: 12,
    ebeCAQ3: 18,
    tauxEndettementQ1: 70,
    tauxEndettementMedian: 130,
    tauxEndettementQ3: 240,
    delaiClientsQ1: 0,
    delaiClientsMedian: 1,
    delaiClientsQ3: 5,
    delaiFournisseursQ1: 12,
    delaiFournisseursMedian: 25,
    delaiFournisseursQ3: 42,
  },

  // ============================================
  // CONSEIL (70)
  // ============================================
  {
    codeNAF: '70.22Z',
    codeNAF2: '70.22',
    division: '70',
    libelleNAF: 'Conseil pour les affaires et autres conseils de gestion',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 120000,
    margeBruteQ1: 75,
    margeBruteMedian: 85,
    margeBruteQ3: 92,
    margeNetteQ1: 8,
    margeNetteMedian: 15,
    margeNetteQ3: 25,
    tauxVAQ1: 55,
    tauxVAMedian: 70,
    tauxVAQ3: 82,
    ebeCAQ1: 12,
    ebeCAMedian: 22,
    ebeCAQ3: 35,
    tauxEndettementQ1: 20,
    tauxEndettementMedian: 50,
    tauxEndettementQ3: 120,
    delaiClientsQ1: 25,
    delaiClientsMedian: 45,
    delaiClientsQ3: 72,
    delaiFournisseursQ1: 20,
    delaiFournisseursMedian: 35,
    delaiFournisseursQ3: 55,
  },

  // ============================================
  // SERVICES INFORMATIQUES (62)
  // ============================================
  {
    codeNAF: '62.01Z',
    codeNAF2: '62.01',
    division: '62',
    libelleNAF: 'Programmation informatique',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 75000,
    margeBruteQ1: 70,
    margeBruteMedian: 82,
    margeBruteQ3: 90,
    margeNetteQ1: 6,
    margeNetteMedian: 12,
    margeNetteQ3: 22,
    tauxVAQ1: 52,
    tauxVAMedian: 68,
    tauxVAQ3: 80,
    ebeCAQ1: 10,
    ebeCAMedian: 20,
    ebeCAQ3: 32,
    tauxEndettementQ1: 15,
    tauxEndettementMedian: 40,
    tauxEndettementQ3: 100,
    delaiClientsQ1: 30,
    delaiClientsMedian: 50,
    delaiClientsQ3: 75,
    delaiFournisseursQ1: 25,
    delaiFournisseursMedian: 40,
    delaiFournisseursQ3: 60,
  },
  {
    codeNAF: '62.02A',
    codeNAF2: '62.02',
    division: '62',
    libelleNAF: 'Conseil en systèmes et logiciels informatiques',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 55000,
    margeBruteQ1: 72,
    margeBruteMedian: 84,
    margeBruteQ3: 91,
    margeNetteQ1: 7,
    margeNetteMedian: 14,
    margeNetteQ3: 24,
    tauxVAQ1: 54,
    tauxVAMedian: 70,
    tauxVAQ3: 82,
    ebeCAQ1: 11,
    ebeCAMedian: 22,
    ebeCAQ3: 34,
    tauxEndettementQ1: 12,
    tauxEndettementMedian: 35,
    tauxEndettementQ3: 90,
    delaiClientsQ1: 28,
    delaiClientsMedian: 48,
    delaiClientsQ3: 70,
    delaiFournisseursQ1: 22,
    delaiFournisseursMedian: 38,
    delaiFournisseursQ3: 58,
  },

  // ============================================
  // COMMERCE DE DÉTAIL (47)
  // ============================================
  {
    codeNAF: '47.11A',
    codeNAF2: '47.11',
    division: '47',
    libelleNAF: 'Commerce de détail de produits surgelés',
    annee: 2023,
    source: 'INSEE',
    nbEntreprises: 3500,
    margeBruteQ1: 22,
    margeBruteMedian: 28,
    margeBruteQ3: 34,
    margeNetteQ1: 0.5,
    margeNetteMedian: 2,
    margeNetteQ3: 4,
    tauxVAQ1: 15,
    tauxVAMedian: 22,
    tauxVAQ3: 28,
    ebeCAQ1: 2,
    ebeCAMedian: 5,
    ebeCAQ3: 9,
    tauxEndettementQ1: 100,
    tauxEndettementMedian: 200,
    tauxEndettementQ3: 350,
    delaiClientsQ1: 0,
    delaiClientsMedian: 2,
    delaiClientsQ3: 8,
    delaiFournisseursQ1: 25,
    delaiFournisseursMedian: 40,
    delaiFournisseursQ3: 58,
  },
  {
    codeNAF: '47.11B',
    codeNAF2: '47.11',
    division: '47',
    libelleNAF: 'Commerce d\'alimentation générale',
    annee: 2023,
    source: 'INSEE',
    nbEntreprises: 28000,
    margeBruteQ1: 20,
    margeBruteMedian: 26,
    margeBruteQ3: 32,
    margeNetteQ1: 0.8,
    margeNetteMedian: 2.5,
    margeNetteQ3: 4.5,
    tauxVAQ1: 14,
    tauxVAMedian: 20,
    tauxVAQ3: 26,
    ebeCAQ1: 2.5,
    ebeCAMedian: 5.5,
    ebeCAQ3: 9,
    tauxEndettementQ1: 90,
    tauxEndettementMedian: 180,
    tauxEndettementQ3: 320,
    delaiClientsQ1: 0,
    delaiClientsMedian: 1,
    delaiClientsQ3: 5,
    delaiFournisseursQ1: 20,
    delaiFournisseursMedian: 35,
    delaiFournisseursQ3: 52,
  },
  {
    codeNAF: '47.71Z',
    codeNAF2: '47.71',
    division: '47',
    libelleNAF: 'Commerce de détail d\'habillement en magasin spécialisé',
    annee: 2023,
    source: 'INSEE',
    nbEntreprises: 35000,
    margeBruteQ1: 45,
    margeBruteMedian: 52,
    margeBruteQ3: 58,
    margeNetteQ1: 1,
    margeNetteMedian: 3.5,
    margeNetteQ3: 7,
    tauxVAQ1: 32,
    tauxVAMedian: 42,
    tauxVAQ3: 50,
    ebeCAQ1: 4,
    ebeCAMedian: 9,
    ebeCAQ3: 15,
    tauxEndettementQ1: 60,
    tauxEndettementMedian: 130,
    tauxEndettementQ3: 250,
    delaiClientsQ1: 0,
    delaiClientsMedian: 2,
    delaiClientsQ3: 8,
    delaiFournisseursQ1: 30,
    delaiFournisseursMedian: 48,
    delaiFournisseursQ3: 70,
  },

  // ============================================
  // BTP - CONSTRUCTION (41-43)
  // ============================================
  {
    codeNAF: '41.20A',
    codeNAF2: '41.20',
    division: '41',
    libelleNAF: 'Construction de maisons individuelles',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 18000,
    margeBruteQ1: 18,
    margeBruteMedian: 24,
    margeBruteQ3: 32,
    margeNetteQ1: 1,
    margeNetteMedian: 3,
    margeNetteQ3: 6,
    tauxVAQ1: 22,
    tauxVAMedian: 30,
    tauxVAQ3: 38,
    ebeCAQ1: 3,
    ebeCAMedian: 7,
    ebeCAQ3: 12,
    tauxEndettementQ1: 120,
    tauxEndettementMedian: 220,
    tauxEndettementQ3: 380,
    delaiClientsQ1: 35,
    delaiClientsMedian: 55,
    delaiClientsQ3: 80,
    delaiFournisseursQ1: 40,
    delaiFournisseursMedian: 60,
    delaiFournisseursQ3: 85,
  },
  {
    codeNAF: '43.21A',
    codeNAF2: '43.21',
    division: '43',
    libelleNAF: 'Travaux d\'installation électrique',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 55000,
    margeBruteQ1: 35,
    margeBruteMedian: 44,
    margeBruteQ3: 52,
    margeNetteQ1: 2,
    margeNetteMedian: 5,
    margeNetteQ3: 9,
    tauxVAQ1: 38,
    tauxVAMedian: 48,
    tauxVAQ3: 56,
    ebeCAQ1: 5,
    ebeCAMedian: 10,
    ebeCAQ3: 16,
    tauxEndettementQ1: 80,
    tauxEndettementMedian: 150,
    tauxEndettementQ3: 280,
    delaiClientsQ1: 40,
    delaiClientsMedian: 58,
    delaiClientsQ3: 82,
    delaiFournisseursQ1: 35,
    delaiFournisseursMedian: 52,
    delaiFournisseursQ3: 75,
  },
  {
    codeNAF: '43.22A',
    codeNAF2: '43.22',
    division: '43',
    libelleNAF: 'Travaux d\'installation d\'eau et de gaz',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 32000,
    margeBruteQ1: 32,
    margeBruteMedian: 42,
    margeBruteQ3: 50,
    margeNetteQ1: 1.5,
    margeNetteMedian: 4.5,
    margeNetteQ3: 8.5,
    tauxVAQ1: 36,
    tauxVAMedian: 46,
    tauxVAQ3: 54,
    ebeCAQ1: 4.5,
    ebeCAMedian: 9.5,
    ebeCAQ3: 15,
    tauxEndettementQ1: 85,
    tauxEndettementMedian: 160,
    tauxEndettementQ3: 290,
    delaiClientsQ1: 38,
    delaiClientsMedian: 55,
    delaiClientsQ3: 78,
    delaiFournisseursQ1: 32,
    delaiFournisseursMedian: 50,
    delaiFournisseursQ3: 72,
  },

  // ============================================
  // PROFESSIONS LIBÉRALES / SANTÉ (86)
  // ============================================
  {
    codeNAF: '86.21Z',
    codeNAF2: '86.21',
    division: '86',
    libelleNAF: 'Activité des médecins généralistes',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 65000,
    margeBruteQ1: 82,
    margeBruteMedian: 88,
    margeBruteQ3: 93,
    margeNetteQ1: 25,
    margeNetteMedian: 38,
    margeNetteQ3: 50,
    tauxVAQ1: 75,
    tauxVAMedian: 85,
    tauxVAQ3: 92,
    ebeCAQ1: 30,
    ebeCAMedian: 45,
    ebeCAQ3: 58,
    tauxEndettementQ1: 10,
    tauxEndettementMedian: 30,
    tauxEndettementQ3: 80,
    delaiClientsQ1: 5,
    delaiClientsMedian: 15,
    delaiClientsQ3: 30,
    delaiFournisseursQ1: 15,
    delaiFournisseursMedian: 28,
    delaiFournisseursQ3: 45,
  },

  // ============================================
  // TRANSPORT (49)
  // ============================================
  {
    codeNAF: '49.41A',
    codeNAF2: '49.41',
    division: '49',
    libelleNAF: 'Transports routiers de fret interurbains',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 25000,
    margeBruteQ1: 15,
    margeBruteMedian: 22,
    margeBruteQ3: 30,
    margeNetteQ1: 0.5,
    margeNetteMedian: 2,
    margeNetteQ3: 4.5,
    tauxVAQ1: 28,
    tauxVAMedian: 38,
    tauxVAQ3: 48,
    ebeCAQ1: 3,
    ebeCAMedian: 7,
    ebeCAQ3: 12,
    tauxEndettementQ1: 150,
    tauxEndettementMedian: 280,
    tauxEndettementQ3: 450,
    delaiClientsQ1: 40,
    delaiClientsMedian: 58,
    delaiClientsQ3: 82,
    delaiFournisseursQ1: 25,
    delaiFournisseursMedian: 42,
    delaiFournisseursQ3: 62,
  },

  // ============================================
  // HÉBERGEMENT (55)
  // ============================================
  {
    codeNAF: '55.10Z',
    codeNAF2: '55.10',
    division: '55',
    libelleNAF: 'Hôtels et hébergement similaire',
    annee: 2023,
    source: 'BANQUE_DE_FRANCE',
    nbEntreprises: 18000,
    margeBruteQ1: 72,
    margeBruteMedian: 78,
    margeBruteQ3: 84,
    margeNetteQ1: 2,
    margeNetteMedian: 6,
    margeNetteQ3: 12,
    tauxVAQ1: 45,
    tauxVAMedian: 55,
    tauxVAQ3: 65,
    ebeCAQ1: 12,
    ebeCAMedian: 20,
    ebeCAQ3: 30,
    tauxEndettementQ1: 150,
    tauxEndettementMedian: 300,
    tauxEndettementQ3: 500,
    delaiClientsQ1: 5,
    delaiClientsMedian: 15,
    delaiClientsQ3: 30,
    delaiFournisseursQ1: 20,
    delaiFournisseursMedian: 35,
    delaiFournisseursQ3: 55,
  },
]

/**
 * Obtenir les benchmarks pour un code NAF avec fallback
 */
export function getBenchmarkByNAF(
  codeNAF: string,
  annee: number,
  data: BenchmarkSeedData[] = BENCHMARKS_SEED_DATA
): BenchmarkSeedData | undefined {
  // 1. Recherche exacte par code NAF complet
  let benchmark = data.find(b => b.codeNAF === codeNAF && b.annee === annee)
  if (benchmark) return benchmark

  // 2. Fallback sur code NAF à 4 caractères (sans lettre finale)
  const codeNAF2 = codeNAF.replace(/[A-Z]$/, '')
  benchmark = data.find(b => b.codeNAF2 === codeNAF2 && b.annee === annee)
  if (benchmark) return benchmark

  // 3. Fallback sur la division (2 premiers caractères)
  const division = codeNAF.substring(0, 2)
  benchmark = data.find(b => b.division === division && b.annee === annee)
  if (benchmark) return benchmark

  // 4. Fallback sur l'année précédente
  if (annee > 2020) {
    return getBenchmarkByNAF(codeNAF, annee - 1, data)
  }

  return undefined
}
