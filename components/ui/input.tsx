import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-[#e8e3db] bg-[#f7f4ef] px-4 py-2 text-sm text-[#1a1916] placeholder:text-[#bbb8b2] transition-all duration-200 focus-visible:outline-none focus-visible:border-[#c96a3a] focus-visible:ring-2 focus-visible:ring-[#c96a3a]/15 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
