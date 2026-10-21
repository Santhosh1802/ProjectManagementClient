// features/tasks/schema/task.schema.ts

import { z } from "zod"

const taskStatuses = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
] as const

const taskPriorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(150, "Task title must be 150 characters or less."),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less.")
    .optional()
    .or(z.literal("")),

  taskStatus: z.enum(taskStatuses, {
    message: "Please select a valid task status.",
  }),

  taskPriority: z.enum(taskPriorities, {
    message: "Please select a valid task priority.",
  }),

  projectId: z
    .string()
    .trim()
    .min(1, "Project is required."),

  assignedToId: z
    .string()
    .trim()
    .min(1, "Assignee is required."),

  dueDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/,
      "Please select a valid due date and time.",
    )
    .nullable()
    .optional()
    .or(z.literal("")),
})

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>

export const editTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(150, "Task title must be 150 characters or less."),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less.")
    .optional()
    .or(z.literal("")),

  taskStatus: z.enum(taskStatuses, {
    message: "Please select a valid task status.",
  }),

  taskPriority: z.enum(taskPriorities, {
    message: "Please select a valid task priority.",
  }),

  projectId: z
    .string()
    .trim()
    .min(1, "Project is required."),

  assignedToId: z
    .string()
    .trim()
    .min(1, "Assignee is required."),

  dueDate: z
    .string()
    .nullable()
    .optional()
    .or(z.literal("")),
})

export type EditTaskFormValues = z.infer<typeof editTaskSchema>