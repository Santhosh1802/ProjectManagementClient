import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import LoginForm from "./LoginForm"
import * as authService from "../services/auth.service"
import { renderWithProviders } from "@/test/testUtils"

vi.mock("../services/auth.service", () => ({
  LoginUser: vi.fn(),
}))

describe("LoginForm Authentication & MFA Challenge", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows validation error on empty submission", async () => {
    renderWithProviders(<LoginForm />)

    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }))

    await waitFor(() => {
      expect(screen.getByText("Password is required")).toBeInTheDocument()
      expect(screen.getByText("Invalid email address")).toBeInTheDocument()
    })
    expect(authService.LoginUser).not.toHaveBeenCalled()
  })

  it("authenticates user cleanly and stores avatarUrl & mfaEnabled in Redux", async () => {
    vi.mocked(authService.LoginUser).mockResolvedValueOnce({
      status: 200,
      data: {
        data: {
          id: "u-1",
          firstName: "Alice",
          lastName: "Dev",
          email: "alice@example.com",
          userRole: "ADMIN",
          avatarUrl: "https://cdn.example.com/alice.png",
          mfaEnabled: true,
        },
      },
    } as Awaited<ReturnType<typeof authService.LoginUser>>)

    const { store } = renderWithProviders(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password@123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }))

    await waitFor(() => {
      expect(screen.getByText("Authentication successful")).toBeInTheDocument()
    })

    expect(store.getState().auth.isAuthenticated).toBe(true)
    expect(store.getState().auth.user).toMatchObject({
      id: "u-1",
      email: "alice@example.com",
      avatarUrl: "https://cdn.example.com/alice.png",
      mfaEnabled: true,
    })
  })

  it("handles 202 MFA_REQUIRED challenge and submits 6-digit authenticator code", async () => {
    vi.mocked(authService.LoginUser)
      .mockResolvedValueOnce({
        status: 202,
        data: { message: "MFA_REQUIRED" },
      } as Awaited<ReturnType<typeof authService.LoginUser>>)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            id: "u-mfa",
            firstName: "Bob",
            lastName: "Secure",
            email: "bob@example.com",
            userRole: "USER",
            avatarUrl: null,
            mfaEnabled: true,
          },
        },
      } as Awaited<ReturnType<typeof authService.LoginUser>>)

    const { store } = renderWithProviders(<LoginForm />)

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "bob@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Secret@123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }))

    const mfaInput = await screen.findByLabelText(
      /Two-Factor Authentication Code/i
    )
    expect(mfaInput).toBeInTheDocument()

    fireEvent.change(mfaInput, { target: { value: "123456" } })
    fireEvent.click(screen.getByRole("button", { name: /Sign in/i }))

    await waitFor(() => {
      expect(authService.LoginUser).toHaveBeenNthCalledWith(2, {
        email: "bob@example.com",
        password: "Secret@123",
        mfaCode: "123456",
      })
    })

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true)
    })
  })

  it("displays OAuth deactivation error banner from URL search params", () => {
    renderWithProviders(<LoginForm />, {
      route: "/login?error=account_deactivated",
    })

    expect(
      screen.getByText(/Your account has been deactivated/i)
    ).toBeInTheDocument()
  })
})
