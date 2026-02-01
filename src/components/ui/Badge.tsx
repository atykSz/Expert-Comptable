import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "bg-foreground text-background",
        secondary: "bg-muted text-muted-foreground",
        destructive: "bg-danger/10 text-danger",
        outline: "bg-transparent border border-border text-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
