import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import AccountSettings from "./AccountSettings"
import * as usersService from "../services/users.service"
import * as authService from "@/features/auth/services/auth.service"
import type { User } from "../types/user.types"
import { renderWithProviders } from "@/test/testUtils"

vi.mock("../services/users.service", () => ({
  updateUser: vi.fn(),
  updateUserPassword: vi.fn(),
}))

vi.mock("@/features/auth/services/auth.service", () => ({
  setupMfa: vi.fn(),
  enableMfa: vi.fn(),
  disableMfa: vi.fn(),
}))

const baseUser: User = {
  id: "u-1",
  firstName: "Alice",
  lastName: "Developer",
  email: "alice@example.com",
  userRole: "ADMIN",
  isActive: true,
  emailVerified: true,
  avatarUrl: "https://cdn.example.com/old.png",
  mfaEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLoginAt: null,
}

describe("AccountSettings (Centralized Avatar, Profile, MFA & Password)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("saves centralized profile picture URL and removes photo via database API", async () => {
    const newUrl = "https://cdn.example.com/new-avatar.png"
    vi.mocked(usersService.updateUser)
      .mockResolvedValueOnce({ ...baseUser, avatarUrl: newUrl })
      .mockResolvedValueOnce({ ...baseUser, avatarUrl: null })

    const { store } = renderWithProviders(<AccountSettings user={baseUser} />, {
      preloadedState: {
        auth: {
          user: {
            id: baseUser.id,
            firstName: baseUser.firstName,
            lastName: baseUser.lastName ?? "",
            email: baseUser.email,
            user_role: baseUser.userRole,
            avatarUrl: baseUser.avatarUrl,
            mfaEnabled: false,
          },
          isAuthenticated: true,
          isLoading: false,
        },
      },
    })

    const urlInput = screen.getByLabelText("Profile image URL")
    fireEvent.change(urlInput, { target: { value: newUrl } })
    fireEvent.click(screen.getByRole("button", { name: "Save Photo URL" }))

    await waitFor(() => {
      expect(usersService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "u-1",
          avatarUrl: newUrl,
        })
      )
      expect(store.getState().auth.user?.avatarUrl).toBe(newUrl)
    })

    fireEvent.click(screen.getByRole("button", { name: /Remove Photo/i }))
    await waitFor(() => {
      expect(usersService.updateUser).toHaveBeenLastCalledWith(
        expect.objectContaining({ avatarUrl: "" })
      )
      expect(store.getState().auth.user?.avatarUrl).toBeNull()
    })
  })

  it("updates personal information and syncs to Redux", async () => {
    vi.mocked(usersService.updateUser).mockResolvedValueOnce({
      ...baseUser,
      firstName: "Alicia",
    })

    const { store } = renderWithProviders(<AccountSettings user={baseUser} />)

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Alicia" },
    })

    fireEvent.click(screen.getByRole("button", { name: "Save Profile" }))

    await waitFor(() => {
      expect(usersService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "u-1",
          firstName: "Alicia",
        })
      )
      expect(store.getState().auth.user?.firstName).toBe("Alicia")
    })
  })

  it("starts MFA setup, renders QR & Base32 secret, and enables MFA with 6-digit code", async () => {
    vi.mocked(authService.setupMfa).mockResolvedValueOnce({
      secret: "JBSWY3DPEHPK3PXP",
      otpAuthUri: "otpauth://totp/DevFlow:alice@example.com?secret=JBSWY3DPEHPK3PXP",
      mfaEnabled: false,
    })
    vi.mocked(authService.enableMfa).mockResolvedValueOnce({
      ...baseUser,
      mfaEnabled: true,
    })

    const { store } = renderWithProviders(<AccountSettings user={baseUser} />)

    fireEvent.click(screen.getByRole("button", { name: /Enable MFA/i }))

    expect(await screen.findByText("JBSWY3DPEHPK3PXP")).toBeInTheDocument()
    expect(screen.getByAltText("MFA QR Code")).toBeInTheDocument()

    const codeInput = screen.getByLabelText(/Step 2: Enter 6-digit code/i)
    fireEvent.change(codeInput, { target: { value: "654321" } })

    fireEvent.click(screen.getByRole("button", { name: /Verify & Enable MFA/i }))

    await waitFor(() => {
      expect(authService.enableMfa).toHaveBeenCalledWith("654321")
      expect(store.getState().auth.user?.mfaEnabled).toBe(true)
    })
  })

  it("disables MFA after password confirmation", async () => {
    vi.mocked(authService.disableMfa).mockResolvedValueOnce({
      ...baseUser,
      mfaEnabled: false,
    })

    const { store } = renderWithProviders(
      <AccountSettings user={{ ...baseUser, mfaEnabled: true }} />
    )

    fireEvent.click(screen.getByRole("button", { name: /Disable MFA/i }))
    fireEvent.change(screen.getByLabelText("Password to disable MFA"), {
      target: { value: "Secret@123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Confirm Disable MFA/i }))

    await waitFor(() => {
      expect(authService.disableMfa).toHaveBeenCalledWith("Secret@123")
      expect(store.getState().auth.user?.mfaEnabled).toBe(false)
    })
  })

  it("validates password confirmation mismatch and submits valid password update", async () => {
    vi.mocked(usersService.updateUserPassword).mockResolvedValueOnce(baseUser)

    renderWithProviders(<AccountSettings user={baseUser} />, {
      preloadedState: {
        auth: {
          user: {
            id: "u-1",
            firstName: "Alice",
            lastName: "Developer",
            email: "alice@example.com",
            user_role: "ADMIN",
          },
          isAuthenticated: true,
          isLoading: false,
        },
      },
    })

    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "OldPass@1" },
    })
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "NewPass@2026" },
    })
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "Mismatch@2026" },
    })

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }))

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument()
    expect(usersService.updateUserPassword).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "NewPass@2026" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }))

    await waitFor(() => {
      expect(usersService.updateUserPassword).toHaveBeenCalledWith({
        id: "u-1",
        oldPassword: "OldPass@1",
        newPassword: "NewPass@2026",
      })
    })
  })
})
