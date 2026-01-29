import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = 'text', label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id || React.useId()

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium mb-2"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        id={inputId}
                        className={cn(
                            'block w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                            'disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed',
                            'transition-all duration-200',
                            leftIcon && 'pl-11',
                            rightIcon && 'pr-11',
                            error && 'border-danger focus:ring-danger',
                            className
                        )}
                        ref={ref}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="mt-2 text-sm text-danger">
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={`${inputId}-hint`} className="mt-2 text-sm text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
