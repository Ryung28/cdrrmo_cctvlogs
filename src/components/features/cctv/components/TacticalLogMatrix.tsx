'use client';

import { useState, useTransition } from 'react';
import { CctvLogModel } from '@/lib/schemas/cctv_schema';
import { deleteLogAction } from '@/app/actions/cctv_actions';
import { notify } from '@/lib/utils/notifications';
import {
    Trash2, Clock, MapPin, ChevronDown, ChevronUp, User, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import InformationMatrix from '@/app/actions/InformationMatrix';

interface TacticalLogMatrixProps {
    logs: CctvLogModel[];
    onLogSelect?: (id: string) => void;
    selectedLogId?: string | null;
    activeTab: 'review' | 'extraction';
    onTabChange: (tab: 'review' | 'extraction') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    isExpanded?: boolean;
}

export default function TacticalLogMatrix({
    logs,
    onLogSelect,
    selectedLogId,
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    isExpanded
}: TacticalLogMatrixProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleLogSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onLogSelect) onLogSelect(id);
    };

    const handleDelete = async (id: string) => {
        notify.confirm('Terminal: Confirm deletion of entry?', async () => {
            setDeletingId(id);
            startTransition(async () => {
                const result = await deleteLogAction(id);
                if (result.error) {
                    notify.removal(false, 'System Error: Deletion Failed');
                    setDeletingId(null);
                } else {
                    notify.removal(true, 'System: Entry Terminated');
                }
            });
        });
    };

    const getStatusStyle = (type: string) => {
        switch (type) {
            case 'CCTV Review': return 'border-blue-500/30 text-blue-400 bg-blue-500/5';
            case 'Footage Extraction': return 'border-blue-600/30 text-blue-300 bg-blue-600/5';
            case 'Offline Cameras': return 'border-red-500/30 text-red-500 bg-red-500/5';
            default: return 'border-slate-500/30 text-slate-400 bg-slate-500/5';
        }
    };

    return (
        <InformationMatrix isExpanded={isExpanded || false}>
            <div className={clsx(
                "w-full h-full flex flex-col bg-[#0f172a]/5 relative overflow-hidden border-b border-white/5 selection:bg-blue-500/30",
                "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                // Kinetic fix: removed translate-y-[20%] to eliminate void space
                "translate-y-0 opacity-100"
            )}>
                {/* 1. Integrated Tabs & Search (Asymmetric Tactical Row) */}
                <div className="grid grid-cols-12 bg-[#0f172a]/80 border-b border-white/5 backdrop-blur-md items-center">
                    {/* Column A: Tab Selectors (Clamped Left) */}
                    <div className="col-span-12 lg:col-span-5 flex divide-x divide-white/5 border-r border-white/5">
                        {(['review', 'extraction'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange(tab)}
                                className={clsx(
                                    "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group",
                                    activeTab === tab ? "text-white bg-white/[0.02]" : "text-slate-600 hover:text-slate-400"
                                )}
                            >
                                {tab === 'review' ? 'CCTV Review' : 'Footage Extraction'}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Column B: Tactical Search & Pagination (Asymmetric Right Clamping) */}
                    <div className="col-span-12 lg:col-span-7 px-6 flex items-center h-full group gap-4">
                        <div className="relative flex-1 max-w-lg ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="FILTER_MATRIX_DATA..."
                                className="w-full bg-slate-950/40 border border-white/5 py-1.5 pl-9 pr-4 text-[9px] font-black text-blue-400 placeholder:text-slate-800 focus:outline-none focus:border-blue-500/20 focus:bg-[#0c1425] uppercase tracking-[0.2em] transition-all rounded-sm italic"
                            />
                        </div>

                        {/* TACTICAL SIDE ARROWS (Pagination HUD) */}
                        <div className="flex items-center gap-1 border-l border-white/5 pl-4 py-3 shrink-0">
                            <div className="flex flex-col items-end mr-3">
                                <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest leading-none mb-0.5">PAGE</span>
                                <span className="text-[10px] font-mono font-black text-blue-500 italic leading-none">
                                    {String(currentPage).padStart(2, '0')} // {String(totalPages).padStart(2, '0')}
                                </span>
                            </div>

                            <div className="flex gap-1">
                                <button
                                    onClick={() => onPageChange?.(currentPage - 1)}
                                    disabled={currentPage <= 1 || isPending}
                                    className="w-8 h-8 flex items-center justify-center rounded-md border border-white/5 bg-slate-950/40 text-slate-600 hover:text-white hover:border-blue-500/30 transition-all disabled:opacity-20 disabled:hover:text-slate-600 group/nav"
                                >
                                    <ChevronLeft className="w-4 h-4 transition-transform group-hover/nav:-translate-x-0.5" />
                                </button>
                                <button
                                    onClick={() => onPageChange?.(currentPage + 1)}
                                    disabled={currentPage >= totalPages || isPending}
                                    className="w-8 h-8 flex items-center justify-center rounded-md border border-white/5 bg-slate-950/40 text-slate-600 hover:text-white hover:border-blue-500/30 transition-all disabled:opacity-20 disabled:hover:text-slate-600 group/nav"
                                >
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover/nav:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2 & 3. Tactical Matrix with Extreme Compression & Grid Clamping */}
                <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-hidden">
                    <div className="w-full h-full flex flex-col">
                        {/* 2. Tactical Grid Header - Asymmetric Pruning */}
                        <div className="grid grid-cols-[minmax(140px,1.2fr)_110px_130px_110px_minmax(160px,2fr)_50px] bg-slate-900/60 border-y border-white/5 px-6 items-center h-10 shrink-0">
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-2 border-r border-white/[0.03]">CLIENT</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 border-r border-white/[0.03]">DATE AND TIME</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 border-r border-white/[0.03]">CAMERA USED</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 border-r border-white/[0.03]">CONTACT</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 border-r border-white/[0.03]">REMARKS</div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">CMD</div>
                        </div>

                        {/* 3. Operational Grid - Kinetic Compressed Matrix */}
                        <div className="overflow-y-auto scrollbar-hide perspective-[1000px]">
                            <div className="divide-y divide-white/[0.03]">
                                {logs.slice(0, 5).map((log, index) => {
                                    const isSelected = selectedLogId === log.id;
                                    const isDeleting = deletingId === log.id;
                                    const isPendingSync = log.id.startsWith('temp-');
                                    const logTime = new Date(log.created_at).getTime();
                                    const isRecent = (new Date().getTime() - logTime) < 24 * 60 * 60 * 1000;

                                    return (
                                        <div
                                            key={log.id}
                                            onClick={(e) => handleLogSelect(log.id, e)}
                                            style={{
                                                '--stagger': index,
                                                willChange: 'transform, opacity'
                                            } as any}
                                            className={clsx(
                                                "grid grid-cols-[minmax(140px,1.2fr)_110px_130px_110px_minmax(160px,2fr)_50px] transition-all cursor-pointer relative items-center hover:bg-white/[0.01] px-6 h-[52px] group/row",
                                                "animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both",
                                                isSelected && "bg-blue-600/[0.06] shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]",
                                                (isDeleting || isPendingSync) && "opacity-40 grayscale pointer-events-none"
                                            )}
                                        >
                                            {/* Layered Action Accent (Decoupled Kinetic Layer) */}
                                            <div className={clsx(
                                                "absolute left-0 w-1 h-3/4 rounded-r-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] scale-y-0 group-hover/row:scale-y-100",
                                                isSelected ? "scale-y-100 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/10"
                                            )} />

                                            {/* Client Column - With subtle action accent */}
                                            <div className="flex flex-col py-2 px-2 border-r border-white/5 min-w-0 relative">
                                                {/* Action Type accent line */}
                                                <div className={clsx(
                                                    "absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 rounded-full opacity-50",
                                                    log.action_type === 'CCTV Review' ? 'bg-blue-500' : 'bg-blue-400'
                                                )} />
                                                <div className="flex items-center gap-2 mb-0.5 ml-2">
                                                    <span className="text-[11px] font-bold text-white uppercase tracking-tight leading-none truncate group-hover/row:text-blue-400 transition-colors">
                                                        {log.client_name || 'N/A'}
                                                    </span>
                                                    {isRecent && <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />}
                                                </div>
                                                <span className="text-[7px] font-mono font-bold text-slate-700 uppercase tracking-widest ml-2">
                                                    #{log.id.slice(0, 4)}
                                                </span>
                                            </div>

                                            {/* Date Stamp */}
                                            <div className="px-4 border-r border-white/5 flex items-center justify-center">
                                                <span className="text-[9px] font-mono text-white/40 font-bold whitespace-nowrap group-hover/row:text-white/60 transition-colors">
                                                    {log.incident_datetime?.split(' ')[0] || log.date_of_action?.split(' ')[0] || '---'}
                                                </span>
                                            </div>

                                            {/* Camera Station */}
                                            <div className="px-4 border-r border-white/5 flex items-center h-full min-w-0">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate group-hover/row:text-slate-400">
                                                    {log.camera_name || 'STATION_00'}
                                                </span>
                                            </div>

                                            {/* Contact Column */}
                                            <div className="px-4 border-r border-white/5 flex items-center h-full">
                                                <span className="text-[9px] font-mono text-slate-600 font-bold tracking-tighter whitespace-nowrap group-hover/row:text-slate-400">
                                                    {log.contact_number || '---'}
                                                </span>
                                            </div>

                                            {/* Remarks Column */}
                                            <div className="px-4 border-r border-white/5 flex items-center h-full min-w-0">
                                                <span className="text-[9px] text-slate-600 lg:text-slate-500 truncate block font-medium group-hover/row:text-slate-300 transition-colors">
                                                    {log.remarks || '---'}
                                                </span>
                                            </div>

                                            {/* Cmd Interaction */}
                                            <div className="flex items-center justify-center h-full">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                                                    className="p-1.5 text-slate-800 hover:text-red-500 transition-all duration-300 hover:scale-125"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {logs.length === 0 && (
                                <div className="p-20 text-center">
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em]">Awaiting Data Feed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </InformationMatrix>
    );
}
