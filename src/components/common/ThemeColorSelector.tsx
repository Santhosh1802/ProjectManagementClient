import { Sun, Moon, Laptop, Palette, Check } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import {
  setTheme,
  setPrimaryColor,
  setSecondaryColor,
  type Theme,
} from "@/app/slice/themeSlice"
import { THEME_COLORS, THEME_COLOR_LIST, type ThemeColorKey } from "@/config/themeColors"
import { Button } from "@/components/ui/button"
import ShortcutHint from "./ShortcutHint"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function ThemeColorSelector() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)
  const primaryColor = useAppSelector((state) => state.theme.primaryColor || "indigo")
  const secondaryColor = useAppSelector((state) => state.theme.secondaryColor || "teal")

  const handleThemeChange = (newTheme: Theme) => {
    dispatch(setTheme(newTheme))
  }

  const handlePrimaryChange = (key: ThemeColorKey) => {
    dispatch(setPrimaryColor(key))
  }

  const handleSecondaryChange = (key: ThemeColorKey) => {
    dispatch(setSecondaryColor(key))
  }

  const primarySwatch = THEME_COLORS[primaryColor]?.swatchClass ?? "bg-indigo-600"
  const secondarySwatch = THEME_COLORS[secondaryColor]?.swatchClass ?? "bg-teal-500"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8.5 gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label="Toggle theme and dual accent colors"
            aria-keyshortcuts="D"
            title="Theme & colors (Press D to toggle light/dark)"
          />
        }
      >
        <div className="flex items-center gap-1.5">
          {theme === "light" ? (
            <Sun className="size-4 text-amber-500" />
          ) : theme === "dark" ? (
            <Moon className="size-4 text-sky-400" />
          ) : (
            <Laptop className="size-4 text-primary" />
          )}
          <span className="flex items-center -space-x-1" aria-hidden="true">
            <span className={cn("size-2.5 rounded-full ring-1 ring-background", primarySwatch)} />
            <span className={cn("size-2.5 rounded-full ring-1 ring-background", secondarySwatch)} />
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Interface Mode</span>
          <ShortcutHint keys={["d"]} compact decorative />
        </div>

        <DropdownMenuItem onClick={() => handleThemeChange("light")} className="cursor-pointer">
          <Sun className="size-4 text-amber-500" />
          <span>Light</span>
          {theme === "light" && <Check className="ml-auto size-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleThemeChange("dark")} className="cursor-pointer">
          <Moon className="size-4 text-sky-400" />
          <span>Dark</span>
          {theme === "dark" && <Check className="ml-auto size-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleThemeChange("system")} className="cursor-pointer">
          <Laptop className="size-4 text-muted-foreground" />
          <span>System</span>
          {theme === "system" && <Check className="ml-auto size-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <div className="space-y-2.5 px-2 pb-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Palette className="size-3.5 text-primary" />
            Dual Color Theme
          </div>

          {/* Primary Color Picker */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Primary</span>
              <span className="font-medium">{THEME_COLORS[primaryColor]?.label}</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {THEME_COLOR_LIST.map((c) => (
                <button
                  key={`p-${c.key}`}
                  type="button"
                  title={`Primary: ${c.label}`}
                  aria-label={`Primary color ${c.label}`}
                  aria-pressed={primaryColor === c.key}
                  onClick={() => handlePrimaryChange(c.key)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full transition-transform hover:scale-110",
                    c.swatchClass,
                    primaryColor === c.key && "ring-2 ring-foreground ring-offset-2 ring-offset-popover"
                  )}
                >
                  {primaryColor === c.key && <Check className="size-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Color Picker */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Secondary</span>
              <span className="font-medium">{THEME_COLORS[secondaryColor]?.label}</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {THEME_COLOR_LIST.map((c) => (
                <button
                  key={`s-${c.key}`}
                  type="button"
                  title={`Secondary: ${c.label}`}
                  aria-label={`Secondary color ${c.label}`}
                  aria-pressed={secondaryColor === c.key}
                  onClick={() => handleSecondaryChange(c.key)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full transition-transform hover:scale-110",
                    c.swatchClass,
                    secondaryColor === c.key && "ring-2 ring-foreground ring-offset-2 ring-offset-popover"
                  )}
                >
                  {secondaryColor === c.key && <Check className="size-3 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
