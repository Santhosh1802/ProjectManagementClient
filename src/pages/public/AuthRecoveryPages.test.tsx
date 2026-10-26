import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import ForgotPasswordPage from "./ForgotPasswordPage"
import ResetPasswordPage from "./ResetPasswordPage"
import VerifyEmailPage from "./VerifyEmailPage"
import OAuthButtons from "@/features/auth/components/OAuthButtons"

vi.mock("@/features/auth/services/auth.service", () => ({
  forgotPassword: vi.fn().mockResolvedValue({ message: "Reset link sent" }),
  resetPassword: vi.fn().mockResolvedValue({ message: "Password updated" }),
  verifyEmail: vi.fn().mockResolvedValue({ message: "Email verified" }),
  resendVerification: vi.fn().mockResolvedValue({ message: "Verification link sent" }),
}))

describe("Auth Recovery & OAuth Components", () => {
  describe("OAuthButtons Component", () => {
    it("renders Google and GitHub sign-in buttons", () => {
      render(
        <MemoryRouter>
          <OAuthButtons />
        </MemoryRouter>
      )

      expect(screen.getByRole("button", { name: /Google/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /GitHub/i })).toBeInTheDocument()
      expect(screen.getByText(/Or continue with/i)).toBeInTheDocument()
    })
  })

  describe("ForgotPasswordPage", () => {
    it("renders forgot password form with email field and send button", () => {
      render(
        <MemoryRouter initialEntries={["/forgot-password"]}>
          <Routes>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText("Forgot Password")).toBeInTheDocument()
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /Send Reset Link/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/Back to Sign In/i)).toBeInTheDocument()
    })
  })

  describe("ResetPasswordPage", () => {
    it("renders missing token warning when no token is present in URL", () => {
      render(
        <MemoryRouter initialEntries={["/reset-password"]}>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </MemoryRouter>
      )

      expect(
        screen.getByText("Invalid or Missing Token")
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /Request New Reset Link/i })
      ).toBeInTheDocument()
    })

    it("renders password fields when token is present in URL", () => {
      render(
        <MemoryRouter initialEntries={["/reset-password?token=valid-test-token"]}>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText("Choose New Password")).toBeInTheDocument()
      expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: /Update Password/i })
      ).toBeInTheDocument()
    })
  })

  describe("VerifyEmailPage", () => {
    it("renders resend verification form when no token is present in URL", () => {
      render(
        <MemoryRouter initialEntries={["/verify-email"]}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText("Email Verification")).toBeInTheDocument()
      expect(screen.getByText(/Resend Verification Link/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Account Email/i)).toBeInTheDocument()
    })
  })
})
