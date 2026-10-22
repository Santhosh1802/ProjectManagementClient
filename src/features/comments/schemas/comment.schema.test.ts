import { describe, it, expect } from "vitest"
import { createCommentSchema } from "../schemas/comment.schema"

describe("createCommentSchema", () => {
  it("should validate a valid comment request", () => {
    const validData = {
      taskId: "123e4567-e89b-12d3-a456-426614174000",
      content: "This is a meaningful comment.",
    }

    const result = createCommentSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("should reject an invalid task UUID", () => {
    const invalidData = {
      taskId: "invalid-uuid",
      content: "Nice work",
    }

    const result = createCommentSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Invalid task ID")
    }
  })

  it("should reject an empty comment content", () => {
    const emptyContent = {
      taskId: "123e4567-e89b-12d3-a456-426614174000",
      content: "   ",
    }

    const result = createCommentSchema.safeParse(emptyContent)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Comment cannot be empty")
    }
  })

  it("should reject comment exceeding max length", () => {
    const longContent = {
      taskId: "123e4567-e89b-12d3-a456-426614174000",
      content: "a".repeat(4001),
    }

    const result = createCommentSchema.safeParse(longContent)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Comment cannot exceed 4000 characters")
    }
  })
})
