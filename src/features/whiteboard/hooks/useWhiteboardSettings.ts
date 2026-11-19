import { useCallback, useState } from "react"
import type { RoughnessLevel } from "../types/whiteboard.types"

export interface WhiteboardSettings {
  autoSaveEnabled: boolean
  autoSaveIntervalMs: 2000 | 5000 | 10000
  defaultGridMode: "dots" | "grid" | "none"
  snapToGrid: boolean
  gridSize: 16 | 24
  defaultRoughness: RoughnessLevel
  showPropertiesByDefault: boolean
  showNotesByDefault: boolean
  readOnlyMode: boolean
}

const STORAGE_KEY = "whiteboard-settings-v1"

export const DEFAULT_WHITEBOARD_SETTINGS: WhiteboardSettings = {
  autoSaveEnabled: true,
  autoSaveIntervalMs: 5000,
  defaultGridMode: "dots",
  snapToGrid: false,
  gridSize: 16,
  defaultRoughness: 1,
  showPropertiesByDefault: true,
  showNotesByDefault: true,
  readOnlyMode: false,
}

function loadSettings(): WhiteboardSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_WHITEBOARD_SETTINGS
    const parsed = JSON.parse(raw) as Partial<WhiteboardSettings>
    return { ...DEFAULT_WHITEBOARD_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_WHITEBOARD_SETTINGS
  }
}

export function useWhiteboardSettings() {
  const [settings, setSettings] = useState<WhiteboardSettings>(loadSettings)

  const updateSettings = useCallback((patch: Partial<WhiteboardSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage quota errors
      }
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_WHITEBOARD_SETTINGS)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WHITEBOARD_SETTINGS))
    } catch {
      // Ignore storage quota errors
    }
  }, [])

  return { settings, updateSettings, resetSettings }
}
