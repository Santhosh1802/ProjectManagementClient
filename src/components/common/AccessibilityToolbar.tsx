import { useEffect, useRef, useState } from "react"
import {
  Accessibility,
  ChevronDown,
  Contrast,
  Link2,
  RotateCcw,
  Sparkles,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAccessibility } from "@/features/accessibility/useAccessibility"

export function AccessibilityToolbar() {
  const [moreOpen, setMoreOpen] = useState(false)
  const menuContainerRef = useRef<HTMLDivElement | null>(null)
  const {
    settings,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleSetting,
    resetAll,
  } = useAccessibility()

  useEffect(() => {
    if (!moreOpen) return
    function handlePointerDown(e: MouseEvent) {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false)
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [moreOpen])

  const scalePercent = Math.round((settings.fontSize / 16) * 100)

  return (
    <div
      role="region"
      aria-label="Accessibility toolbar"
      className="relative z-60 w-full border-b border-border/80 bg-gradient-to-r from-primary/10 via-background/95 to-secondary/60 backdrop-blur-md"
    >
      <div className="mx-auto flex min-h-9 max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-1 text-xs sm:px-4">
        {/* Left: Skip to main content (always accessible) + brand label */}
        <div className="flex items-center gap-3">
          <a
            href="#main-content"
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            Skip to main content
          </a>
          <span className="hidden items-center gap-1 text-muted-foreground sm:inline-flex">
            <Accessibility className="size-3.5 text-primary" aria-hidden="true" />
            Accessibility
          </span>
        </div>

        {/* Right: Visible A- / A / A+, High Contrast, and More A11y */}
        <div
          ref={menuContainerRef}
          className="relative flex flex-wrap items-center gap-1.5"
        >
          {/* Font Size Controls */}
          <div
            className="flex items-center rounded-md border border-border/80 bg-background/80 p-0.5"
            role="group"
            aria-label="Text size controls"
          >
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="h-6 px-1.5 text-xs font-semibold"
              onClick={decreaseFont}
              disabled={settings.fontSize <= 14}
              aria-label="Decrease text size"
            >
              A-
            </Button>
            <Button
              type="button"
              size="xs"
              variant={settings.fontSize === 16 ? "secondary" : "ghost"}
              className="h-6 px-1.5 text-xs font-semibold"
              onClick={resetFont}
              aria-label="Reset text size"
            >
              A
            </Button>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="h-6 px-1.5 text-xs font-semibold"
              onClick={increaseFont}
              disabled={settings.fontSize >= 20}
              aria-label="Increase text size"
            >
              A+
            </Button>
            <span className="px-1.5 font-mono text-[11px] text-muted-foreground">
              {scalePercent}%
            </span>
          </div>

          {/* High Contrast Quick Toggle */}
          <Button
            type="button"
            size="xs"
            variant={settings.highContrast ? "default" : "outline"}
            className="h-7 gap-1 px-2 text-xs"
            aria-pressed={settings.highContrast}
            onClick={() => toggleSetting("highContrast")}
          >
            <Contrast className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">High Contrast</span>
          </Button>

          {/* More Accessibility Options Popover */}
          <Button
            type="button"
            size="xs"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="Accessibility options"
            aria-expanded={moreOpen}
          >
            <span className="hidden md:inline">More</span>
            <ChevronDown
              className={`size-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </Button>

          {moreOpen && (
            <div
              role="dialog"
              aria-label="Accessibility controls"
              className="absolute right-0 top-9 z-70 w-64 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Display &amp; Motion
              </p>

              <Button
                type="button"
                size="sm"
                variant={settings.highlightLinks ? "default" : "outline"}
                className="w-full justify-start gap-2"
                aria-pressed={settings.highlightLinks}
                onClick={() => toggleSetting("highlightLinks")}
              >
                <Link2 className="size-4" />
                Highlight Links
              </Button>

              <Button
                type="button"
                size="sm"
                variant={settings.readableSpacing ? "default" : "outline"}
                className="w-full justify-start gap-2"
                aria-pressed={settings.readableSpacing}
                onClick={() => toggleSetting("readableSpacing")}
              >
                <Type className="size-4" />
                Readable Spacing
              </Button>

              <Button
                type="button"
                size="sm"
                variant={settings.reduceMotion ? "default" : "outline"}
                className="w-full justify-start gap-2"
                aria-pressed={settings.reduceMotion}
                onClick={() => toggleSetting("reduceMotion")}
              >
                <Sparkles className="size-4" />
                Reduce Motion
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full justify-center gap-1.5 text-xs text-muted-foreground"
                onClick={() => {
                  resetAll()
                  setMoreOpen(false)
                }}
              >
                <RotateCcw className="size-3.5" />
                Reset All Defaults
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
