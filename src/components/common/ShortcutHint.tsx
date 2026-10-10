import { Fragment } from "react"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { describeShortcut, formatShortcutKey } from "@/lib/keyboard"
import { cn } from "@/lib/utils"

interface ShortcutHintProps {
  keys: string[]
  /** Render as a two-key sequence ("G then D"). */
  sequence?: boolean
  className?: string
  /** Extra classes for each key cap. */
  keyClassName?: string
}

/**
 * Presentational <kbd> hint built on the shadcn `Kbd` primitive.
 * Non-interactive (pointer-events disabled by `Kbd`) and exposes a
 * spoken label for assistive technology.
 */
export default function ShortcutHint({
  keys,
  sequence = false,
  className,
  keyClassName,
}: ShortcutHintProps) {
  return (
    <KbdGroup className={cn("shrink-0", className)}>
      <span className="sr-only">{describeShortcut(keys, sequence)}</span>

      {keys.map((key, index) => (
        <Fragment key={`${key}-${index}`}>
          {sequence && index > 0 && (
            <span
              aria-hidden="true"
              className="text-[0.625rem] text-muted-foreground"
            >
              then
            </span>
          )}

          <Kbd aria-hidden="true" className={keyClassName}>
            {formatShortcutKey(key)}
          </Kbd>
        </Fragment>
      ))}
    </KbdGroup>
  )
}
