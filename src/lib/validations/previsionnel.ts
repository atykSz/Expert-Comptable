/**
 * Schémas de validation Zod pour les API prévisionnels
 * 
 * Ces schémas garantissent la validité des données entrantes
 * avant traitement par la base de données.
 */

import { z } from 'zod'

// ============================================================================
// Enums correspondant au schéma Prisma
// ============================================================================

export const CategorieCAEnum = z.enum([
    'VENTE_MARCHANDISES',
    'PRODUCTION_VENDUE_BIENS',
    'PRODUCTION_VENDUE_SERVICES',
    'PRESTATIONS_SERVICES',
    'SUBVENTIONS',
    'AUTRES_PRODUITS',
])

export const CategorieChargeEnum = z.enum([
    'ACHATS_MARCHANDISES',
    'ACHATS_MATIERES_PREMIERES',
    'ACHATS_FOURNITURES',
    'SOUS_TRAITANCE',
    'LOCATIONS',
    'ENTRETIEN_REPARATIONS',
    'ASSURANCES',
    'DOCUMENTATION',
    'HONORAIRES',
    'PUBLICITE',
    'TRANSPORTS',
    'DEPLACEMENTS',
    'FRAIS_POSTAUX_TELECOM',
    'SERVICES_BANCAIRES',
    'AUTRES_SERVICES',
    'IMPOTS_TAXES',
    'CFE',
    'CVAE',
    'INTERETS_EMPRUNTS',
    'CHARGES_EXCEPTIONNELLES',
])

export const TypeChargeEnum = z.enum(['FIXE', 'VARIABLE'])

export const RecurrenceEnum = z.enum([
    'MENSUEL',
    'TRIMESTRIEL',
    'ANNUEL',
    'PONCTUEL',
])

export const StatutPrevisionnelEnum = z.enum([
    'BROUILLON',
    'EN_COURS',
    'VALIDE',
    'ARCHIVE',
])

// ============================================================================
// Schémas de validation pour les lignes
// ============================================================================

/**
 * Validation d'une ligne de Chiffre d'Affaires
 */
export const LigneCASchema = z.object({
    libelle: z.string().min(1, 'Le libellé est requis').max(255),
    categorie: CategorieCAEnum,
    comptePCG: z.string().regex(/^[0-9]{6}$/, 'Le compte PCG doit contenir 6 chiffres').optional(),
    montantsMensuels: z.array(z.number().min(0)).min(12).max(36),
    evolutionAn2: z.number().min(-100).max(500).default(0),
    evolutionAn3: z.number().min(-100).max(500).default(0),
    tauxTVA: z.number().min(0).max(100).default(20),
})

/**
 * Validation d'une ligne de Charge
 */
export const LigneChargeSchema = z.object({
    libelle: z.string().min(1, 'Le libellé est requis').max(255),
    categorie: CategorieChargeEnum,
    comptePCG: z.string().regex(/^[0-9]{6}$/, 'Le compte PCG doit contenir 6 chiffres'),
    typeCharge: TypeChargeEnum.default('FIXE'),
    montantsMensuels: z.array(z.number().min(0)).min(12).max(36),
    evolutionAn2: z.number().min(-100).max(500).default(0),
    evolutionAn3: z.number().min(-100).max(500).default(0),
    tauxTVA: z.number().min(0).max(100).nullable().optional(),
    deductibleTVA: z.boolean().default(true),
    recurrence: RecurrenceEnum.default('MENSUEL'),
})

/**
 * Validation des hypothèses financières
 */
export const HypothesesSchema = z.object({
    tauxTVAVentes: z.number().min(0).max(100).optional(),
    tauxTVAAchats: z.number().min(0).max(100).optional(),
    delaiPaiementClients: z.number().int().min(0).max(365).optional(),
    delaiPaiementFournisseurs: z.number().int().min(0).max(365).optional(),
    dureeStockJours: z.number().int().min(0).max(365).optional(),
    tauxIS: z.number().min(0).max(100).optional(),
    tauxChargesPatronales: z.number().min(0).max(100).optional(),
    tauxChargesSalariales: z.number().min(0).max(100).optional(),
})

/**
 * Validation d'un investissement
 */
export const InvestissementSchema = z.object({
    libelle: z.string().min(1).max(255),
    categorie: z.string().max(50),
    comptePCG: z.string().regex(/^[0-9]{6}$/),
    montantHT: z.number().positive('Le montant doit être positif'),
    tauxTVA: z.number().min(0).max(100).default(20),
    dateAcquisition: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    dureeAmortissement: z.number().int().min(0).max(50),
    modeAmortissement: z.enum(['LINEAIRE', 'DEGRESSIF', 'NON_AMORTISSABLE']).default('LINEAIRE'),
    valeurResiduelle: z.number().min(0).default(0),
})

/**
 * Validation d'un financement
 */
export const FinancementSchema = z.object({
    libelle: z.string().min(1).max(255),
    type: z.enum(['CAPITAL_SOCIAL', 'COMPTE_COURANT_ASSOCIE', 'EMPRUNT_BANCAIRE', 'SUBVENTION', 'LEASING']),
    montant: z.number().positive(),
    dateDebut: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    duree: z.number().int().min(0).optional(),
    tauxInteret: z.number().min(0).max(100).optional(),
    differe: z.number().int().min(0).optional(),
    echeancier: z.any().optional(),
})

/**
 * Validation d'un effectif
 */
export const EffectifSchema = z.object({
    poste: z.string().min(1).max(255),
    typeContrat: z.enum(['CDI', 'CDD', 'APPRENTI', 'STAGE', 'INTERIM']),
    salaireBrutMensuel: z.number().positive(),
    primes: z.number().min(0).default(0),
    dateEmbauche: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    dateFin: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    tauxChargesPatronales: z.number().min(0).max(100).default(45),
})

// ============================================================================
// Schémas pour les routes API
// ============================================================================

/**
 * Schéma pour PUT /api/previsionnels/[id]
 * Mise à jour d'un prévisionnel existant
 */
export const PrevisionnelUpdateSchema = z.object({
    titre: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    statut: StatutPrevisionnelEnum.optional(),
    hypotheses: HypothesesSchema.optional(),
    lignesCA: z.array(LigneCASchema).optional(),
    lignesCharge: z.array(LigneChargeSchema).optional(),
    investissements: z.array(InvestissementSchema).optional(),
    financements: z.array(FinancementSchema).optional(),
    effectifs: z.array(EffectifSchema).optional(),
})

/**
 * Schéma pour POST /api/previsionnels
 * Création d'un nouveau prévisionnel
 */
export const PrevisionnelCreateSchema = z.object({
    clientId: z.string().uuid('ID client invalide'),
    titre: z.string().min(1, 'Le titre est requis').max(255),
    description: z.string().max(1000).nullable().optional(),
    dateDebut: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    nombreMois: z.number().int().min(12).max(60).default(36),
})

// ============================================================================
// Types inférés des schémas
// ============================================================================

export type LigneCAInput = z.infer<typeof LigneCASchema>
export type LigneChargeInput = z.infer<typeof LigneChargeSchema>
export type HypothesesInput = z.infer<typeof HypothesesSchema>
export type InvestissementInput = z.infer<typeof InvestissementSchema>
export type FinancementInput = z.infer<typeof FinancementSchema>
export type EffectifInput = z.infer<typeof EffectifSchema>
export type PrevisionnelUpdateInput = z.infer<typeof PrevisionnelUpdateSchema>
export type PrevisionnelCreateInput = z.infer<typeof PrevisionnelCreateSchema>

// ============================================================================
// Utilitaire de validation avec formatage d'erreurs
// ============================================================================

export function validateWithErrors<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: true, data: T
} | {
    success: false, errors: { path: string, message: string }[]
} {
    const result = schema.safeParse(data)

    if (result.success) {
        return { success: true, data: result.data }
    }

    const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
    }))

    return { success: false, errors }
}
