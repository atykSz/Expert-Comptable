'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// Context pour la gestion d'état du Dropdown
// =============================================================================

interface DropdownContextValue {
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(undefined)

function useDropdownContext() {
    const context = React.useContext(DropdownContext)
    if (!context) {
        throw new Error('Dropdown components must be used within a Dropdown provider')
    }
    return context
}

// =============================================================================
// Dropdown - Conteneur principal
// =============================================================================

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
    ({ className, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
        const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
        const triggerRef = React.useRef<HTMLButtonElement>(null)

        const isControlled = controlledOpen !== undefined
        const isOpen = isControlled ? controlledOpen : uncontrolledOpen

        const setIsOpen = React.useCallback(
            (value: React.SetStateAction<boolean>) => {
                const newValue = typeof value === 'function' ? value(isOpen) : value
                if (!isControlled) {
                    setUncontrolledOpen(newValue)
                }
                onOpenChange?.(newValue)
            },
            [isControlled, isOpen, onOpenChange]
        )

        // Fermer au clic extérieur
        React.useEffect(() => {
            if (!isOpen) return

            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Node
                if (triggerRef.current && !triggerRef.current.contains(target)) {
                    // Vérifier si le clic est dans le menu
                    const menu = document.querySelector('[data-dropdown-menu]')
                    if (menu && !menu.contains(target)) {
                        setIsOpen(false)
                    }
                }
            }

            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    setIsOpen(false)
                    triggerRef.current?.focus()
                }
            }

            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
                document.removeEventListener('keydown', handleEscape)
            }
        }, [isOpen, setIsOpen])

        return (
            <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
                <div
                    ref={ref}
                    className={cn('relative inline-block', className)}
                    {...props}
                >
                    {children}
                </div>
            </DropdownContext.Provider>
        )
    }
)
Dropdown.displayName = 'Dropdown'

// =============================================================================
// DropdownTrigger - Bouton déclencheur
// =============================================================================

const DropdownTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen, triggerRef } = useDropdownContext()

    // Combiner les refs
    const combinedRef = React.useCallback(
        (node: HTMLButtonElement | null) => {
            (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
            if (typeof ref === 'function') {
                ref(node)
            } else if (ref) {
                (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
            }
        },
        [ref, triggerRef]
    )

    return (
        <button
            ref={combinedRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(className)}
            {...props}
        >
            {children}
        </button>
    )
})
DropdownTrigger.displayName = 'DropdownTrigger'

// =============================================================================
// DropdownMenu - Conteneur du menu
// =============================================================================

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: 'start' | 'end' | 'center'
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
    ({ className, align = 'start', children, ...props }, ref) => {
        const { isOpen } = useDropdownContext()

        if (!isOpen) return null

        const alignments = {
            start: 'left-0',
            end: 'right-0',
            center: 'left-1/2 -translate-x-1/2',
        }

        return (
            <div
                ref={ref}
                role="menu"
                data-dropdown-menu
                className={cn(
                    'absolute z-50 mt-2 min-w-[180px] py-1',
                    'bg-card border border-border rounded-xl shadow-lg shadow-foreground/5',
                    'animate-in fade-in-0 zoom-in-95',
                    alignments[align],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
DropdownMenu.displayName = 'DropdownMenu'

// =============================================================================
// DropdownItem - Élément du menu
// =============================================================================

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    destructive?: boolean
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
    ({ className, destructive, children, onClick, ...props }, ref) => {
        const { setIsOpen } = useDropdownContext()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            setIsOpen(false)
        }

        return (
            <button
                ref={ref}
                type="button"
                role="menuitem"
                onClick={handleClick}
                className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                    'transition-colors hover:bg-muted focus:bg-muted focus:outline-none',
                    destructive && 'text-danger hover:bg-red-50',
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)
DropdownItem.displayName = 'DropdownItem'

// =============================================================================
// DropdownSeparator - Séparateur
// =============================================================================

const DropdownSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('my-1 h-px bg-border', className)}
        {...props}
    />
))
DropdownSeparator.displayName = 'DropdownSeparator'

// =============================================================================
// DropdownLabel - Label de section
// =============================================================================

const DropdownLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('px-3 py-1.5 text-xs font-semibold text-muted-foreground', className)}
        {...props}
    />
))
DropdownLabel.displayName = 'DropdownLabel'

export {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSeparator,
    DropdownLabel,
}
