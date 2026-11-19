import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { Provider } from "react-redux"
import { render } from "@testing-library/react"

import KeyboardShortcutsProvider from "./KeyboardShortcutsProvider"
import { ThemeProvider } from "./theme-provider"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { createTestStore } from "@/test/testUtils"

vi.mock("@/features/search/services/search.service", () => ({
  globalSearch: vi.fn().mockResolvedValue({
    projects: [],
    tasks: [],
    members: [],
    comments: [],
  }),
}))

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="current-path">{location.pathname}</div>
}

function SidebarStateProbe() {
  const { open } = useSidebar()
  return <div data-testid="sidebar-open">{String(open)}</div>
}

function renderShortcutHarness({
  role = "USER",
  route = "/app/dashboard",
  children,
}: {
  role?: string
  route?: string
  children?: React.ReactNode
} = {}) {
  const store = createTestStore({
    auth: {
      user: {
        id: "u-1",
        firstName: "Alice",
        lastName: "Tester",
        email: "alice@example.com",
        user_role: role,
      },
      isAuthenticated: true,
      isLoading: false,
    },
  })

  return {
    store,
    ...render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[route]}>
            <KeyboardShortcutsProvider>
              <LocationProbe />
              {children}
            </KeyboardShortcutsProvider>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    ),
  }
}

describe("Keyboard Shortcuts System & Controls", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("opens and toggles Global Search with Ctrl+K and Keyboard Shortcuts dialog with Ctrl+/ and ?", () => {
    renderShortcutHarness({ role: "ADMIN" })

    // Ctrl + K opens Global Search dialog
    fireEvent.keyDown(document, { key: "k", ctrlKey: true })
    expect(
      screen.getByPlaceholderText(
        "Search projects, tasks, team members, comments..."
      )
    ).toBeInTheDocument()

    // Ctrl + / switches to Keyboard Shortcuts dialog
    fireEvent.keyDown(document, { key: "/", code: "Slash", ctrlKey: true })
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument()
    expect(screen.getByText("Global")).toBeInTheDocument()
    expect(screen.getByText("Navigation")).toBeInTheDocument()
    expect(screen.getByText("Create")).toBeInTheDocument()
    expect(screen.getByText("Search")).toBeInTheDocument()
    expect(screen.getByText("Actions")).toBeInTheDocument()

    // Pressing ? while Keyboard Shortcuts dialog is open closes it
    fireEvent.keyDown(document, { key: "?" })
    expect(screen.queryByText("Keyboard shortcuts")).not.toBeInTheDocument()

    // Pressing ? anywhere opens it again
    fireEvent.keyDown(document, { key: "?" })
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument()
  })

  it("lists role-restricted shortcuts only for authorized roles", () => {
    const { unmount } = renderShortcutHarness({ role: "USER" })
    fireEvent.keyDown(document, { key: "?" })
    expect(screen.queryByText("Go to Super Admin")).not.toBeInTheDocument()
    expect(screen.queryByText("Go to User Management")).not.toBeInTheDocument()
    expect(screen.getByText("Go to Team Chat")).toBeInTheDocument()
    expect(screen.getByText("Go to Whiteboards")).toBeInTheDocument()
    expect(screen.getByText("Go to Notifications")).toBeInTheDocument()
    expect(screen.getByText("Toggle focus view (Chat & Whiteboard)")).toBeInTheDocument()
    unmount()

    renderShortcutHarness({ role: "SUPER_ADMIN" })
    fireEvent.keyDown(document, { key: "?" })
    expect(screen.getByText("Go to Super Admin")).toBeInTheDocument()
    expect(screen.getByText("Go to User Management")).toBeInTheDocument()
  })

  it("shows floating chord indicator and executes all G+* and C+* navigation sequences", () => {
    const { unmount } = renderShortcutHarness({ role: "USER" })

    const triggerSeq = (first: string, second: string, expectedPath: string) => {
      fireEvent.keyDown(document, { key: first })
      expect(screen.getByText("Waiting for next key...")).toBeInTheDocument()
      fireEvent.keyDown(document, { key: second })
      expect(screen.queryByText("Waiting for next key...")).not.toBeInTheDocument()
      expect(screen.getByTestId("current-path")).toHaveTextContent(expectedPath)
    }

    triggerSeq("g", "p", "/app/projects")
    triggerSeq("g", "t", "/app/tasks")
    triggerSeq("g", "c", "/app/chat")
    triggerSeq("g", "w", "/app/whiteboards")
    triggerSeq("g", "n", "/app/notifications")
    triggerSeq("g", "o", "/app/organization/settings")
    triggerSeq("g", "m", "/app/profile")
    triggerSeq("g", "s", "/app/settings")
    triggerSeq("g", "d", "/app/dashboard")
    triggerSeq("c", "p", "/app/projects/create")
    triggerSeq("c", "t", "/app/tasks/create")

    // Regular USER is blocked from SUPER_ADMIN / user management sequences
    fireEvent.keyDown(document, { key: "g" })
    fireEvent.keyDown(document, { key: "a" })
    expect(screen.getByTestId("current-path")).toHaveTextContent("/app/tasks/create")

    unmount()

    // SUPER_ADMIN can navigate to /app/super-admin, /app/users, /app/users/create
    renderShortcutHarness({ role: "SUPER_ADMIN" })
    fireEvent.keyDown(document, { key: "g" })
    fireEvent.keyDown(document, { key: "a" })
    expect(screen.getByTestId("current-path")).toHaveTextContent("/app/super-admin")

    fireEvent.keyDown(document, { key: "g" })
    fireEvent.keyDown(document, { key: "u" })
    expect(screen.getByTestId("current-path")).toHaveTextContent("/app/users")

    fireEvent.keyDown(document, { key: "c" })
    fireEvent.keyDown(document, { key: "u" })
    expect(screen.getByTestId("current-path")).toHaveTextContent("/app/users/create")
  })

  it("focuses visible [data-page-search] on / and skips hidden tabs and editable inputs", () => {
    renderShortcutHarness({
      children: (
        <div>
          <div data-state="inactive">
            <input data-page-search="" aria-label="Hidden tab search" />
          </div>
          <input data-page-search="" aria-label="Visible page search" />
          <textarea aria-label="Notes box" />
        </div>
      ),
    })

    const visibleInput = screen.getByLabelText("Visible page search")
    const hiddenInput = screen.getByLabelText("Hidden tab search")
    const textarea = screen.getByLabelText("Notes box")

    fireEvent.keyDown(document, { key: "/" })
    expect(document.activeElement).toBe(visibleInput)
    expect(document.activeElement).not.toBe(hiddenInput)

    // Typing / inside an editable input must NOT steal focus
    textarea.focus()
    fireEvent.keyDown(textarea, { key: "/" })
    expect(document.activeElement).toBe(textarea)
  })

  it("ThemeProvider toggles theme on 'd' but ignores Shift+D, editable fields, and open dialogs", () => {
    const { store } = renderShortcutHarness({
      children: (
        <div>
          <input aria-label="Title input" />
        </div>
      ),
    })

    const initialTheme = store.getState().theme.theme

    // Plain 'd' toggles theme
    fireEvent.keyDown(window, { key: "d" })
    expect(store.getState().theme.theme).not.toBe(initialTheme)
    const toggledTheme = store.getState().theme.theme

    // Shift+D should NOT toggle theme
    fireEvent.keyDown(window, { key: "D", shiftKey: true })
    expect(store.getState().theme.theme).toBe(toggledTheme)

    // Inside editable input should NOT toggle theme
    const input = screen.getByLabelText("Title input")
    input.focus()
    fireEvent.keyDown(input, { key: "d" })
    expect(store.getState().theme.theme).toBe(toggledTheme)

    // When a dialog overlay is open, 'd' should NOT toggle theme
    fireEvent.keyDown(document, { key: "?" })
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument()
    fireEvent.keyDown(window, { key: "d" })
    expect(store.getState().theme.theme).toBe(toggledTheme)
  })

  it("SidebarProvider toggles sidebar on Ctrl+b and Ctrl+B", () => {
    render(
      <SidebarProvider defaultOpen={true}>
        <SidebarStateProbe />
      </SidebarProvider>
    )

    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true")

    fireEvent.keyDown(window, { key: "b", ctrlKey: true })
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("false")

    fireEvent.keyDown(window, { key: "B", ctrlKey: true })
    expect(screen.getByTestId("sidebar-open")).toHaveTextContent("true")
  })
})
