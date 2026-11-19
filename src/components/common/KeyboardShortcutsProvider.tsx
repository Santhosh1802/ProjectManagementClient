import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useLocation, useNavigate } from "react-router-dom"

import GlobalSearch from "@/components/common/GlobalSearch"
import KeyboardShortcutsDialog from "@/components/common/KeyboardShortcutsDialog"
import ShortcutHint from "@/components/common/ShortcutHint"
import type { ShortcutAction } from "@/config/keyboardShortcuts"
import {
  KeyboardShortcutsContext,
  type KeyboardShortcutsContextValue,
} from "@/context/KeyboardShortcutsContext"
import { useAppSelector } from "@/hooks/redux-hooks"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

/**
 * Owns the global keyboard layer for the authenticated app:
 * the single keydown listener, the global search palette and the
 * keyboard shortcuts dialog. Mounted once by `AppLayout`.
 *
 * Shortcut state is purely local UI state (not Redux, not persisted).
 */
export default function KeyboardShortcutsProvider({
  children,
}: {
  children: ReactNode
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const role = useAppSelector((state) => state.auth.user?.user_role)

  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [pendingSequence, setPendingSequence] = useState<string | null>(null)

  const overlayStateRef = useRef({ searchOpen, shortcutsOpen })
  const currentPathRef = useRef("")

  useEffect(() => {
    overlayStateRef.current = { searchOpen, shortcutsOpen }
  }, [searchOpen, shortcutsOpen])

  useEffect(() => {
    currentPathRef.current = `${location.pathname}${location.search}`
  }, [location.pathname, location.search])

  const openSearch = useCallback(() => {
    setPendingSequence(null)
    setShortcutsOpen(false)
    setSearchOpen(true)
  }, [])

  const openShortcuts = useCallback(() => {
    setPendingSequence(null)
    setSearchOpen(false)
    setShortcutsOpen(true)
  }, [])

  const handleAction = useCallback(
    (action: ShortcutAction) => {
      switch (action.type) {
        case "openSearch":
          // Ctrl/Cmd + K toggles, matching the previous behaviour.
          setShortcutsOpen(false)
          setSearchOpen((open) => !open)
          break

        case "openShortcuts":
          setSearchOpen(false)
          setShortcutsOpen((open) => !open)
          break

        case "navigate":
          // Avoid duplicate history entries for repeated sequences.
          if (currentPathRef.current !== action.to) {
            navigate(action.to)
          }
          break

        default:
          break
      }
    },
    [navigate]
  )

  const isOwnOverlayOpen = useCallback(
    () =>
      overlayStateRef.current.searchOpen ||
      overlayStateRef.current.shortcutsOpen,
    []
  )

  useKeyboardShortcuts({
    role,
    onAction: handleAction,
    onSequenceChange: setPendingSequence,
    isOwnOverlayOpen,
  })

  const value = useMemo<KeyboardShortcutsContextValue>(
    () => ({ openSearch, openShortcuts }),
    [openSearch, openShortcuts]
  )

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}

      {pendingSequence && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-lg backdrop-blur-md"
        >
          <ShortcutHint keys={[pendingSequence]} decorative />
          <span className="font-medium text-muted-foreground">
            Waiting for next key...
          </span>
        </div>
      )}

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
        role={role}
      />
    </KeyboardShortcutsContext.Provider>
  )
}
