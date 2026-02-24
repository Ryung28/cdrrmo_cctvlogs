import Image from "next/image";
import { getLogsAction } from "@/app/actions/cctv_actions";
import CctvForm from "@/components/features/cctv/CctvForm";
import { CctvLogModel } from "@/lib/schemas/cctv_schema";

// Server Component - fetches data on the server
export default async function Home({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const page = Number((await searchParams).page) || 1;
    const { logs, total, stats } = await getLogsAction(page);

    return (
        <main className="min-h-screen py-16 px-4 relative flex flex-col items-center overflow-x-hidden">
            {/* Visual Background Layers (Premium Architecture) */}
            <div className="bg-grid-sub" />
            <div className="bg-grid" />

            {/* Atmospheric Blooms */}
            <div className="bg-bloom top-[-400px] left-[-200px]" />
            <div className="bg-bloom bottom-[-400px] right-[-200px] opacity-60" />

            {/* Floating Geometric Elements */}
            <div className="geometric-box top-[10%] left-[5%] rotate-[15deg] animate-pulse" />
            <div className="geometric-box bottom-[15%] right-[8%] rotate-[-12deg] opacity-50" />
            <div className="geometric-box top-[40%] right-[-50px] rotate-[45deg] scale-150 border-white/5" />

            <div className="max-w-4xl w-full z-10">
                {/* Header Section: Logbook Style */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-white/5 pb-10">
                    <div className="text-center md:text-left space-y-4">
                        <h1 className="text-6xl font-black text-white leading-[0.8] tracking-tighter uppercase">
                            CCTV<br />
                            <span className="text-blue-500">Logbook</span>
                        </h1>

                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] pt-2">
                            Official Incident Recording System
                        </p>
                    </div>

                    <div className="relative group p-2">
                        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
                        <Image
                            src="/logo.png"
                            alt="CDRRMO Logo"
                            width={140}
                            height={140}
                            className="relative object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* The Digital Logbook Form - wakes up first (Selective Hydration) */}
                {/* CctvForm contains both the form and log list with optimistic updates */}
                <div className="enterprise-card p-6 md:p-10 mb-12">
                    <CctvForm
                        allLogs={logs}
                        totalCount={total}
                        currentPage={page}
                        globalStats={stats}
                    />
                </div>

                {/* Security & Access Disclaimer */}
                <div className="mt-12 text-center opacity-40 select-none">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        For Authorized Radio Room Use Only
                    </p>
                </div>
            </div>
        </main>
    );
}
