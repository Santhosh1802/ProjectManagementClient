import { Sun, Moon, Laptop, Palette, Check } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import {
  setTheme,
  setColorTheme,
  type Theme,
  type ColorTheme,
} from "@/app/slice/themeSlice"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const COLOR_PRESETS: { id: ColorTheme; name: string; dotClass: string }[] = [
  { id: "indigo", name: "Indigo", dotClass: "bg-indigo-500" },
  { id: "slate", name: "Slate", dotClass: "bg-slate-500" },
  { id: "emerald", name: "Emerald", dotClass: "bg-emerald-500" },
  { id: "rose", name: "Rose", dotClass: "bg-rose-500" },
  { id: "zinc", name: "Zinc", dotClass: "bg-zinc-500" },
]

export default function ThemeColorSelector() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)
  const colorTheme = useAppSelector((state) => state.theme.colorTheme || "indigo")

  const handleThemeChange = (newTheme: Theme) => {
    dispatch(setTheme(newTheme))
  }

  const handleColorThemeChange = (newColor: ColorTheme) => {
    dispatch(setColorTheme(newColor))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8.5 rounded-lg border border-border/50 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label="Toggle theme and accent color"
          />
        }
      >
        <div className="relative flex items-center justify-center">
          {theme === "light" ? (
            <Sun className="size-4 text-amber-500 transition-transform duration-200" />
          ) : theme === "dark" ? (
            <Moon className="size-4 text-sky-400 transition-transform duration-200" />
          ) : (
            <Laptop className="size-4 text-primary transition-transform duration-200" />
          )}
          <span className="sr-only">Toggle theme</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Interface Mode
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

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Palette className="size-4 text-primary" />
            <span>Accent Palette</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            {COLOR_PRESETS.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => handleColorThemeChange(preset.id)}
                className="flex cursor-pointer items-center gap-2"
              >
                <span className={cn("size-3 rounded-full ring-1 ring-border", preset.dotClass)} />
                <span>{preset.name}</span>
                {colorTheme === preset.id && <Check className="ml-auto size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
