import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AccessibilityToolbar } from "./AccessibilityToolbar"

describe("AccessibilityToolbar", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.style.fontSize = ""
    document.documentElement.removeAttribute("data-a11y-contrast")
    document.documentElement.removeAttribute("data-a11y-links")
    document.documentElement.removeAttribute("data-a11y-spacing")
    document.documentElement.removeAttribute("data-a11y-motion")
  })

  it("renders visible top bar with skip-to-content, text size, contrast, and reset", () => {
    render(<AccessibilityToolbar />)

    const skipLink = screen.getByText("Skip to main content")
    expect(skipLink).toHaveAttribute("href", "#main-content")

    // Increase text size directly from the visible top bar (16px -> 18px)
    fireEvent.click(screen.getByRole("button", { name: "Increase text size" }))
    expect(document.documentElement.style.fontSize).toBe("18px")
    expect(screen.getByText("113%")).toBeInTheDocument()

    // Toggle High Contrast directly from the visible top bar
    const contrastBtn = screen.getByRole("button", { name: /High Contrast/i })
    fireEvent.click(contrastBtn)
    expect(document.documentElement.getAttribute("data-a11y-contrast")).toBe("high")

    // Open More menu and Reset All Defaults
    fireEvent.click(screen.getByRole("button", { name: "Accessibility options" }))
    expect(screen.getByRole("dialog", { name: "Accessibility controls" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Reset All Defaults/i }))
    expect(document.documentElement.style.fontSize).toBe("16px")
    expect(document.documentElement.getAttribute("data-a11y-contrast")).toBeNull()
  })
})
