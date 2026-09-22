import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div data-slot="card" className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} /> }
function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-header" className={cn("flex flex-col gap-2 p-6", className)} {...props} /> }
function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} /> }

export { Card, CardHeader, CardContent }