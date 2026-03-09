"use client";

import { logoutAction } from "./auth-actions";

/**
 * The Face: Secure Exit Trigger.
 * Uses a standard form action for reliable server-side redirection.
 */
export function LogoutButton() {
    return (
        <form action={logoutAction}>
            <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Secure Exit
            </button>
        </form>
    );
}