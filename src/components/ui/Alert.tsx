import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'info' | 'success' | 'warning' | 'error'
    dismissible?: boolean
    onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'info', dismissible, onDismiss, children, ...props }, ref) => {
        const variants = {
            info: {
                container: 'bg-blue-50 border-blue-200 text-blue-800',
                icon: <Info className="h-5 w-5 text-blue-500" />,
            },
            success: {
                container: 'bg-green-50 border-green-200 text-green-800',
                icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            },
            warning: {
                container: 'bg-amber-50 border-amber-200 text-amber-800',
                icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
            },
            error: {
                container: 'bg-red-50 border-red-200 text-red-800',
                icon: <AlertCircle className="h-5 w-5 text-red-500" />,
            },
        }

        const config = variants[variant]

        return (
            <div
                ref={ref}
                role="alert"
                className={cn(
                    'relative flex gap-3 rounded-xl border p-4',
                    config.container,
                    className
                )}
                {...props}
            >
                <div className="shrink-0">{config.icon}</div>
                <div className="flex-1 text-sm">{children}</div>
                {dismissible && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                        aria-label="Fermer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        )
    }
)
Alert.displayName = 'Alert'

// =============================================================================
// AlertTitle
// =============================================================================

const AlertTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn('font-semibold leading-none tracking-tight mb-1', className)}
        {...props}
    />
))
AlertTitle.displayName = 'AlertTitle'

// =============================================================================
// AlertDescription
// =============================================================================

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm opacity-90', className)}
        {...props}
    />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
