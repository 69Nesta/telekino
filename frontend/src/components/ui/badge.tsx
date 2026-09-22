import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", { variants: { variant: { default: "border-transparent bg-primary text-primary-foreground", secondary: "border-transparent bg-secondary text-secondary-foreground", success: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200", warning: "border-amber-300/20 bg-amber-300/10 text-amber-200", destructive: "border-destructive/20 bg-destructive/10 text-destructive" } }, defaultVariants: { variant: "default" } })

function Badge({ className, variant, ...props }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) { return <div data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} /> }

export { Badge, badgeVariants }