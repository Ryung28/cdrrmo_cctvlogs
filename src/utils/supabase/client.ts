import { createBrowserClient } from "@supabase/ssr";

/**
 * The Face: Supabase Browser Client helper.
 * Used for client-side interactions and real-time subscriptions.
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
