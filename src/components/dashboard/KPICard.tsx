'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

// Mini sparkline component
function Sparkline({ data, color = '#3B82F6' }: { data: number[]; color?: string }) {
    if (!data || data.length < 2) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const width = 80
    const height = 24
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width={width} height={height} className="inline-block">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    )
}

// Trend indicator
function TrendIndicator({ current, previous }: { current: number; previous: number }) {
    if (previous === 0) return null

    const change = ((current - previous) / Math.abs(previous)) * 100
    const isPositive = change > 0
    const isNeutral = Math.abs(change) < 1

    if (isNeutral) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Minus className="h-3 w-3" />
                Stable
            </span>
        )
    }

    return (
        <span className={`inline-flex items-center gap-1 text-xs ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{change.toFixed(0)}%
        </span>
    )
}

interface KPICardProps {
    label: string
    value: number
    previousValue?: number
    sparklineData?: number[]
    formatFn?: (n: number) => string
    icon?: ReactNode
    color?: 'default' | 'success' | 'warning' | 'danger' | 'accent'
    subtitle?: string
}

const colorClasses = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    accent: 'text-accent'
}

const sparklineColors = {
    default: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    accent: '#3B82F6'
}

export function KPICard({
    label,
    value,
    previousValue,
    sparklineData,
    formatFn = formatCurrency,
    icon,
    color = 'default',
    subtitle
}: KPICardProps) {
    const displayValue = value >= 0 ? formatFn(value) : formatFn(value)
    const valueColor = value < 0 ? 'text-danger' : colorClasses[color]

    return (
        <Card variant="bordered" className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                        {icon}
                        {label}
                    </div>
                    <div className={`text-2xl font-semibold tracking-tight ${valueColor}`}>
                        {displayValue}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        {previousValue !== undefined && (
                            <TrendIndicator current={value} previous={previousValue} />
                        )}
                        {subtitle && (
                            <span className="text-xs text-muted-foreground">{subtitle}</span>
                        )}
                    </div>
                </div>
                {sparklineData && sparklineData.length > 1 && (
                    <div className="ml-4">
                        <Sparkline data={sparklineData} color={sparklineColors[color]} />
                    </div>
                )}
            </div>
        </Card>
    )
}
