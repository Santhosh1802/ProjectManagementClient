import { cn } from "cn"

interface KbdProps extends React.ComponentProps<"kbd"> {
  variant?: "default" | "onPrimary"
}

function Kbd({ className, variant = "default", ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded px-1.5 font-mono text-[10px] leading-none font-semibold select-none in-data-[slot=tooltip-content]:border-background/25 in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background in-data-[slot=tooltip-content]:shadow-none dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        variant === "onPrimary"
          ? "border border-primary-foreground/35 bg-primary-foreground/15 text-primary-foreground shadow-none"
          : "border border-border/90 bg-background/95 text-foreground/85 shadow-[0_1px_0_0_var(--border)] dark:border-border dark:bg-muted/90",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
