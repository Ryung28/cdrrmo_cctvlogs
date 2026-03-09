"use server";

import { createClient } from "@/utils/supabase/server"; // Assuming standard Supabase helper
import { loginSchema, type LoginInput } from "./auth-schema";
import { redirect } from "next/navigation";

export type ActionResponse = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};

/**
 * The Boss: Server Action to handle authentication.
 */
export async function loginAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const rawData = Object.fromEntries(formData.entries());

    // Safety Net: Zod Validation
    const validatedFields = loginSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation failed.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(validatedFields.data);

    if (error) {
        return { success: false, message: error.message };
    }

    redirect("/dashboard");
}

/**
 * The Boss: Server Action to handle secure exit.
 */
export async function logoutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
}