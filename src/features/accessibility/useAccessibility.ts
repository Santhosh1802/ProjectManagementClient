import { useCallback, useEffect, useState } from "react"

export type FontSizeStep = 14 | 16 | 18 | 20

export interface AccessibilitySettings {
  fontSize: FontSizeStep
  highContrast: boolean
  highlightLinks: boolean
  readableSpacing: boolean
  reduceMotion: boolean
}

const STORAGE_KEY = "devflow_a11y_settings"
const FONT_STEPS: FontSizeStep[] = [14, 16, 18, 20]

export const DEFAULT_A11Y_SETTINGS: AccessibilitySettings = {
  fontSize: 16,
  highContrast: false,
  highlightLinks: false,
  readableSpacing: false,
  reduceMotion: false,
}

function loadSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_A11Y_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>
    return {
      fontSize: FONT_STEPS.includes(parsed.fontSize as FontSizeStep)
        ? (parsed.fontSize as FontSizeStep)
        : 16,
      highContrast: Boolean(parsed.highContrast),
      highlightLinks: Boolean(parsed.highlightLinks),
      readableSpacing: Boolean(parsed.readableSpacing),
      reduceMotion: Boolean(parsed.reduceMotion),
    }
  } catch {
    return DEFAULT_A11Y_SETTINGS
  }
}

function applyToDocument(settings: AccessibilitySettings) {
  const root = document.documentElement
  root.style.fontSize = `${settings.fontSize}px`

  if (settings.highContrast) {
    root.setAttribute("data-a11y-contrast", "high")
  } else {
    root.removeAttribute("data-a11y-contrast")
  }

  if (settings.highlightLinks) {
    root.setAttribute("data-a11y-links", "true")
  } else {
    root.removeAttribute("data-a11y-links")
  }

  if (settings.readableSpacing) {
    root.setAttribute("data-a11y-spacing", "true")
  } else {
    root.removeAttribute("data-a11y-spacing")
  }

  if (settings.reduceMotion) {
    root.setAttribute("data-a11y-motion", "reduce")
  } else {
    root.removeAttribute("data-a11y-motion")
  }
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings)

  useEffect(() => {
    applyToDocument(settings)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Ignore storage quota errors
    }
  }, [settings])

  const increaseFont = useCallback(() => {
    setSettings((prev) => {
      const idx = FONT_STEPS.indexOf(prev.fontSize)
      const next = FONT_STEPS[Math.min(idx + 1, FONT_STEPS.length - 1)]
      return { ...prev, fontSize: next }
    })
  }, [])

  const decreaseFont = useCallback(() => {
    setSettings((prev) => {
      const idx = FONT_STEPS.indexOf(prev.fontSize)
      const next = FONT_STEPS[Math.max(idx - 1, 0)]
      return { ...prev, fontSize: next }
    })
  }, [])

  const resetFont = useCallback(() => {
    setSettings((prev) => ({ ...prev, fontSize: 16 }))
  }, [])

  const toggleSetting = useCallback(
    (key: Exclude<keyof AccessibilitySettings, "fontSize">) => {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    },
    []
  )

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_A11Y_SETTINGS)
  }, [])

  return {
    settings,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleSetting,
    resetAll,
  }
}
