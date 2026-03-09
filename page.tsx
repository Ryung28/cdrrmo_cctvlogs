import { LoginCard } from "./login-card";

/**
 * The Steel Cage: Absolute Viewport Clamping.
 * THE STEEL CAGE: Absolute Viewport Clamping.
 * Locks the UI to the 14" laptop screen standard.
 */
export default function LoginPage() {
    return (
        <main className="h-screen w-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4">
            {/* Kinetic Standards: GPU accelerated background or subtle animation could go here */}
            <LoginCard />
        </main>
    );
}