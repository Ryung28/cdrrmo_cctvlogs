import Image from "next/image";
import { getLogsAction } from "@/app/actions/cctv_actions";
import CctvForm from "@/components/features/cctv/CctvForm";
import { CctvLogModel } from "@/lib/schemas/cctv_schema";

// Server Component - fetches data on the server
export default async function Home({
    searchParams
}: {
    searchParams: Promise<{ page?: string; category?: string; startDate?: string; endDate?: string }>
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const actionType = params.category || undefined;
    const startDate = params.startDate || undefined;
    const endDate = params.endDate || undefined;

    const { logs, total, stats } = await getLogsAction(page, 10, actionType, startDate, endDate);

    return (
        <main className="w-full h-screen relative overflow-hidden bg-[#0f172a]">
            {/* 1. Global Tactical Injection */}
            <CctvForm
                allLogs={logs}
                totalCount={total}
                currentPage={page}
                globalStats={stats}
                initialCategory={actionType}
                initialStartDate={startDate}
                initialEndDate={endDate}
            />

            {/* Background Texture (Preserving Depth) */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="bg-grid-sub" />
                <div className="bg-bloom top-[-500px] left-[-300px]" />
                <div className="bg-bloom bottom-[-500px] right-[-300px]" />
            </div>
        </main>
    );
}
