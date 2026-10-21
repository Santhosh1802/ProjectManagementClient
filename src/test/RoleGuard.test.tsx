import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import RoleGuard from "../components/layout/RoleGaurd"
import * as reduxHooks from "@/hooks/redux-hooks"

vi.mock("@/hooks/redux-hooks", () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}))

describe("RoleGuard", () => {
  const useAppSelectorMock = vi.mocked(reduxHooks.useAppSelector)

  it("renders null while authentication is loading", () => {
    useAppSelectorMock.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    })

    const { container } = render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("redirects unauthenticated user to /login", () => {
    useAppSelectorMock.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText("Login Page")).toBeInTheDocument()
  })

  it("redirects unauthorized user to /app/dashboard", () => {
    useAppSelectorMock.mockReturnValue({
      user: {
        id: "1",
        email: "user@test.com",
        firstName: "Normal",
        lastName: "User",
        user_role: "USER",
      },
      isLoading: false,
      isAuthenticated: true,
    })

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/app/dashboard" element={<div>Dashboard Page</div>} />
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument()
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument()
  })

  it("allows user with matching role to access protected content", () => {
    useAppSelectorMock.mockReturnValue({
      user: {
        id: "2",
        email: "admin@test.com",
        firstName: "Super",
        lastName: "Admin",
        user_role: "ADMIN",
      },
      isLoading: false,
      isAuthenticated: true,
    })

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText("Admin Content")).toBeInTheDocument()
  })
})
