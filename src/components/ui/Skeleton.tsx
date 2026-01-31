import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'text', width, height, style, ...props }, ref) => {
        const variants = {
            text: 'h-4 rounded',
            circular: 'rounded-full',
            rectangular: 'rounded-lg',
        }

        const defaultSizes = {
            text: { width: '100%', height: '1rem' },
            circular: { width: '2.5rem', height: '2.5rem' },
            rectangular: { width: '100%', height: '6rem' },
        }

        const computedStyle = {
            width: width ?? defaultSizes[variant].width,
            height: height ?? defaultSizes[variant].height,
            ...style,
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'animate-pulse bg-muted',
                    variants[variant],
                    className
                )}
                style={computedStyle}
                {...props}
            />
        )
    }
)
Skeleton.displayName = 'Skeleton'

// =============================================================================
// SkeletonText - Bloc de texte skeleton
// =============================================================================

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
    lines?: number
    spacing?: 'sm' | 'md' | 'lg'
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
    ({ className, lines = 3, spacing = 'md', ...props }, ref) => {
        const spacings = {
            sm: 'gap-1',
            md: 'gap-2',
            lg: 'gap-3',
        }

        return (
            <div
                ref={ref}
                className={cn('flex flex-col', spacings[spacing], className)}
                {...props}
            >
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton
                        key={i}
                        variant="text"
                        style={{
                            width: i === lines - 1 ? '60%' : '100%',
                        }}
                    />
                ))}
            </div>
        )
    }
)
SkeletonText.displayName = 'SkeletonText'

// =============================================================================
// SkeletonCard - Skeleton pour une Card
// =============================================================================

const SkeletonCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'bg-card rounded-2xl border border-border p-6 space-y-4',
            className
        )}
        {...props}
    >
        <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="30%" />
            </div>
        </div>
        <SkeletonText lines={3} />
    </div>
))
SkeletonCard.displayName = 'SkeletonCard'

export { Skeleton, SkeletonText, SkeletonCard }
