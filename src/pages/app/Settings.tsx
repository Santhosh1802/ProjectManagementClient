import { Check, Laptop, Moon, Palette, Sun } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import {
  setTheme,
  setColorTheme,
  type Theme,
  type ColorTheme,
} from "@/app/slice/themeSlice"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { cn } from "@/lib/utils"

interface ColorPreset {
  id: ColorTheme
  name: string
  description: string
  primaryHex: string
  bgPreview: string
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "indigo",
    name: "Indigo Modern",
    description: "Classic IDE deep indigo with high-contrast vibrancy",
    primaryHex: "#6366f1",
    bgPreview: "bg-indigo-500",
  },
  {
    id: "slate",
    name: "Oceanic Slate",
    description: "Refined steel-blue, calm and comfortable for long sessions",
    primaryHex: "#475569",
    bgPreview: "bg-slate-500",
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    description: "Natural organic green, fresh and productivity-focused",
    primaryHex: "#10b981",
    bgPreview: "bg-emerald-500",
  },
  {
    id: "rose",
    name: "Cyber Rose",
    description: "Energetic crimson-rose with modern creative flair",
    primaryHex: "#f43f5e",
    bgPreview: "bg-rose-500",
  },
  {
    id: "zinc",
    name: "Monochrome Zinc",
    description: "Clean minimalist grayscale without color bias",
    primaryHex: "#71717a",
    bgPreview: "bg-zinc-500",
  },
]

export default function Settings() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)
  const activeColorTheme = useAppSelector(
    (state) => state.theme.colorTheme || "indigo"
  )

  const handleThemeChange = (selectedTheme: string | null) => {
    if (selectedTheme) {
      dispatch(setTheme(selectedTheme as Theme))
    }
  }

  const handleColorThemeChange = (color: ColorTheme) => {
    dispatch(setColorTheme(color))
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your workspace preferences and appearance."
      />

      <div className="flex w-full flex-col gap-6">
        {/* Appearance & Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="size-5 text-primary" />
              Interface Mode
            </CardTitle>
            <CardDescription>
              Choose between light, dark, or system-synchronized appearances.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="theme" className="font-semibold">
                Theme Mode
              </Label>
              <div className="max-w-md">
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="size-4 text-muted-foreground" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="size-4 text-muted-foreground" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Laptop className="size-4 text-muted-foreground" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[0.8rem] text-muted-foreground mt-1">
                Press <kbd className="rounded border px-1.5 py-0.5 text-xs font-mono bg-muted">D</kbd> anywhere in the app to quickly toggle between Light and Dark mode.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accent Color Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              Accent & Theme Color
            </CardTitle>
            <CardDescription>
              Select an accent palette variation inspired by modern developer environments. Preferences are persisted automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = activeColorTheme === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleColorThemeChange(preset.id)}
                    className={cn(
                      "group relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all hover:border-primary/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                        : "border-border/70 bg-card hover:bg-muted/30"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "size-5 rounded-full shadow-xs ring-2 ring-background",
                            preset.bgPreview
                          )}
                        />
                        <span className="font-semibold text-sm text-foreground">
                          {preset.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {preset.description}
                    </p>

                    {/* Mini mock UI preview */}
                    <div className="mt-1 flex w-full items-center gap-1.5 rounded-md border border-border/50 bg-background/60 p-2">
                      <div
                        className={cn(
                          "h-2 w-8 rounded-sm",
                          preset.bgPreview
                        )}
                      />
                      <div className="h-2 w-12 rounded-sm bg-muted" />
                      <div className="ml-auto h-2 w-4 rounded-sm bg-muted/60" />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              💡 <strong>Future Cloud Sync Ready:</strong> This preference is currently saved in your client session and local persistence. When backend preferences API/database table is ready, this will effortlessly sync across your devices.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

