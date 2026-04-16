import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        accent: "bg-[#c96a3a]/10 text-[#c96a3a] border border-[#c96a3a]/25",
        dark: "bg-[#1a1916] text-[#f7f4ef]",
        muted: "bg-[#f0ece5] text-[#7a7670]",
      },
    },
    defaultVariants: {
      variant: "accent",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
