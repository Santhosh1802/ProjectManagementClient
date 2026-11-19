import { useContext, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  Accessibility,
  ArrowRight,
  Bell,
  Building2,
  Check,
  Keyboard,
  Laptop,
  Moon,
  Palette,
  PenTool,
  RotateCcw,
  Sparkles,
  Sun,
  User,
  UserCheck,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import ShortcutHint from "@/components/common/ShortcutHint"
import { KeyboardShortcutsContext } from "@/context/KeyboardShortcutsContext"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import { queryClient } from "@/lib/queryClient"
import {
  setTheme,
  setPrimaryColor,
  setSecondaryColor,
  type Theme,
} from "@/app/slice/themeSlice"
import {
  THEME_COLORS,
  THEME_COLOR_LIST,
  type ThemeColorKey,
} from "@/config/themeColors"
import { useAccessibility } from "@/features/accessibility/useAccessibility"
import { useWhiteboardSettings } from "@/features/whiteboard/hooks/useWhiteboardSettings"
import type { RoughnessLevel } from "@/features/whiteboard/types/whiteboard.types"
import {
  readDefaultWorkspacePreference,
  resolveDefaultWorkspace,
  setActiveWorkspace,
  setDefaultWorkspacePreference,
} from "@/features/workspaces/slice/workspaceSlice"
import type { Workspace } from "@/features/workspaces/types/workspace.types"
import { cn } from "@/lib/utils"

const EMPTY_WORKSPACES: Workspace[] = []

type SettingsTab = "appearance" | "whiteboard" | "accessibility" | "workspace"

const VALID_TABS: SettingsTab[] = [
  "appearance",
  "whiteboard",
  "accessibility",
  "workspace",
]

const NAV_ITEMS: {
  id: SettingsTab
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: "appearance",
    label: "Appearance",
    description: "Mode & dual colors",
    icon: Palette,
  },
  {
    id: "whiteboard",
    label: "Whiteboard",
    description: "Auto-save & canvas",
    icon: PenTool,
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description: "Contrast & text size",
    icon: Accessibility,
  },
  {
    id: "workspace",
    label: "Workspace",
    description: "Default workspace & links",
    icon: Building2,
  },
]

const DUAL_PRESETS: {
  label: string
  primary: ThemeColorKey
  secondary: ThemeColorKey
}[] = [
  { label: "Indigo + Teal", primary: "indigo", secondary: "teal" },
  { label: "Violet + Blue", primary: "violet", secondary: "blue" },
  { label: "Emerald + Teal", primary: "emerald", secondary: "teal" },
  { label: "Rose + Amber", primary: "rose", secondary: "amber" },
]

function SwitchButton({
  checked,
  label,
  onClick,
}: {
  checked: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
      )}
    >
      {checked ? "Enabled" : "Disabled"}
    </button>
  )
}

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab") as SettingsTab | null
  const [localTab, setLocalTab] = useState<SettingsTab>("appearance")
  const activeTab: SettingsTab =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : localTab

  const handleSelectTab = (tab: SettingsTab) => {
    setLocalTab(tab)
    setSearchParams({ tab }, { replace: true })
  }

  const shortcutsUI = useContext(KeyboardShortcutsContext)

  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)
  const primaryColor = useAppSelector(
    (state) => state.theme.primaryColor || "indigo"
  )
  const secondaryColor = useAppSelector(
    (state) => state.theme.secondaryColor || "teal"
  )

  const workspaces =
    useAppSelector((state) => state.workspaces?.workspaces) ?? EMPTY_WORKSPACES
  const activeWorkspace = useAppSelector(
    (state) => state.workspaces?.activeWorkspace ?? null
  )
  const storedDefaultPref = useAppSelector(
    (state) => state.workspaces?.defaultWorkspacePreference
  )
  const currentUserId = useAppSelector((state) => state.auth?.user?.id ?? null)

  const currentPreference =
    storedDefaultPref ??
    readDefaultWorkspacePreference(currentUserId) ??
    "AUTO_PERSONAL"

  const resolvedDefault = useMemo(
    () =>
      resolveDefaultWorkspace(
        workspaces,
        currentPreference === "AUTO_PERSONAL" ? null : currentPreference
      ),
    [workspaces, currentPreference]
  )

  const sortedWorkspaces = useMemo(() => {
    return [...workspaces].sort((a, b) => {
      if (a.workspaceType !== b.workspaceType) {
        return a.workspaceType === "ORGANIZATION" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  }, [workspaces])

  const handleSelectDefaultPreference = (nextPreference: string | null) => {
    dispatch(
      setDefaultWorkspacePreference({
        preference: nextPreference,
        userId: currentUserId,
      })
    )

    const label =
      nextPreference === "AUTO_ORGANIZATION"
        ? "Organization First"
        : !nextPreference || nextPreference === "AUTO_PERSONAL"
        ? "Personal Workspace First"
        : workspaces.find((w) => w.id === nextPreference)?.name ??
          "Selected workspace"

    toast.add({
      type: "success",
      title: "Default workspace updated",
      description: `Startup preference set to ${label}.`,
    })
  }

  const handleSwitchToDefault = () => {
    if (!resolvedDefault || resolvedDefault.id === activeWorkspace?.id) return
    void queryClient.cancelQueries()
    void queryClient.invalidateQueries({ queryKey: ["projects"] })
    void queryClient.invalidateQueries({ queryKey: ["tasks"] })
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    void queryClient.invalidateQueries({ queryKey: ["analytics"] })
    void queryClient.invalidateQueries({ queryKey: ["saved-views"] })
    void queryClient.invalidateQueries({ queryKey: ["workflow-rules"] })
    void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    dispatch(setActiveWorkspace(resolvedDefault))
    toast.add({
      type: "success",
      title: "Workspace switched",
      description: `Switched active workspace to ${resolvedDefault.name}.`,
    })
  }

  const {
    settings: wbSettings,
    updateSettings: updateWbSettings,
    resetSettings: resetWbSettings,
  } = useWhiteboardSettings()

  const {
    settings: a11y,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleSetting: toggleA11y,
    resetAll: resetA11y,
  } = useAccessibility()

  const applyDualPreset = (primary: ThemeColorKey, secondary: ThemeColorKey) => {
    dispatch(setPrimaryColor(primary))
    dispatch(setSecondaryColor(secondary))
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Customize your interface theme, dual colors, whiteboard defaults, and accessibility preferences."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Settings Navigation */}
        <nav
          aria-label="Settings sections"
          className="flex shrink-0 gap-1.5 overflow-x-auto pb-1 lg:w-60 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={cn(
                  "flex min-w-fit items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all",
                  active
                    ? "border-primary/40 bg-primary/10 text-foreground shadow-xs"
                    : "border-transparent bg-card/60 text-muted-foreground hover:border-border/70 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">
                    {item.label}
                  </span>
                  <span className="hidden text-[11px] text-muted-foreground lg:block">
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        {/* Settings Content Pane */}
        <div className="min-w-0 flex-1 space-y-6">
          {activeTab === "appearance" && (
            <>
              {/* Visual Theme Mode Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sun className="size-4 text-primary" />
                    Interface Mode
                  </CardTitle>
                  <CardDescription>
                    Choose light, dark, or automatic system appearance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        {
                          id: "light" as Theme,
                          label: "Light",
                          desc: "Crisp daylight surfaces",
                          icon: Sun,
                          previewBg: "bg-slate-50 border-slate-200",
                          previewBar: "bg-white border-slate-200",
                        },
                        {
                          id: "dark" as Theme,
                          label: "Dark",
                          desc: "Low-glare night studio",
                          icon: Moon,
                          previewBg: "bg-slate-900 border-slate-700",
                          previewBar: "bg-slate-800 border-slate-700",
                        },
                        {
                          id: "system" as Theme,
                          label: "System",
                          desc: "Matches OS preference",
                          icon: Laptop,
                          previewBg:
                            "bg-gradient-to-r from-slate-50 via-slate-200 to-slate-900 border-border",
                          previewBar: "bg-card/90 border-border",
                        },
                      ] as const
                    ).map((m) => {
                      const Icon = m.icon
                      const selected = theme === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => dispatch(setTheme(m.id))}
                          className={cn(
                            "flex flex-col gap-2.5 rounded-xl border p-3 text-left transition-all hover:border-primary/60",
                            selected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                              : "border-border/70 bg-card"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-14 w-full items-center gap-2 rounded-lg border p-2",
                              m.previewBg
                            )}
                          >
                            <div
                              className={cn(
                                "h-full w-6 rounded border",
                                m.previewBar
                              )}
                            />
                            <div className="flex flex-1 flex-col gap-1.5">
                              <div className="h-2 w-3/4 rounded bg-primary/70" />
                              <div className="h-2 w-1/2 rounded bg-secondary/80" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-sm font-semibold">
                              <Icon className="size-3.5 text-primary" />
                              {m.label}
                            </span>
                            {selected && (
                              <Badge variant="default" className="text-[10px]">
                                Active
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {m.desc}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Dual Color Theme Studio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Palette className="size-4 text-primary" />
                    Dual Color Theme
                  </CardTitle>
                  <CardDescription>
                    Mix and match your Primary and Secondary colors. Changes sync across the header, sidebar, and all pages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Quick Curated Presets */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                      <Sparkles className="size-3.5 text-primary" />
                      Quick Dual-Color Pairs
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {DUAL_PRESETS.map((preset) => {
                        const isActive =
                          primaryColor === preset.primary &&
                          secondaryColor === preset.secondary
                        return (
                          <Button
                            key={preset.label}
                            type="button"
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            onClick={() =>
                              applyDualPreset(preset.primary, preset.secondary)
                            }
                            className="gap-2"
                          >
                            <span className="flex -space-x-1">
                              <span
                                className={cn(
                                  "size-3 rounded-full ring-1 ring-background",
                                  THEME_COLORS[preset.primary].swatchClass
                                )}
                              />
                              <span
                                className={cn(
                                  "size-3 rounded-full ring-1 ring-background",
                                  THEME_COLORS[preset.secondary].swatchClass
                                )}
                              />
                            </span>
                            {preset.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Primary Color */}
                    <div className="space-y-3 rounded-xl border border-border/70 p-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                          Primary Color
                        </Label>
                        <Badge variant="outline">
                          {THEME_COLORS[primaryColor]?.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {THEME_COLOR_LIST.map((c) => (
                          <button
                            key={`settings-p-${c.key}`}
                            type="button"
                            onClick={() => dispatch(setPrimaryColor(c.key))}
                            className={cn(
                              "flex items-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all hover:border-primary/60",
                              primaryColor === c.key
                                ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                                : "border-border/60 bg-card"
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full",
                                c.swatchClass
                              )}
                            >
                              {primaryColor === c.key && (
                                <Check className="size-2.5 text-white" />
                              )}
                            </span>
                            <span className="truncate">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-3 rounded-xl border border-border/70 p-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                          Secondary Color
                        </Label>
                        <Badge variant="secondary">
                          {THEME_COLORS[secondaryColor]?.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {THEME_COLOR_LIST.map((c) => (
                          <button
                            key={`settings-s-${c.key}`}
                            type="button"
                            onClick={() => dispatch(setSecondaryColor(c.key))}
                            className={cn(
                              "flex items-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all hover:border-primary/60",
                              secondaryColor === c.key
                                ? "border-primary bg-secondary/40 ring-1 ring-primary/40"
                                : "border-border/60 bg-card"
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full",
                                c.swatchClass
                              )}
                            >
                              {secondaryColor === c.key && (
                                <Check className="size-2.5 text-white" />
                              )}
                            </span>
                            <span className="truncate">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Dual-Color Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">
                        Live Dual-Color Preview
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {THEME_COLORS[primaryColor]?.label} +{" "}
                        {THEME_COLORS[secondaryColor]?.label}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm">Primary Action</Button>
                      <Button size="sm" variant="secondary">
                        Secondary Action
                      </Button>
                      <Badge variant="secondary">Accent Badge</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "whiteboard" && (
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PenTool className="size-4 text-primary" />
                    Whiteboard Studio Preferences
                  </CardTitle>
                  <CardDescription>
                    Default behavior for auto-save, canvas grid, sloppiness, and meeting notes.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={resetWbSettings}
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  Reset Defaults
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">Auto-Save &amp; Broadcast</div>
                    <p className="text-xs text-muted-foreground">
                      Automatically save whiteboard edits and broadcast to collaborators.
                    </p>
                  </div>
                  <SwitchButton
                    checked={wbSettings.autoSaveEnabled}
                    label="Auto-Save Whiteboard"
                    onClick={() =>
                      updateWbSettings({
                        autoSaveEnabled: !wbSettings.autoSaveEnabled,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Auto-Save Delay</span>
                  <div className="flex items-center gap-1">
                    {([2000, 5000, 10000] as const).map((ms) => (
                      <Button
                        key={ms}
                        type="button"
                        size="xs"
                        variant={
                          wbSettings.autoSaveIntervalMs === ms
                            ? "default"
                            : "outline"
                        }
                        disabled={!wbSettings.autoSaveEnabled}
                        onClick={() =>
                          updateWbSettings({ autoSaveIntervalMs: ms })
                        }
                      >
                        {ms / 1000}s
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Default Canvas Grid</span>
                  <div className="flex items-center gap-1">
                    {(["dots", "grid", "none"] as const).map((mode) => (
                      <Button
                        key={mode}
                        type="button"
                        size="xs"
                        className="capitalize"
                        variant={
                          wbSettings.defaultGridMode === mode
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          updateWbSettings({ defaultGridMode: mode })
                        }
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Snap to Grid by Default</span>
                  <div className="flex items-center gap-2">
                    {([16, 24] as const).map((sz) => (
                      <Button
                        key={sz}
                        type="button"
                        size="xs"
                        variant={
                          wbSettings.gridSize === sz ? "secondary" : "outline"
                        }
                        onClick={() => updateWbSettings({ gridSize: sz })}
                      >
                        {sz}px
                      </Button>
                    ))}
                    <SwitchButton
                      checked={wbSettings.snapToGrid}
                      label="Snap to Grid by Default"
                      onClick={() =>
                        updateWbSettings({ snapToGrid: !wbSettings.snapToGrid })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Default Sketch Sloppiness</span>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { lvl: 0, label: "Crisp" },
                        { lvl: 1, label: "Sketch" },
                        { lvl: 2, label: "Rough" },
                      ] as { lvl: RoughnessLevel; label: string }[]
                    ).map((r) => (
                      <Button
                        key={r.lvl}
                        type="button"
                        size="xs"
                        variant={
                          wbSettings.defaultRoughness === r.lvl
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          updateWbSettings({ defaultRoughness: r.lvl })
                        }
                      >
                        {r.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">
                    Show Style Panel by Default
                  </span>
                  <SwitchButton
                    checked={wbSettings.showPropertiesByDefault}
                    label="Show Style Panel by Default"
                    onClick={() =>
                      updateWbSettings({
                        showPropertiesByDefault:
                          !wbSettings.showPropertiesByDefault,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">
                    Show Meeting Notes by Default
                  </span>
                  <SwitchButton
                    checked={wbSettings.showNotesByDefault}
                    label="Show Meeting Notes by Default"
                    onClick={() =>
                      updateWbSettings({
                        showNotesByDefault: !wbSettings.showNotesByDefault,
                      })
                    }
                  />
                </div>

                <div className="pt-2">
                  <Link
                    to="/app/whiteboards"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Open Meeting Whiteboards
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "accessibility" && (
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Accessibility className="size-4 text-primary" />
                    Accessibility &amp; Readability
                  </CardTitle>
                  <CardDescription>
                    Synced with the top accessibility bar (GIGW / WCAG 2.1).
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={resetA11y}
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  Reset All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">Text Size</div>
                    <p className="text-xs text-muted-foreground">
                      Current base font size: {a11y.fontSize}px
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={decreaseFont}
                    >
                      A-
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={resetFont}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={increaseFont}
                    >
                      A+
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">High Contrast Mode</span>
                  <SwitchButton
                    checked={a11y.highContrast}
                    label="High Contrast Mode"
                    onClick={() => toggleA11y("highContrast")}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Highlight Links</span>
                  <SwitchButton
                    checked={a11y.highlightLinks}
                    label="Highlight Links"
                    onClick={() => toggleA11y("highlightLinks")}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Readable Text Spacing</span>
                  <SwitchButton
                    checked={a11y.readableSpacing}
                    label="Readable Text Spacing"
                    onClick={() => toggleA11y("readableSpacing")}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">Reduce Motion</span>
                  <SwitchButton
                    checked={a11y.reduceMotion}
                    label="Reduce Motion"
                    onClick={() => toggleA11y("reduceMotion")}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "workspace" && (
            <div className="space-y-4">
              {/* Default Startup Workspace Card */}
              <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="size-4 text-primary" />
                      Default Startup Workspace
                    </CardTitle>
                    <CardDescription>
                      Choose which workspace opens automatically when you sign in (such as your Organization instead of Personal).
                    </CardDescription>
                  </div>
                  {currentPreference !== "AUTO_PERSONAL" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectDefaultPreference(null)}
                      className="shrink-0 self-start"
                    >
                      <RotateCcw className="mr-1.5 size-3.5" />
                      Reset to Personal
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Startup Mode Options */}
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectDefaultPreference("AUTO_ORGANIZATION")
                      }
                      aria-pressed={currentPreference === "AUTO_ORGANIZATION"}
                      className={cn(
                        "flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition-all hover:border-primary/60",
                        currentPreference === "AUTO_ORGANIZATION"
                          ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                          : "border-border/70 bg-card"
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            Organization First
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Automatically opens your organization workspace on sign-in (falls back to Personal if none).
                          </p>
                        </div>
                      </div>
                      {currentPreference === "AUTO_ORGANIZATION" && (
                        <Check className="size-4 shrink-0 text-primary mt-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectDefaultPreference(null)}
                      aria-pressed={currentPreference === "AUTO_PERSONAL"}
                      className={cn(
                        "flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition-all hover:border-primary/60",
                        currentPreference === "AUTO_PERSONAL"
                          ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                          : "border-border/70 bg-card"
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <User className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            Personal Workspace First
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Always starts in your private personal workspace by default.
                          </p>
                        </div>
                      </div>
                      {currentPreference === "AUTO_PERSONAL" && (
                        <Check className="size-4 shrink-0 text-primary mt-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Specific Workspace Selection */}
                  {sortedWorkspaces.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Or Choose a Specific Workspace
                      </Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sortedWorkspaces.map((ws) => {
                          const isDefaultSpecific = currentPreference === ws.id
                          const isActive = activeWorkspace?.id === ws.id
                          const isOrg = ws.workspaceType === "ORGANIZATION"

                          return (
                            <button
                              key={ws.id}
                              type="button"
                              onClick={() =>
                                handleSelectDefaultPreference(ws.id)
                              }
                              aria-pressed={isDefaultSpecific}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-lg border p-2.5 text-left transition-all hover:border-primary/60 min-w-0",
                                isDefaultSpecific
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                                  : "border-border/70 bg-card"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                                    isOrg
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {isOrg ? (
                                    <Building2 className="size-3.5" />
                                  ) : (
                                    <User className="size-3.5" />
                                  )}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-foreground">
                                    {ws.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {isOrg ? "Organization" : "Personal"} ·{" "}
                                    {ws.currentUserRole}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {isActive && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Active
                                  </Badge>
                                )}
                                {isDefaultSpecific && (
                                  <Badge
                                    variant="default"
                                    className="text-[10px]"
                                  >
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer Summary & Quick Switch */}
                  <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Next sign-in default:{" "}
                      <span className="font-semibold text-foreground">
                        {resolvedDefault?.name ??
                          (currentPreference === "AUTO_ORGANIZATION"
                            ? "Organization (when available)"
                            : "Personal workspace")}
                      </span>
                    </p>
                    {resolvedDefault &&
                      activeWorkspace?.id !== resolvedDefault.id && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleSwitchToDefault}
                          className="h-7 text-xs shrink-0 self-start sm:self-auto"
                        >
                          Switch to Default Now
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Profile & Security",
                    desc: "Manage your display name, password, and active sessions.",
                    to: "/app/profile",
                    icon: UserCheck,
                  },
                  {
                    title: "Organization & Plan",
                    desc: "View workspace members, roles, and subscription quotas.",
                    to: "/app/organization/settings",
                    icon: Building2,
                  },
                  {
                    title: "Notifications",
                    desc: "Review @mentions, task assignments, and live updates.",
                    to: "/app/notifications",
                    icon: Bell,
                  },
                  {
                    title: "Meeting Whiteboards",
                    desc: "Jump directly to collaborative Excalidraw-style boards.",
                    to: "/app/whiteboards",
                    icon: PenTool,
                  },
                ].map((card) => {
                  const Icon = card.icon
                  return (
                    <Card
                      key={card.to}
                      className="flex flex-col justify-between transition-colors hover:border-primary/50"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="size-4 text-primary" />
                          {card.title}
                        </CardTitle>
                        <CardDescription>{card.desc}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link
                          to={card.to}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Open
                          <ArrowRight className="ml-1.5 size-3.5" />
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Keyboard className="size-4 text-primary" />
                      Keyboard Shortcuts
                    </CardTitle>
                    <CardDescription>
                      Navigate across DevFlow quickly with keyboard chords and quick actions.
                    </CardDescription>
                  </div>
                  {shortcutsUI && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={shortcutsUI.openShortcuts}
                      className="gap-2 shrink-0 self-start sm:self-center"
                    >
                      <span>Open Shortcuts Guide</span>
                      <ShortcutHint keys={["?"]} compact decorative />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
                    <span className="text-muted-foreground">Global search</span>
                    <ShortcutHint keys={["mod", "k"]} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
                    <span className="text-muted-foreground">Shortcuts help</span>
                    <ShortcutHint keys={["?"]} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
                    <span className="text-muted-foreground">Toggle theme</span>
                    <ShortcutHint keys={["d"]} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
