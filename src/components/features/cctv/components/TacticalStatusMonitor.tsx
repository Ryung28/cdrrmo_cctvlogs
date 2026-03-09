'use client';

import { Camera, Radio } from 'lucide-react';
import { clsx } from 'clsx';

interface TacticalStatusMonitorProps {
    offlineCameras: {
        name: string;
        remarks: string;
    }[];
    totalCount: number;
    offlineCount: number;
    isFocused?: boolean;
}

export default function TacticalStatusMonitor({
    offlineCameras,
    totalCount,
    offlineCount,
    isFocused = false
}: TacticalStatusMonitorProps) {
    const percentage = totalCount > 0 ? (offlineCount / totalCount) * 100 : 0;

    return (
        <div className="flex flex-col h-full bg-slate-900/10 divide-y divide-white/5">
            {/* 1. Offline Camera Inventory (Docked) */}
            <div className="flex-1 flex flex-col min-h-0 bg-red-950/5 relative">
                <div className={clsx(
                    "flex items-center justify-between border-b border-white/5 bg-slate-900/40 pr-6 transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] relative z-20",
                    isFocused ? "mt-3 pt-4" : "mt-0 pt-0"
                )}>
                    <div className={clsx(
                        "tactical-header-clip !bg-red-500 !text-white !absolute transition-all duration-700 z-30",
                        isFocused ? "top-3" : "top-0"
                    )}>
                        OFFLINE NODES
                    </div>
                    <Camera className="w-3 h-3 text-red-900" />
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/40 sticky top-0 z-10 backdrop-blur-sm">
                                <th className="p-4 text-[8px] font-black text-slate-500 uppercase tracking-widest border-r border-white/5">Camera ID</th>
                                <th className="p-4 text-[8px] font-black text-slate-500 uppercase tracking-widest">State Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {offlineCameras.map((cam, i) => (
                                <tr key={i} className="group hover:bg-red-500/10 transition-colors bg-white/[0.01]">
                                    <td className="p-4 border-r border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-red-400">
                                                {cam.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[8px] font-bold text-slate-500 uppercase truncate block max-w-[120px]">
                                            {cam.remarks}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {offlineCameras.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="p-10 text-center opacity-20">
                                        <Radio className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-[8px] font-black uppercase tracking-widest">All Nodes Nominal</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. System Overview Summary (Simplified) */}
            <div className="bg-slate-950/60 p-6 border-t border-white/10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Connectivity</p>
                        <span className="text-xs font-black text-white">{totalCount - offlineCount} / {totalCount} Online</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000"
                            style={{ width: `${((totalCount - offlineCount) / (totalCount || 1)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
