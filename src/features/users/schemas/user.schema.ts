import { z } from "zod"

export const userSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string()
    .min(1, "Last name must be at least 1 character.")
    .max(50, "Last name must be at most 50 characters."),
  email: z.string().email("Enter a valid email address"),
  role: z.string(),
})

export const createUserSchema = userSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters."),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
