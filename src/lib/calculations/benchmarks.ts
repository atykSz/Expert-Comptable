/**
 * Calculs des benchmarks sectoriels
 * Compare les ratios financiers d'une entreprise aux médianes de son secteur
 */

import { round2 } from '../utils'
import type { ResultatSIG } from './compte-resultat'

// ========================
// TYPES
// ========================

export interface RatiosEntreprise {
  margeBrute: number      // (CA - Achats) / CA * 100
  margeNette: number      // Résultat Net / CA * 100
  tauxVA: number          // Valeur Ajoutée / CA * 100
  ebeCA: number           // EBE / CA * 100
  tauxEndettement: number // Dettes / Capitaux Propres * 100
  delaiClients: number    // (Créances / CA TTC) * 365
  delaiFournisseurs: number // (Dettes fournisseurs / Achats TTC) * 365
}

export interface BenchmarkData {
  margeBruteQ1?: number | null
  margeBruteMedian?: number | null
  margeBruteQ3?: number | null
  margeNetteQ1?: number | null
  margeNetteMedian?: number | null
  margeNetteQ3?: number | null
  tauxVAQ1?: number | null
  tauxVAMedian?: number | null
  tauxVAQ3?: number | null
  ebeCAQ1?: number | null
  ebeCAMedian?: number | null
  ebeCAQ3?: number | null
  tauxEndettementQ1?: number | null
  tauxEndettementMedian?: number | null
  tauxEndettementQ3?: number | null
  delaiClientsQ1?: number | null
  delaiClientsMedian?: number | null
  delaiClientsQ3?: number | null
  delaiFournisseursQ1?: number | null
  delaiFournisseursMedian?: number | null
  delaiFournisseursQ3?: number | null
}

export type PositionRatio = 'SUPERIEUR' | 'INFERIEUR' | 'ALIGNE'

export interface ComparaisonRatio {
  id: string
  nom: string
  nomCourt: string
  valeur: number
  mediane: number | null
  q1: number | null
  q3: number | null
  ecart: number | null      // en points de pourcentage
  ecartPourcent: number | null  // en % par rapport à la médiane
  position: PositionRatio
  quartile: 1 | 2 | 3 | 4
  message: string
  unite: string
  inversement?: boolean     // true si un ratio plus bas est meilleur (ex: endettement)
}

export interface ResultatBenchmark {
  comparaisons: ComparaisonRatio[]
  scoreGlobal: number       // Score de 0 à 100
  resume: string            // Message de synthèse
  radarData: RadarDataPoint[]
}

export interface RadarDataPoint {
  ratio: string
  entreprise: number
  secteur: number
  fullMark: number
}

// ========================
// CALCUL DES RATIOS
// ========================

export interface DonneesCalculRatios {
  ca: number
  achats: number
  resultatNet: number
  valeurAjoutee: number
  ebe: number
  capitauxPropres: number
  dettes: number
  creancesClients: number
  dettesFournisseurs: number
  tauxTVA?: number
}

/**
 * Calculer les ratios financiers d'une entreprise
 */
export function calculerRatiosEntreprise(donnees: DonneesCalculRatios): RatiosEntreprise {
  const tauxTVA = donnees.tauxTVA ?? 20

  // Marge brute = (CA - Achats) / CA * 100
  const margeBrute = donnees.ca > 0
    ? round2(((donnees.ca - donnees.achats) / donnees.ca) * 100)
    : 0

  // Marge nette = Résultat Net / CA * 100
  const margeNette = donnees.ca > 0
    ? round2((donnees.resultatNet / donnees.ca) * 100)
    : 0

  // Taux de valeur ajoutée = VA / CA * 100
  const tauxVA = donnees.ca > 0
    ? round2((donnees.valeurAjoutee / donnees.ca) * 100)
    : 0

  // EBE / CA * 100
  const ebeCA = donnees.ca > 0
    ? round2((donnees.ebe / donnees.ca) * 100)
    : 0

  // Taux d'endettement = Dettes / Capitaux Propres * 100
  const tauxEndettement = donnees.capitauxPropres > 0
    ? round2((donnees.dettes / donnees.capitauxPropres) * 100)
    : 0

  // Délai clients = (Créances TTC / CA TTC) * 365
  const caTTC = donnees.ca * (1 + tauxTVA / 100)
  const delaiClients = caTTC > 0
    ? round2((donnees.creancesClients / caTTC) * 365)
    : 0

  // Délai fournisseurs = (Dettes fournisseurs / Achats TTC) * 365
  const achatsTTC = donnees.achats * (1 + tauxTVA / 100)
  const delaiFournisseurs = achatsTTC > 0
    ? round2((donnees.dettesFournisseurs / achatsTTC) * 365)
    : 0

  return {
    margeBrute,
    margeNette,
    tauxVA,
    ebeCA,
    tauxEndettement,
    delaiClients,
    delaiFournisseurs,
  }
}

/**
 * Calculer les ratios à partir des données SIG et bilan
 */
export function calculerRatiosFromSIG(
  sig: ResultatSIG,
  achats: number,
  bilan: {
    capitauxPropres: number
    dettes: number
    creancesClients: number
    dettesFournisseurs: number
  }
): RatiosEntreprise {
  return calculerRatiosEntreprise({
    ca: sig.ca,
    achats,
    resultatNet: sig.resultatNet,
    valeurAjoutee: sig.valeurAjoutee,
    ebe: sig.ebe,
    capitauxPropres: bilan.capitauxPropres,
    dettes: bilan.dettes,
    creancesClients: bilan.creancesClients,
    dettesFournisseurs: bilan.dettesFournisseurs,
  })
}

// ========================
// COMPARAISON AU SECTEUR
// ========================

interface RatioConfig {
  id: string
  nom: string
  nomCourt: string
  unite: string
  ratioKey: keyof RatiosEntreprise
  q1Key: keyof BenchmarkData
  medianKey: keyof BenchmarkData
  q3Key: keyof BenchmarkData
  inversement?: boolean  // true si plus bas = mieux
}

const RATIOS_CONFIG: RatioConfig[] = [
  {
    id: 'margeBrute',
    nom: 'Marge brute',
    nomCourt: 'Marge brute',
    unite: '%',
    ratioKey: 'margeBrute',
    q1Key: 'margeBruteQ1',
    medianKey: 'margeBruteMedian',
    q3Key: 'margeBruteQ3',
  },
  {
    id: 'margeNette',
    nom: 'Marge nette',
    nomCourt: 'Marge nette',
    unite: '%',
    ratioKey: 'margeNette',
    q1Key: 'margeNetteQ1',
    medianKey: 'margeNetteMedian',
    q3Key: 'margeNetteQ3',
  },
  {
    id: 'tauxVA',
    nom: 'Taux de valeur ajoutée',
    nomCourt: 'Taux VA',
    unite: '%',
    ratioKey: 'tauxVA',
    q1Key: 'tauxVAQ1',
    medianKey: 'tauxVAMedian',
    q3Key: 'tauxVAQ3',
  },
  {
    id: 'ebeCA',
    nom: 'Ratio EBE / CA',
    nomCourt: 'EBE/CA',
    unite: '%',
    ratioKey: 'ebeCA',
    q1Key: 'ebeCAQ1',
    medianKey: 'ebeCAMedian',
    q3Key: 'ebeCAQ3',
  },
  {
    id: 'tauxEndettement',
    nom: 'Taux d\'endettement',
    nomCourt: 'Endettement',
    unite: '%',
    ratioKey: 'tauxEndettement',
    q1Key: 'tauxEndettementQ1',
    medianKey: 'tauxEndettementMedian',
    q3Key: 'tauxEndettementQ3',
    inversement: true,
  },
  {
    id: 'delaiClients',
    nom: 'Délai clients',
    nomCourt: 'Délai clients',
    unite: 'jours',
    ratioKey: 'delaiClients',
    q1Key: 'delaiClientsQ1',
    medianKey: 'delaiClientsMedian',
    q3Key: 'delaiClientsQ3',
    inversement: true,
  },
  {
    id: 'delaiFournisseurs',
    nom: 'Délai fournisseurs',
    nomCourt: 'Délai fourn.',
    unite: 'jours',
    ratioKey: 'delaiFournisseurs',
    q1Key: 'delaiFournisseursQ1',
    medianKey: 'delaiFournisseursMedian',
    q3Key: 'delaiFournisseursQ3',
  },
]

/**
 * Déterminer le quartile d'une valeur
 */
function determinerQuartile(
  valeur: number,
  q1: number | null,
  median: number | null,
  q3: number | null
): 1 | 2 | 3 | 4 {
  if (q1 === null || median === null || q3 === null) return 2

  if (valeur <= q1) return 1
  if (valeur <= median) return 2
  if (valeur <= q3) return 3
  return 4
}

/**
 * Déterminer la position relative
 */
function determinerPosition(
  valeur: number,
  median: number | null,
  inversement: boolean = false
): PositionRatio {
  if (median === null) return 'ALIGNE'

  const seuilAligne = median * 0.05 // +/- 5%

  if (Math.abs(valeur - median) <= seuilAligne) {
    return 'ALIGNE'
  }

  if (inversement) {
    return valeur < median ? 'SUPERIEUR' : 'INFERIEUR'
  }

  return valeur > median ? 'SUPERIEUR' : 'INFERIEUR'
}

/**
 * Générer un message de comparaison
 */
export function genererMessage(
  nom: string,
  valeur: number,
  median: number | null,
  position: PositionRatio,
  unite: string,
  inversement: boolean = false
): string {
  if (median === null) {
    return `${nom} : données sectorielles non disponibles`
  }

  const ecartAbs = Math.abs(valeur - median)
  const ecartPct = median !== 0 ? Math.abs((valeur - median) / median * 100) : 0

  if (position === 'ALIGNE') {
    return `Votre ${nom.toLowerCase()} est alignée sur la médiane du secteur (${round2(median)}${unite})`
  }

  const direction = position === 'SUPERIEUR'
    ? (inversement ? 'inférieur' : 'supérieur')
    : (inversement ? 'supérieur' : 'inférieur')

  const qualite = position === 'SUPERIEUR' ? 'favorable' : 'à surveiller'

  if (unite === '%') {
    return `Votre ${nom.toLowerCase()} est ${round2(ecartAbs)} points ${direction}e à la médiane sectorielle (${qualite})`
  } else {
    return `Votre ${nom.toLowerCase()} est ${round2(ecartPct)}% ${direction} à la médiane sectorielle (${qualite})`
  }
}

/**
 * Comparer les ratios de l'entreprise au secteur
 */
export function comparerAuSecteur(
  ratios: RatiosEntreprise,
  benchmark: BenchmarkData
): ComparaisonRatio[] {
  return RATIOS_CONFIG.map(config => {
    const valeur = ratios[config.ratioKey]
    const q1 = benchmark[config.q1Key] as number | null
    const median = benchmark[config.medianKey] as number | null
    const q3 = benchmark[config.q3Key] as number | null

    const ecart = median !== null ? round2(valeur - median) : null
    const ecartPourcent = median !== null && median !== 0
      ? round2((valeur - median) / median * 100)
      : null

    const quartile = determinerQuartile(valeur, q1, median, q3)
    const position = determinerPosition(valeur, median, config.inversement)
    const message = genererMessage(
      config.nom,
      valeur,
      median,
      position,
      config.unite,
      config.inversement
    )

    return {
      id: config.id,
      nom: config.nom,
      nomCourt: config.nomCourt,
      valeur,
      mediane: median,
      q1,
      q3,
      ecart,
      ecartPourcent,
      position,
      quartile,
      message,
      unite: config.unite,
      inversement: config.inversement,
    }
  })
}

// ========================
// SCORE GLOBAL
// ========================

/**
 * Calculer un score global de positionnement (0-100)
 */
export function calculerScoreGlobal(comparaisons: ComparaisonRatio[]): number {
  const comparaisonsValides = comparaisons.filter(c => c.mediane !== null)
  if (comparaisonsValides.length === 0) return 50

  // Score basé sur le quartile (pondéré)
  const poids: Record<string, number> = {
    margeBrute: 1.5,
    margeNette: 2,
    tauxVA: 1,
    ebeCA: 1.5,
    tauxEndettement: 1.5,
    delaiClients: 1,
    delaiFournisseurs: 0.5,
  }

  let scoreTotal = 0
  let poidsTotal = 0

  for (const comp of comparaisonsValides) {
    const p = poids[comp.id] ?? 1
    poidsTotal += p

    // Transformer le quartile en score
    // Pour les ratios inversés, Q1 = bien, Q4 = mal
    // Pour les ratios normaux, Q4 = bien, Q1 = mal
    let scoreQuartile: number
    if (comp.inversement) {
      scoreQuartile = (5 - comp.quartile) / 4 * 100 // Q1=100, Q4=25
    } else {
      scoreQuartile = comp.quartile / 4 * 100 // Q1=25, Q4=100
    }

    // Bonus/malus pour être vraiment bon/mauvais
    if (comp.position === 'SUPERIEUR') {
      scoreQuartile = Math.min(100, scoreQuartile * 1.1)
    } else if (comp.position === 'INFERIEUR') {
      scoreQuartile = Math.max(0, scoreQuartile * 0.9)
    }

    scoreTotal += scoreQuartile * p
  }

  return round2(scoreTotal / poidsTotal)
}

/**
 * Générer un message de synthèse
 */
export function genererResume(score: number, comparaisons: ComparaisonRatio[]): string {
  const pointsForts = comparaisons.filter(c => c.position === 'SUPERIEUR')
  const pointsFaibles = comparaisons.filter(c => c.position === 'INFERIEUR')

  if (score >= 75) {
    const msg = 'Excellente performance par rapport au secteur.'
    if (pointsForts.length > 0) {
      return `${msg} Points forts : ${pointsForts.map(p => p.nomCourt).join(', ')}.`
    }
    return msg
  }

  if (score >= 50) {
    let msg = 'Performance dans la moyenne du secteur.'
    if (pointsForts.length > 0) {
      msg += ` Points forts : ${pointsForts.map(p => p.nomCourt).join(', ')}.`
    }
    if (pointsFaibles.length > 0) {
      msg += ` Axes d'amélioration : ${pointsFaibles.map(p => p.nomCourt).join(', ')}.`
    }
    return msg
  }

  const msg = 'Performance en-dessous de la moyenne sectorielle.'
  if (pointsFaibles.length > 0) {
    return `${msg} Priorités : ${pointsFaibles.map(p => p.nomCourt).join(', ')}.`
  }
  return msg
}

// ========================
// DONNÉES RADAR
// ========================

/**
 * Préparer les données pour le graphique radar
 */
export function preparerDonneesRadar(comparaisons: ComparaisonRatio[]): RadarDataPoint[] {
  // Sélectionner les ratios clés pour le radar (5-6 max)
  const ratiosRadar = ['margeBrute', 'margeNette', 'tauxVA', 'ebeCA', 'tauxEndettement']

  return comparaisons
    .filter(c => ratiosRadar.includes(c.id) && c.mediane !== null)
    .map(c => {
      // Normaliser les valeurs pour le radar (0-100)
      // Pour l'endettement (inversé), plus c'est bas mieux c'est
      const valeurNorm = c.valeur
      const medianeNorm = c.mediane!

      // Normalisation pour avoir des échelles comparables
      const maxVal = Math.max(valeurNorm, medianeNorm, c.q3 ?? medianeNorm)
      const scale = maxVal > 0 ? 100 / maxVal : 1

      return {
        ratio: c.nomCourt,
        entreprise: round2(valeurNorm * scale),
        secteur: round2(medianeNorm * scale),
        fullMark: 100,
      }
    })
}

// ========================
// FONCTION PRINCIPALE
// ========================

/**
 * Analyser les benchmarks complets
 */
export function analyserBenchmarks(
  ratios: RatiosEntreprise,
  benchmark: BenchmarkData
): ResultatBenchmark {
  const comparaisons = comparerAuSecteur(ratios, benchmark)
  const scoreGlobal = calculerScoreGlobal(comparaisons)
  const resume = genererResume(scoreGlobal, comparaisons)
  const radarData = preparerDonneesRadar(comparaisons)

  return {
    comparaisons,
    scoreGlobal,
    resume,
    radarData,
  }
}
