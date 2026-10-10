import { z } from "zod"

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required.")
      .max(100, "Project name must be 100 characters or less."),

    description: z
      .string()
      .trim()
      .min(10,"Description must be at-least 10 characters or more.")
      .max(1000, "Description must be 1000 characters or less.")
      .or(z.literal("")),

    startDate: z
      .string()
      .min(1, "Start date is required.")
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Please select a valid start date.",
      ),

    dueDate: z
      .string()
      .min(1, "Due date is required.")
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Please select a valid due date.",
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.startDate || !data.dueDate) {
      return
    }

    if (data.dueDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date must be on or after the start date.",
      })
    }
  })

export type CreateProjectFormValues = z.infer<
  typeof createProjectSchema
>