import { z } from "zod";

export const userSchema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters.")
        .max(50, "First name must be at most of 50 characters."),
      lastName: z
        .string()
        .min(1, "Last name must be at least 1 character.")
        .max(50, "Last name must be at most of 50 characters."),
      email: z.email().nonempty("Email is required"),
})