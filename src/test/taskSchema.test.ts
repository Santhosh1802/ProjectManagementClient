import { describe, it, expect } from "vitest"
import { createTaskSchema, editTaskSchema } from "../features/tasks/schema/task.schema"

describe("Task Zod Schemas", () => {
  describe("createTaskSchema", () => {
    it("validates valid task creation inputs", () => {
      const validData = {
        title: "Build landing page",
        description: "Set up hero section",
        taskStatus: "TODO" as const,
        taskPriority: "HIGH" as const,
        projectId: "proj-123",
        assignedToId: "user-456",
        dueDate: "2026-11-01T12:00",
      }

      const result = createTaskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("rejects empty title", () => {
      const invalidData = {
        title: "   ",
        taskStatus: "TODO" as const,
        taskPriority: "MEDIUM" as const,
        projectId: "proj-123",
        assignedToId: "user-456",
      }

      const result = createTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Task title is required")
      }
    })

    it("rejects invalid status", () => {
      const invalidData = {
        title: "Valid Title",
        taskStatus: "INVALID_STATUS" as any,
        taskPriority: "LOW" as const,
        projectId: "proj-123",
        assignedToId: "user-456",
      }

      const result = createTaskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("editTaskSchema", () => {
    it("validates required fields for edit", () => {
      const validEdit = {
        title: "Updated Task Title",
        description: "New details",
        taskStatus: "IN_PROGRESS" as const,
        taskPriority: "URGENT" as const,
        projectId: "proj-1",
        assignedToId: "user-2",
        dueDate: null,
      }

      const result = editTaskSchema.safeParse(validEdit)
      expect(result.success).toBe(true)
    })

    it("fails when assignee is missing", () => {
      const invalidEdit = {
        title: "Updated Task Title",
        taskStatus: "IN_PROGRESS" as const,
        taskPriority: "URGENT" as const,
        projectId: "proj-1",
        assignedToId: "",
      }

      const result = editTaskSchema.safeParse(invalidEdit)
      expect(result.success).toBe(false)
    })
  })
})
