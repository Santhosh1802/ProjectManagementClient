import { useEffect, useRef } from "react"

import {
  KEYBOARD_SHORTCUTS,
  PAGE_SEARCH_SELECTOR,
  SEQUENCE_TIMEOUT_MS,
  type ShortcutAction,
  type ShortcutDefinition,
} from "@/config/keyboardShortcuts"
import { hasAllowedRole } from "@/config/routeAccess"
import {
  hasAnyModifier,
  isEditableTarget,
  isModifierOnlyKey,
  isOverlayOpen,
  isPrimaryModifier,
  normalizeKey,
} from "@/lib/keyboard"

/*
 * Pre-computed lookup tables derived from the registry.
 * "external" shortcuts are documentation-only and never handled here.
 */
const ACTIONABLE = KEYBOARD_SHORTCUTS.filter(
  (shortcut) => shortcut.action.type !== "external"
)

const MOD_SHORTCUTS = ACTIONABLE.filter(
  (shortcut) => shortcut.keys[0] === "mod" && shortcut.keys.length === 2
)

const SEQUENCE_SHORTCUTS = ACTIONABLE.filter(
  (shortcut) => shortcut.sequence && shortcut.keys.length === 2
)

const SEQUENCE_PREFIXES = new Set(
  SEQUENCE_SHORTCUTS.map((shortcut) => shortcut.keys[0])
)

const SINGLE_KEY_SHORTCUTS = ACTIONABLE.filter(
  (shortcut) => !shortcut.sequence && shortcut.keys.length === 1
)

function focusPageSearch(): boolean {
  const candidates = document.querySelectorAll<HTMLInputElement>(
    PAGE_SEARCH_SELECTOR
  )

  for (const input of candidates) {
    const isVisible = input.getClientRects().length > 0

    if (isVisible && !input.disabled) {
      input.focus()
      input.select()
      return true
    }
  }

  return false
}

export interface UseKeyboardShortcutsOptions {
  /** Global role of the authenticated user (`auth.user.user_role`). */
  role: string | null | undefined
  /** Runs a non-DOM action (open search/help, navigate). */
  onAction: (action: ShortcutAction, shortcut: ShortcutDefinition) => void
  /**
   * True while one of the shortcut system's own overlays (global
   * search, shortcuts dialog) is open, so Ctrl/Cmd + K and
   * Ctrl/Cmd + / can switch between them.
   */
  isOwnOverlayOpen: () => boolean
}

/**
 * Registers the single global keydown listener for the authenticated
 * app. Mount once (see `KeyboardShortcutsProvider`).
 *
 * Listener runs on `document` in the bubble phase, i.e. after React
 * component handlers, so component-level handling (`preventDefault`)
 * always wins. Escape is intentionally not handled — Base UI overlays
 * already close themselves and restore focus.
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    let pendingPrefix: string | null = null
    let pendingTimer: number | undefined

    const clearSequence = () => {
      pendingPrefix = null

      if (pendingTimer !== undefined) {
        window.clearTimeout(pendingTimer)
        pendingTimer = undefined
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) {
        return
      }

      if (isModifierOnlyKey(event)) {
        return
      }

      const { role, onAction, isOwnOverlayOpen } = optionsRef.current

      const isAllowed = (shortcut: ShortcutDefinition) =>
        hasAllowedRole(role, shortcut.roles)

      const editable = isEditableTarget(event.target)
      const key = normalizeKey(event)

      /* ---------------------------------------------------------- */
      /* Ctrl/Cmd + key                                              */
      /* ---------------------------------------------------------- */

      if (isPrimaryModifier(event) && !event.shiftKey) {
        clearSequence()

        const matchKey = event.code === "Slash" ? "/" : key

        const shortcut = MOD_SHORTCUTS.find(
          (candidate) => candidate.keys[1] === matchKey
        )

        if (!shortcut || !isAllowed(shortcut)) return
        if (editable && !shortcut.allowInEditable) return

        // Don't stack on top of an unrelated dialog/menu.
        if (isOverlayOpen() && !isOwnOverlayOpen()) return

        event.preventDefault()
        onAction(shortcut.action, shortcut)
        return
      }

      /* ---------------------------------------------------------- */
      /* Plain keys — never while typing or inside overlays          */
      /* ---------------------------------------------------------- */

      if (hasAnyModifier(event) || editable || event.repeat) {
        clearSequence()
        return
      }

      if (isOverlayOpen()) {
        clearSequence()
        return
      }

      if (pendingPrefix) {
        const prefix = pendingPrefix
        clearSequence()

        const shortcut = SEQUENCE_SHORTCUTS.find(
          (candidate) =>
            candidate.keys[0] === prefix && candidate.keys[1] === key
        )

        if (shortcut) {
          // Consume the key even when unauthorised so it can't
          // trigger other single-key handlers (e.g. theme "D").
          event.preventDefault()

          if (isAllowed(shortcut)) {
            onAction(shortcut.action, shortcut)
          }

          return
        }

        // Unrelated key: sequence cleared, evaluate the key normally.
      }

      if (!event.shiftKey && SEQUENCE_PREFIXES.has(key)) {
        pendingPrefix = key
        pendingTimer = window.setTimeout(clearSequence, SEQUENCE_TIMEOUT_MS)
        return
      }

      const shortcut = SINGLE_KEY_SHORTCUTS.find(
        (candidate) => candidate.keys[0] === key
      )

      if (!shortcut || !isAllowed(shortcut)) return

      if (shortcut.action.type === "focusPageSearch") {
        // No page search → do nothing (and keep browser default).
        if (focusPageSearch()) {
          event.preventDefault()
        }

        return
      }

      event.preventDefault()
      onAction(shortcut.action, shortcut)
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      clearSequence()
    }
  }, [])
}
