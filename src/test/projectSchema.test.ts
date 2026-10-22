import { describe, it, expect } from "vitest"
import { createProjectSchema } from "../features/projects/schemas/createProject.schema"

describe("createProjectSchema", () => {
  const validProject = {
    name: "Enterprise Cloud Migration",
    description: "Migrating legacy infrastructure to modern cloud services.",
    startDate: "2026-11-01",
    dueDate: "2026-12-01",
  }

  it("validates a proper project payload", () => {
    const result = createProjectSchema.safeParse(validProject)
    expect(result.success).toBe(true)
  })

  it("rejects project name shorter than 5 characters", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      name: "App",
    })
    expect(result.success).toBe(false)
  })

  it("rejects project description shorter than 10 characters", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      description: "Too short",
    })
    expect(result.success).toBe(false)
  })

  it("fails when dueDate is before startDate", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      startDate: "2026-11-10",
      dueDate: "2026-11-01",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Due date must be on or after the start date."
      )
    }
  })

  it("rejects invalid date format", () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      startDate: "01-11-2026",
    })
    expect(result.success).toBe(false)
  })
})
