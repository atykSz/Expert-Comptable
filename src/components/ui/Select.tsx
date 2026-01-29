import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    hint?: string
    options: Array<{ value: string; label: string }>
    placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
        const selectId = id || React.useId()

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium mb-2"
                    >
                        {label}
                    </label>
                )}
                <select
                    id={selectId}
                    className={cn(
                        'block w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                        'disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed',
                        'transition-all duration-200',
                        error && 'border-danger focus:ring-danger',
                        className
                    )}
                    ref={ref}
                    aria-invalid={error ? 'true' : 'false'}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-2 text-sm text-danger">{error}</p>
                )}
                {hint && !error && (
                    <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'

export { Select }
