import { Previsionnel } from '@/types'

export type AlertParams = {
    bfr: number
    ca: number
    tresorerieMin: number
    margeCommerciale: number // Pour la marge brute simplifiée
    chargesFixes: number
    totalCharges: number
    endettement: number
    capitauxPropres: number
}

export type FinancialAlert = {
    id: string
    type: 'info' | 'warning' | 'danger'
    title: string
    message: string
    suggestion: string
}

export function generateFinancialAlerts(data: AlertParams): FinancialAlert[] {
    const alerts: FinancialAlert[] = []

    // 1. Alerte BFR > 30% du CA
    // Attention: CA peut être 0 au démarrage
    if (data.ca > 0) {
        const ratioBFR = (data.bfr / data.ca) * 100
        if (ratioBFR > 30) {
            alerts.push({
                id: 'bfr-high',
                type: 'warning',
                title: 'BFR Élevé',
                message: `Votre Besoin en Fonds de Roulement représente ${ratioBFR.toFixed(1)}% du CA.`,
                suggestion: "Négociez des délais de paiement plus longs avec vos fournisseurs ou réduisez vos stocks."
            })
        }
    }

    // 2. Marge Brute < 20%
    if (data.ca > 0) {
        const margeBrutePct = (data.margeCommerciale / data.ca) * 100
        if (margeBrutePct < 20) {
            alerts.push({
                id: 'marge-low',
                type: 'danger',
                title: 'Marge faible',
                message: `Votre marge brute est de seulement ${margeBrutePct.toFixed(1)}%.`,
                suggestion: "Vérifiez vos prix de vente ou vos coûts d'achat. Une marge si faible laisse peu de place pour couvrir les frais fixes."
            })
        }
    }

    // 3. Charges Fixes > 70% du CA
    if (data.ca > 0) {
        const ratioChargesFixes = (data.chargesFixes / data.ca) * 100
        if (ratioChargesFixes > 70) {
            alerts.push({
                id: 'fixed-costs-high',
                type: 'warning',
                title: 'Charges Fixes Lourdes',
                message: `Les charges fixes absorbent ${ratioChargesFixes.toFixed(1)}% de votre CA.`,
                suggestion: "Votre point mort sera difficile à atteindre. Essayez de variabiliser certaines charges."
            })
        }
    }

    // 4. Trésorerie Négative
    if (data.tresorerieMin < 0) {
        alerts.push({
            id: 'cash-negative',
            type: 'danger',
            title: 'Trésorerie Critique',
            message: "Un solde de trésorerie négatif est détecté.",
            suggestion: "Prévoyez un apport en compte courant, une ligne de découvert ou augmentez votre capital."
        })
    }

    // 5. Ratio d'endettement > 200%
    if (data.capitauxPropres > 0) {
        const ratioDettes = (data.endettement / data.capitauxPropres) * 100
        if (ratioDettes > 200) {
            alerts.push({
                id: 'debt-high',
                type: 'warning',
                title: 'Endettement important',
                message: `Vos dettes représentent ${(ratioDettes).toFixed(0)}% de vos fonds propres.`,
                suggestion: "Les banques demandent souvent un ratio inférieur à 1:1 ou 2:1. Renforcez vos fonds propres."
            })
        }
    } else if (data.endettement > 0) {
        alerts.push({
            id: 'equity-negative',
            type: 'danger',
            title: 'Fonds propres négatifs ou nuls',
            message: "Impossible de lever de la dette sans fonds propres.",
            suggestion: "Apportez du capital social."
        })
    }

    return alerts
}
