import { createContext, useContext } from "react"

export interface KeyboardShortcutsContextValue {
  openSearch: () => void
  openShortcuts: () => void
}

export const KeyboardShortcutsContext =
  createContext<KeyboardShortcutsContextValue | null>(null)

export function useKeyboardShortcutsUI(): KeyboardShortcutsContextValue {
  const context = useContext(KeyboardShortcutsContext)

  if (!context) {
    throw new Error(
      "useKeyboardShortcutsUI must be used inside <KeyboardShortcutsProvider>."
    )
  }

  return context
}
