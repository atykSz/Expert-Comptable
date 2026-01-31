'use client'

interface ProgressGaugeProps {
    value: number
    max?: number
    label: string
    showPercentage?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'success' | 'warning' | 'danger' | 'auto'
    thresholds?: { warning: number; danger: number }
}

export function ProgressGauge({
    value,
    max = 100,
    label,
    showPercentage = true,
    size = 'md',
    variant = 'auto',
    thresholds = { warning: 50, danger: 75 }
}: ProgressGaugeProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    // Determine color based on variant or thresholds
    let colorClass = 'bg-success'
    if (variant === 'auto') {
        if (percentage >= thresholds.danger) {
            colorClass = 'bg-danger'
        } else if (percentage >= thresholds.warning) {
            colorClass = 'bg-warning'
        }
    } else {
        colorClass = `bg-${variant}`
    }

    const sizes = {
        sm: { height: 'h-2', text: 'text-xs' },
        md: { height: 'h-3', text: 'text-sm' },
        lg: { height: 'h-4', text: 'text-base' }
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className={`${sizes[size].text} text-muted-foreground`}>{label}</span>
                {showPercentage && (
                    <span className={`${sizes[size].text} font-semibold`}>
                        {percentage.toFixed(0)}%
                    </span>
                )}
            </div>
            <div className={`w-full bg-secondary rounded-full ${sizes[size].height} overflow-hidden`}>
                <div
                    className={`${colorClass} ${sizes[size].height} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

interface CircularGaugeProps {
    value: number
    max?: number
    label: string
    size?: number
    strokeWidth?: number
    variant?: 'success' | 'warning' | 'danger' | 'auto'
    thresholds?: { warning: number; danger: number }
    formatValue?: (v: number) => string
}

export function CircularGauge({
    value,
    max = 100,
    label,
    size = 100,
    strokeWidth = 8,
    variant = 'auto',
    thresholds = { warning: 50, danger: 75 },
    formatValue = (v) => `${v.toFixed(0)}%`
}: CircularGaugeProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    // Determine color based on variant or thresholds
    let strokeColor = '#10B981' // success
    if (variant === 'auto') {
        if (percentage >= thresholds.danger) {
            strokeColor = '#EF4444' // danger
        } else if (percentage >= thresholds.warning) {
            strokeColor = '#F59E0B' // warning
        }
    } else if (variant === 'warning') {
        strokeColor = '#F59E0B'
    } else if (variant === 'danger') {
        strokeColor = '#EF4444'
    }

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-secondary"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-700 ease-out"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold">{formatValue(value)}</span>
                </div>
            </div>
            <span className="text-sm text-muted-foreground mt-2">{label}</span>
        </div>
    )
}
