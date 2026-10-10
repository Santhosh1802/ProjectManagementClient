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

  const overlayStateRef = useRef({ searchOpen, shortcutsOpen })
  const currentPathRef = useRef("")

  useEffect(() => {
    overlayStateRef.current = { searchOpen, shortcutsOpen }
  }, [searchOpen, shortcutsOpen])

  useEffect(() => {
    currentPathRef.current = `${location.pathname}${location.search}`
  }, [location.pathname, location.search])

  const openSearch = useCallback(() => {
    setShortcutsOpen(false)
    setSearchOpen(true)
  }, [])

  const openShortcuts = useCallback(() => {
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
    isOwnOverlayOpen,
  })

  const value = useMemo<KeyboardShortcutsContextValue>(
    () => ({ openSearch, openShortcuts }),
    [openSearch, openShortcuts]
  )

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
        role={role}
      />
    </KeyboardShortcutsContext.Provider>
  )
}
