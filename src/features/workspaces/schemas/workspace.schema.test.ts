import { describe, it, expect } from "vitest"
import {
  createOrganizationSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  acceptInvitationSchema,
} from "./workspace.schema"

describe("workspace schemas", () => {
  describe("createOrganizationSchema", () => {
    it("should accept valid organization name", () => {
      const result = createOrganizationSchema.safeParse({ name: "Engineering Team" })
      expect(result.success).toBe(true)
    })

    it("should reject name that is too short", () => {
      const result = createOrganizationSchema.safeParse({ name: "A" })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 2 characters")
      }
    })

    it("should reject name that is too long", () => {
      const result = createOrganizationSchema.safeParse({ name: "A".repeat(151) })
      expect(result.success).toBe(false)
    })
  })

  describe("updateWorkspaceSchema", () => {
    it("should accept valid updated name", () => {
      const result = updateWorkspaceSchema.safeParse({ name: "Product Team" })
      expect(result.success).toBe(true)
    })

    it("should reject name that is too short", () => {
      const result = updateWorkspaceSchema.safeParse({ name: "P" })
      expect(result.success).toBe(false)
    })
  })

  describe("inviteMemberSchema", () => {
    it("should accept valid email and role", () => {
      const result = inviteMemberSchema.safeParse({
        email: "alice@example.com",
        role: "MEMBER",
      })
      expect(result.success).toBe(true)
    })

    it("should reject invalid email", () => {
      const result = inviteMemberSchema.safeParse({
        email: "not-an-email",
        role: "ADMIN",
      })
      expect(result.success).toBe(false)
    })

    it("should reject invalid role", () => {
      const result = inviteMemberSchema.safeParse({
        email: "alice@example.com",
        role: "SUPERADMIN",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("updateMemberRoleSchema", () => {
    it("should validate allowed role changes", () => {
      expect(updateMemberRoleSchema.safeParse({ role: "ADMIN" }).success).toBe(true)
      expect(updateMemberRoleSchema.safeParse({ role: "MEMBER" }).success).toBe(true)
      expect(updateMemberRoleSchema.safeParse({ role: "OWNER" }).success).toBe(false)
    })
  })

  describe("acceptInvitationSchema", () => {
    it("should validate non-empty token", () => {
      expect(acceptInvitationSchema.safeParse({ token: "tok-12345" }).success).toBe(true)
      expect(acceptInvitationSchema.safeParse({ token: "" }).success).toBe(false)
    })
  })
})
