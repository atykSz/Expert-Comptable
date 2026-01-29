import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'elevated'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-card rounded-2xl',
            bordered: 'bg-card rounded-2xl border border-border',
            elevated: 'bg-card rounded-2xl shadow-lg shadow-foreground/5',
        }

        return (
            <div
                ref={ref}
                className={cn(variants[variant], className)}
                {...props}
            />
        )
    }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('px-6 py-5 border-b border-border', className)}
        {...props}
    />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn('text-lg font-semibold tracking-tight', className)}
        {...props}
    />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-muted-foreground mt-1', className)}
        {...props}
    />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('px-6 py-5', className)}
        {...props}
    />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('px-6 py-4 border-t border-border bg-secondary/50 rounded-b-2xl', className)}
        {...props}
    />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
