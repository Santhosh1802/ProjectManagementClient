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
    .max(100, "Task title must be 100 characters or less."),

  description: z
    .string()
    .trim()
    .min(10, "Description must be between 10 and 300 characters.")
    .max(300, "Description must be between 10 and 300 characters."),

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
    .trim()
    .min(1, "Due date and time is required.")
    .regex(
      /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/,
      "Please select a valid due date and time.",
    ),
})

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>

export const editTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(100, "Task title must be 100 characters or less."),

  description: z
    .string()
    .trim()
    .min(10, "Description must be between 10 and 300 characters.")
    .max(300, "Description must be between 10 and 300 characters."),

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
    .trim()
    .min(1, "Due date and time is required.")
    .regex(
      /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/,
      "Please select a valid due date and time.",
    ),
})

export type EditTaskFormValues = z.infer<typeof editTaskSchema>