"use client";

import { useActionState } from "react";
import { loginAction } from "./auth-actions";

/**
 * The Face: Enterprise Login UI.
 * Constraints: Position Agnostic, Viewport-Aware.
 */
export function LoginCard() {
    const [state, formAction, isPending] = useActionState(loginAction, {
        success: false,
        message: "",
    });

    return (
        <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">LIGTAS CDRRMO</h1>
                <p className="text-slate-400 text-sm">CCTV Logs & Incident Management</p>
            </div>

            <form action={formAction} className="space-y-6">
                <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="operator@taguig.gov.ph"
                    />
                    {state.errors?.email && <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase mb-2">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    {state.errors?.password && <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                    {isPending ? "Authenticating..." : "Access Command Center"}
                </button>

                {state.message && !state.success && <p className="text-center text-sm text-red-400">{state.message}</p>}
            </form>
        </div>
    );
}