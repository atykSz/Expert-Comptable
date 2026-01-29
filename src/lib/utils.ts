import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilitaire pour fusionner les classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formater un montant en euros
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount)
}

/**
 * Formater un pourcentage
 */
export function formatPercent(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
    }).format(value / 100)
}

/**
 * Formater une date en français
 */
export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

/**
 * Formater une date avec le mois en lettres
 */
export function formatDateLong(date: Date | string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date))
}

/**
 * Générer les mois d'un prévisionnel
 */
export function generateMonths(startDate: Date, count: number): string[] {
    const months: string[] = []
    const date = new Date(startDate)

    for (let i = 0; i < count; i++) {
        months.push(
            new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(date)
        )
        date.setMonth(date.getMonth() + 1)
    }

    return months
}

/**
 * Arrondir à 2 décimales
 */
export function round2(value: number): number {
    return Math.round(value * 100) / 100
}
