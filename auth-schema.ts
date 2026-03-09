import { z } from "zod";

/**
 * The Brain: Strict validation for the login process.
 */
export const loginSchema = z.object({
    email: z.string().email("Invalid email address format."),
    password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;