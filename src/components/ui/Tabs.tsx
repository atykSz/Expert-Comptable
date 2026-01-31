'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// Context pour la gestion d'état des Tabs
// =============================================================================

interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabsContext() {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider')
    }
    return context
}

// =============================================================================
// Tabs - Conteneur principal
// =============================================================================

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ className, defaultValue, value: controlledValue, onValueChange, children, ...props }, ref) => {
        const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '')

        const isControlled = controlledValue !== undefined
        const value = isControlled ? controlledValue : uncontrolledValue

        const handleValueChange = React.useCallback(
            (newValue: string) => {
                if (!isControlled) {
                    setUncontrolledValue(newValue)
                }
                onValueChange?.(newValue)
            },
            [isControlled, onValueChange]
        )

        return (
            <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
                <div
                    ref={ref}
                    className={cn('w-full', className)}
                    {...props}
                >
                    {children}
                </div>
            </TabsContext.Provider>
        )
    }
)
Tabs.displayName = 'Tabs'

// =============================================================================
// TabsList - Conteneur des triggers
// =============================================================================

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'pills' | 'underline'
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-muted p-1 rounded-xl',
            pills: 'gap-2',
            underline: 'border-b border-border gap-4',
        }

        return (
            <div
                ref={ref}
                role="tablist"
                className={cn(
                    'inline-flex items-center',
                    variants[variant],
                    className
                )}
                {...props}
            />
        )
    }
)
TabsList.displayName = 'TabsList'

// =============================================================================
// TabsTrigger - Bouton onglet
// =============================================================================

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
    variant?: 'default' | 'pills' | 'underline'
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, variant = 'default', children, ...props }, ref) => {
        const { value: selectedValue, onValueChange } = useTabsContext()
        const isSelected = selectedValue === value

        const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

        const variants = {
            default: cn(
                'px-4 py-2 rounded-lg',
                isSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
            ),
            pills: cn(
                'px-4 py-2 rounded-full',
                isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted'
            ),
            underline: cn(
                'pb-3 border-b-2 -mb-px',
                isSelected
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            ),
        }

        return (
            <button
                ref={ref}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onValueChange(value)}
                className={cn(baseStyles, variants[variant], className)}
                {...props}
            >
                {children}
            </button>
        )
    }
)
TabsTrigger.displayName = 'TabsTrigger'

// =============================================================================
// TabsContent - Contenu de l'onglet
// =============================================================================

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const { value: selectedValue } = useTabsContext()

        if (selectedValue !== value) {
            return null
        }

        return (
            <div
                ref={ref}
                role="tabpanel"
                tabIndex={0}
                className={cn(
                    'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
