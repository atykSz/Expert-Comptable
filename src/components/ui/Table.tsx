import * as React from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// Table - Conteneur principal
// =============================================================================

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
    variant?: 'default' | 'striped' | 'bordered'
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: '',
            striped: '[&_tbody_tr:nth-child(even)]:bg-muted/50',
            bordered: 'border border-border',
        }

        return (
            <div className="w-full overflow-x-auto rounded-xl">
                <table
                    ref={ref}
                    className={cn(
                        'w-full caption-bottom text-sm',
                        variants[variant],
                        className
                    )}
                    {...props}
                />
            </div>
        )
    }
)
Table.displayName = 'Table'

// =============================================================================
// TableHeader
// =============================================================================

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead
        ref={ref}
        className={cn('bg-muted/50 [&_tr]:border-b', className)}
        {...props}
    />
))
TableHeader.displayName = 'TableHeader'

// =============================================================================
// TableBody
// =============================================================================

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
    />
))
TableBody.displayName = 'TableBody'

// =============================================================================
// TableRow
// =============================================================================

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            'border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
            className
        )}
        {...props}
    />
))
TableRow.displayName = 'TableRow'

// =============================================================================
// TableHead - En-tête de colonne
// =============================================================================

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    sortable?: boolean
    sorted?: 'asc' | 'desc' | false
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
    ({ className, sortable, sorted, children, ...props }, ref) => (
        <th
            ref={ref}
            className={cn(
                'h-12 px-4 text-left align-middle font-semibold text-muted-foreground',
                '[&:has([role=checkbox])]:pr-0',
                sortable && 'cursor-pointer select-none hover:text-foreground',
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-2">
                {children}
                {sorted === 'asc' && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                )}
                {sorted === 'desc' && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </div>
        </th>
    )
)
TableHead.displayName = 'TableHead'

// =============================================================================
// TableCell - Cellule du tableau
// =============================================================================

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    align?: 'left' | 'center' | 'right'
    numeric?: boolean
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
    ({ className, align = 'left', numeric, children, ...props }, ref) => {
        const alignments = {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
        }

        return (
            <td
                ref={ref}
                className={cn(
                    'p-4 align-middle [&:has([role=checkbox])]:pr-0',
                    alignments[align],
                    numeric && 'font-mono tabular-nums',
                    className
                )}
                {...props}
            >
                {children}
            </td>
        )
    }
)
TableCell.displayName = 'TableCell'

// =============================================================================
// TableFooter
// =============================================================================

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
            className
        )}
        {...props}
    />
))
TableFooter.displayName = 'TableFooter'

// =============================================================================
// TableCaption
// =============================================================================

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn('mt-4 text-sm text-muted-foreground', className)}
        {...props}
    />
))
TableCaption.displayName = 'TableCaption'

export {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableFooter,
    TableCaption,
}
