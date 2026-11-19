import { Fragment } from "react"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { describeShortcut, formatShortcutKey } from "@/lib/keyboard"
import { cn } from "@/lib/utils"

interface ShortcutHintProps {
  keys: string[]
  /** Render as a two-key sequence ("G then D"). */
  sequence?: boolean
  /** Contrast variant passed through to `Kbd`. */
  variant?: "default" | "onPrimary"
  /** Tight inline keycap sizing (`h-4 min-w-4 px-1 text-[9px]`) without `"then"`. */
  compact?: boolean
  /**
   * Omit screen-reader text and mark `aria-hidden` so embedding inside buttons/links
   * never mutates their accessible name.
   */
  decorative?: boolean
  className?: string
  /** Extra classes for each key cap. */
  keyClassName?: string
}

/**
 * Presentational <kbd> hint built on the shadcn `Kbd` primitive.
 * Non-interactive (pointer-events disabled by `Kbd`) and exposes a
 * spoken label for assistive technology unless marked `decorative`.
 */
export default function ShortcutHint({
  keys,
  sequence = false,
  variant = "default",
  compact = false,
  decorative = false,
  className,
  keyClassName,
}: ShortcutHintProps) {
  return (
    <KbdGroup
      aria-hidden={decorative ? "true" : undefined}
      className={cn("shrink-0", compact && "gap-0.5", className)}
    >
      {!decorative && (
        <span className="sr-only">{describeShortcut(keys, sequence)}</span>
      )}

      {keys.map((key, index) => (
        <Fragment key={`${key}-${index}`}>
          {sequence && index > 0 && !compact && (
            <span
              aria-hidden="true"
              className="text-[0.625rem] text-muted-foreground"
            >
              then
            </span>
          )}

          <Kbd
            aria-hidden="true"
            variant={variant}
            className={cn(
              compact && "h-4 min-w-4 px-1 text-[9px]",
              keyClassName
            )}
          >
            {formatShortcutKey(key)}
          </Kbd>
        </Fragment>
      ))}
    </KbdGroup>
  )
}
