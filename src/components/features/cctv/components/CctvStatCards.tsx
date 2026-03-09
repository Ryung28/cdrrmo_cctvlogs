'use client';

import { clsx } from 'clsx';
import { ScanSearch, FileVideo, VideoOff } from 'lucide-react';
import { CctvLog } from '@/lib/schemas/cctv_schema';

const ACTION_TYPES = [
    { id: 'CCTV Review', icon: ScanSearch, label: 'CCTV Review' },
    { id: 'Footage Extraction', icon: FileVideo, label: 'Footage Extraction' },
    { id: 'Offline Cameras', icon: VideoOff, label: 'Offline Camera' },
] as const;

interface CctvStatCardsProps {
    stats: {
        reviews: number;
        extractions: number;
        offline: number;
    };
    filterCategory: CctvLog['action_type'] | null;
    onToggleFilter: (category: CctvLog['action_type'] | null) => void;
}

export default function CctvStatCards({ stats, filterCategory, onToggleFilter }: CctvStatCardsProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            {ACTION_TYPES.map((item) => {
                const count = item.id === 'CCTV Review' ? stats.reviews : item.id === 'Footage Extraction' ? stats.extractions : stats.offline;
                const isFiltering = filterCategory === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggleFilter(isFiltering ? null : item.id as CctvLog['action_type'])}
                        className={clsx(
                            "flex-1 relative group p-4 rounded-xl border transition-all duration-300 overflow-hidden text-left",
                            isFiltering
                                ? "bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50"
                                : "bg-slate-900/40 border-white/5 hover:border-white/10"
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <item.icon className={clsx("w-6 h-6 transition-colors duration-300", isFiltering ? "text-blue-500" : "text-slate-500 group-hover:text-slate-400")} />
                            <span className={clsx("text-xl font-black tracking-tight", isFiltering ? "text-white" : "text-slate-600 group-hover:text-slate-400")}>{count}</span>
                        </div>
                        <div className="mt-3">
                            <h3 className={clsx("text-[9px] font-black tracking-[0.2em] uppercase", isFiltering ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400")}>{item.label}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
                                {isFiltering ? "Viewing Respective Data" : "Click to view logs"}
                            </p>
                        </div>
                        {isFiltering && <div className="absolute top-0 right-0 w-10 h-10 bg-blue-500/10 blur-2xl -mr-4 -mt-4 opacity-100" />}
                    </button>
                );
            })}
        </div>
    );
}
