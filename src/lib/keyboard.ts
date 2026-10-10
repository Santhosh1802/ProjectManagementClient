import type { KeyboardEvent as ReactKeyboardEvent } from "react"

/*
 * Platform-aware keyboard helpers shared by the global shortcut
 * system and the few components that opt in to local shortcuts
 * (for example Ctrl/Cmd + Enter form submission).
 */

export const IS_MAC_PLATFORM: boolean =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(
    // `userAgentData` is not available in every browser yet.
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ||
      navigator.platform ||
      navigator.userAgent
  )

/** Display label for the primary modifier: ⌘ on macOS, Ctrl elsewhere. */
export const MOD_KEY_LABEL = IS_MAC_PLATFORM ? "⌘" : "Ctrl"

const KEY_LABELS: Record<string, string> = {
  mod: MOD_KEY_LABEL,
  Enter: IS_MAC_PLATFORM ? "↵" : "Enter",
  Esc: "Esc",
}

const SPOKEN_LABELS: Record<string, string> = {
  mod: IS_MAC_PLATFORM ? "Command" : "Control",
  Enter: "Enter",
  Esc: "Escape",
  "/": "Slash",
  "?": "Question mark",
}

/** Visual key-cap label, e.g. "mod" → "Ctrl" / "⌘", "g" → "G". */
export function formatShortcutKey(key: string): string {
  return KEY_LABELS[key] ?? (key.length === 1 ? key.toUpperCase() : key)
}

/** Spoken label, e.g. "Control+K" or "G then D". */
export function describeShortcut(keys: string[], sequence = false): string {
  const spoken = keys.map(
    (key) => SPOKEN_LABELS[key] ?? (key.length === 1 ? key.toUpperCase() : key)
  )

  return sequence ? spoken.join(" then ") : spoken.join("+")
}

/** Value for the `aria-keyshortcuts` attribute (modifier combos only). */
export function toAriaKeyShortcuts(keys: string[]): string {
  return keys
    .map((key) =>
      key === "mod"
        ? IS_MAC_PLATFORM
          ? "Meta"
          : "Control"
        : key.length === 1
          ? key.toUpperCase()
          : key
    )
    .join("+")
}

type AnyKeyboardEvent = KeyboardEvent | ReactKeyboardEvent

/**
 * True when exactly the platform primary modifier is held
 * (Meta on macOS, Ctrl on Windows/Linux) without Alt.
 */
export function isPrimaryModifier(event: AnyKeyboardEvent): boolean {
  if (event.altKey) {
    return false
  }

  return IS_MAC_PLATFORM
    ? event.metaKey && !event.ctrlKey
    : event.ctrlKey && !event.metaKey
}

export function hasAnyModifier(event: AnyKeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey
}

/** Fields where typed characters must never be intercepted. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return !!target.closest(
    "input, textarea, select, [contenteditable=''], [contenteditable='true'], [role='textbox'], [role='combobox'], [role='searchbox']"
  )
}

/*
 * Selectors for open overlays (dialogs, sheets, popovers, menus,
 * select listboxes). While any of these exist, single-key shortcuts
 * are suspended so they never act "behind" an overlay or clash with
 * menu typeahead.
 */
const OVERLAY_SELECTOR =
  "[role='dialog'], [role='alertdialog'], [role='menu'], [role='listbox']"

export function isOverlayOpen(): boolean {
  return document.querySelector(OVERLAY_SELECTOR) !== null
}

export function isInsideOverlay(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(OVERLAY_SELECTOR)
}

/** Normalised single-character key ("g", "/", "?") for matching. */
export function normalizeKey(event: AnyKeyboardEvent): string {
  const { key, code } = event

  if (key.length === 1) {
    const lower = key.toLowerCase()

    if (/^[a-z]$/.test(lower) || !code.startsWith("Key")) {
      return lower
    }

    // Non-Latin layouts: fall back to the physical key.
    return code.slice(3).toLowerCase()
  }

  return key
}

export function isModifierOnlyKey(event: AnyKeyboardEvent): boolean {
  return (
    event.key === "Shift" ||
    event.key === "Control" ||
    event.key === "Alt" ||
    event.key === "Meta" ||
    event.key === "CapsLock" ||
    event.key === "AltGraph"
  )
}

/**
 * `onKeyDown` handler for <form> elements controlled by React Hook
 * Form. Ctrl/Cmd + Enter requests a normal form submission so the
 * existing `handleSubmit` + Zod validation run unchanged.
 *
 * Submission is skipped while the form's submit button is disabled
 * (e.g. while a request is in flight).
 */
export function submitFormOnModEnter(
  event: ReactKeyboardEvent<HTMLFormElement>
): void {
  if (event.key !== "Enter" || !isPrimaryModifier(event) || event.shiftKey) {
    return
  }

  if (event.nativeEvent.isComposing) {
    return
  }

  const form = event.currentTarget

  // `elements` also includes buttons linked via the `form="id"` attribute.
  const submitter = Array.from(form.elements).find(
    (element): element is HTMLButtonElement | HTMLInputElement =>
      (element instanceof HTMLButtonElement ||
        element instanceof HTMLInputElement) &&
      element.type === "submit"
  )

  if (!submitter || submitter.disabled) {
    return
  }

  event.preventDefault()
  form.requestSubmit(submitter)
}
