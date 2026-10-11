import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"
import { LoaderCircle } from "lucide-react"

// Sized by padding and min-height, never a fixed height, so stacked Telugu glyphs never clip.
const buttonVariants = cva(
  "inline-flex min-h-touch items-center justify-center gap-2 rounded-control border border-transparent px-4 py-2 text-base font-semibold text-balance text-center transition-[background-color,border-color,color] duration-(--duration-fast) ease-out select-none disabled:cursor-not-allowed aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-action text-on-action disabled:not-aria-busy:bg-ink-subtle",
        secondary: "border-line-strong bg-surface text-ink hover:bg-wash active:bg-wash disabled:text-ink-subtle",
        quiet: "text-ink hover:bg-wash active:bg-wash disabled:text-ink-subtle",
        danger: "border-danger bg-surface text-danger hover:bg-wash active:bg-wash",
      },
      size: {
        default: "",
        // Full-width primary action at the bottom of mobile screens.
        block: "min-h-primary w-full text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Shows a spinner, keeps the label, and blocks repeat presses. */
    loading?: boolean
  }

function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <LoaderCircle aria-hidden className="motion-safe:animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
