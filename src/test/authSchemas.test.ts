import { describe, it, expect } from "vitest"
import { loginSchema } from "../features/auth/schemas/login.schema"
import { registrationSchema } from "../features/auth/schemas/registration.schema"

describe("Auth Zod Schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "SecretPassword123!",
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "SecretPassword123!",
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("registrationSchema", () => {
    const validRegistration = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    }

    it("accepts valid registration payload", () => {
      const result = registrationSchema.safeParse(validRegistration)
      expect(result.success).toBe(true)
    })

    it("allows optional or empty lastName", () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        lastName: "",
      })
      expect(result.success).toBe(true)
    })

    it("fails when passwords do not match", () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        confirmPassword: "DifferentPassword123!",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Password do not match")
      }
    })

    it("fails on weak password missing special character or number", () => {
      const result = registrationSchema.safeParse({
        ...validRegistration,
        password: "passwordwithoutrules",
        confirmPassword: "passwordwithoutrules",
      })
      expect(result.success).toBe(false)
    })
  })
})
