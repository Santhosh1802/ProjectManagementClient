import {
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  FillStyle,
  RoughnessLevel,
  RoundnessStyle,
  StrokeStyle,
  WhiteboardElement,
} from "../types/whiteboard.types"

export interface StyleDefaults {
  color: string
  backgroundColor: string
  fillStyle: FillStyle
  strokeWidth: number
  strokeStyle: StrokeStyle
  roughness: RoughnessLevel
  roundness: RoundnessStyle
  opacity: number
  fontSize: number
}

interface WhiteboardPropertiesPanelProps {
  style: StyleDefaults
  selectedElement: WhiteboardElement | null
  selectedCount: number
  onUpdateStyle: (patch: Partial<StyleDefaults>) => void
  onDuplicate?: () => void
  onBringForward?: () => void
  onSendBackward?: () => void
  onDelete?: () => void
}

export const STROKE_PALETTE = [
  { label: "Ink", value: "#1e293b" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Sky", value: "#0284c7" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber", value: "#d97706" },
  { label: "Rose", value: "#e11d48" },
]

export const BG_PALETTE = [
  { label: "Transparent", value: "transparent" },
  { label: "Indigo Tint", value: "#e0e7ff" },
  { label: "Sky Tint", value: "#e0f2fe" },
  { label: "Emerald Tint", value: "#d1fae5" },
  { label: "Amber Tint", value: "#fef3c7" },
  { label: "Rose Tint", value: "#ffe4e6" },
]

const FONT_SIZES = [
  { label: "S", value: 12 },
  { label: "M", value: 15 },
  { label: "L", value: 19 },
  { label: "XL", value: 24 },
]

export function WhiteboardPropertiesPanel({
  style,
  selectedElement,
  selectedCount,
  onUpdateStyle,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onDelete,
}: WhiteboardPropertiesPanelProps) {
  const activeColor = selectedElement?.color ?? style.color
  const activeBg = selectedElement?.backgroundColor ?? style.backgroundColor
  const activeFill = selectedElement?.fillStyle ?? style.fillStyle
  const activeStrokeW = selectedElement?.strokeWidth ?? style.strokeWidth
  const activeStrokeStyle = selectedElement?.strokeStyle ?? style.strokeStyle
  const activeRoughness = selectedElement?.roughness ?? style.roughness
  const activeRoundness = selectedElement?.roundness ?? style.roundness
  const activeOpacity = selectedElement?.opacity ?? style.opacity
  const activeFontSize = selectedElement?.fontSize ?? style.fontSize

  return (
    <aside
      aria-label="Shape properties"
      className="flex w-[196px] flex-col gap-2.5 p-1 text-xs"
    >
      {selectedCount > 1 && (
        <div className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
          {selectedCount} elements selected
        </div>
      )}

      {/* Stroke Color */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Stroke</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {STROKE_PALETTE.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              aria-label={`Stroke ${c.label}`}
              onClick={() => onUpdateStyle({ color: c.value })}
              style={{ backgroundColor: c.value }}
              className={cn(
                "size-5 rounded-md border border-black/15 transition-transform hover:scale-110",
                activeColor === c.value && "ring-2 ring-primary ring-offset-1 ring-offset-card"
              )}
            />
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Background</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {BG_PALETTE.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              aria-label={`Background ${c.label}`}
              onClick={() => onUpdateStyle({ backgroundColor: c.value })}
              style={{
                backgroundColor: c.value === "transparent" ? undefined : c.value,
              }}
              className={cn(
                "size-5 rounded-md border border-border transition-transform hover:scale-110",
                c.value === "transparent" &&
                  "bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] [background-size:8px_8px]",
                activeBg === c.value && "ring-2 ring-primary ring-offset-1 ring-offset-card"
              )}
            />
          ))}
        </div>
      </div>

      {/* Fill Style with Excalidraw SVG icons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Fill</span>
        <div className="grid grid-cols-4 gap-1">
          {(
            [
              { id: "hachure", label: "Hachure" },
              { id: "cross-hatch", label: "Cross-hatch" },
              { id: "solid", label: "Solid" },
              { id: "none", label: "None" },
            ] as { id: FillStyle; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              title={f.label}
              aria-label={`Fill ${f.label}`}
              onClick={() => onUpdateStyle({ fillStyle: f.id })}
              className={cn(
                "flex h-7 items-center justify-center rounded-md border transition-colors",
                activeFill === f.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {f.id === "hachure" && (
                <svg viewBox="0 0 18 18" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="14" height="14" rx="2" />
                  <path d="M4 12 L12 4 M6 16 L16 6" />
                </svg>
              )}
              {f.id === "cross-hatch" && (
                <svg viewBox="0 0 18 18" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="14" height="14" rx="2" />
                  <path d="M4 12 L12 4 M6 16 L16 6 M4 6 L12 14 M6 2 L16 12" />
                </svg>
              )}
              {f.id === "solid" && (
                <svg viewBox="0 0 18 18" className="size-4" fill="currentColor">
                  <rect x="2.5" y="2.5" width="13" height="13" rx="2.5" />
                </svg>
              )}
              {f.id === "none" && (
                <svg viewBox="0 0 18 18" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2.5" y="2.5" width="13" height="13" rx="2" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Stroke width</span>
        <div className="grid grid-cols-3 gap-1">
          {[
            { w: 1.5, label: "Thin" },
            { w: 2.5, label: "Bold" },
            { w: 4, label: "Extra Bold" },
          ].map((item) => (
            <button
              key={item.w}
              type="button"
              onClick={() => onUpdateStyle({ strokeWidth: item.w })}
              className={cn(
                "flex h-7 items-center justify-center rounded-md border transition-colors",
                activeStrokeW === item.w
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:bg-muted"
              )}
              title={item.label}
              aria-label={`Stroke width ${item.label}`}
            >
              <span
                className="block w-5 rounded-full bg-current"
                style={{ height: `${item.w}px` }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Style */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Stroke style</span>
        <div className="grid grid-cols-3 gap-1">
          {(["solid", "dashed", "dotted"] as StrokeStyle[]).map((s) => (
            <button
              key={s}
              type="button"
              title={s}
              aria-label={`Stroke style ${s}`}
              onClick={() => onUpdateStyle({ strokeStyle: s })}
              className={cn(
                "flex h-7 items-center justify-center rounded-md border transition-colors",
                activeStrokeStyle === s
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <svg viewBox="0 0 24 8" className="h-2.5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {s === "solid" && <line x1="2" y1="4" x2="22" y2="4" />}
                {s === "dashed" && <line x1="2" y1="4" x2="22" y2="4" strokeDasharray="5 4" />}
                {s === "dotted" && <line x1="2" y1="4" x2="22" y2="4" strokeDasharray="1.5 4" />}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Sloppiness */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Sloppiness</span>
        <div className="grid grid-cols-3 gap-1">
          {(
            [
              { lvl: 0, label: "Architect (Crisp)" },
              { lvl: 1, label: "Artist (Sketch)" },
              { lvl: 2, label: "Cartoonist (Rough)" },
            ] as { lvl: RoughnessLevel; label: string }[]
          ).map((r) => (
            <button
              key={r.lvl}
              type="button"
              title={r.label}
              aria-label={r.label}
              onClick={() => onUpdateStyle({ roughness: r.lvl })}
              className={cn(
                "flex h-7 items-center justify-center rounded-md border transition-colors",
                activeRoughness === r.lvl
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:bg-muted"
              )}
            >
              <svg viewBox="0 0 24 12" className="h-3 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {r.lvl === 0 && <path d="M2 6 L22 6" />}
                {r.lvl === 1 && <path d="M2 6 Q 8 3 12 6 T 22 6" />}
                {r.lvl === 2 && <path d="M2 7 Q 6 2 10 7 T 18 5 T 22 7 M3 5 Q 9 9 15 4 T 21 6" />}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Edges & Font Size */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Edges</span>
          <div className="grid grid-cols-2 gap-1">
            {(["sharp", "round"] as RoundnessStyle[]).map((edge) => (
              <button
                key={edge}
                type="button"
                title={`${edge} corners`}
                aria-label={`Edges ${edge}`}
                onClick={() => onUpdateStyle({ roundness: edge })}
                className={cn(
                  "flex h-7 items-center justify-center rounded-md border transition-colors",
                  activeRoundness === edge
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:bg-muted"
                )}
              >
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {edge === "sharp" ? (
                    <path d="M3 13 V3 H13" />
                  ) : (
                    <path d="M3 13 V7 Q3 3 7 3 H13" />
                  )}
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Font</span>
          <div className="grid grid-cols-4 gap-0.5">
            {FONT_SIZES.map((fs) => (
              <button
                key={fs.label}
                type="button"
                title={`Font size ${fs.label}`}
                aria-label={`Font size ${fs.label}`}
                onClick={() => onUpdateStyle({ fontSize: fs.value })}
                className={cn(
                  "h-7 rounded-md border text-[10px] font-semibold transition-colors",
                  activeFontSize === fs.value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {fs.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Opacity</span>
          <span className="font-mono">{activeOpacity}%</span>
        </div>
        <input
          type="range"
          min={20}
          max={100}
          step={10}
          value={activeOpacity}
          onChange={(e) => onUpdateStyle({ opacity: Number(e.target.value) })}
          aria-label="Element opacity"
          className="h-1.5 w-full cursor-pointer accent-primary"
        />
      </div>

      {/* Layer & Element Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-1 border-t border-border/70 pt-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={onBringForward}
            disabled={selectedCount > 1}
            title="Bring to front"
            aria-label="Bring to front"
          >
            <ArrowUpToLine className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={onSendBackward}
            disabled={selectedCount > 1}
            title="Send to back"
            aria-label="Send to back"
          >
            <ArrowDownToLine className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={onDuplicate}
            title="Duplicate (Ctrl+D)"
            aria-label="Duplicate element"
          >
            <Copy className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Delete (Del)"
            aria-label="Delete element"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </aside>
  )
}
