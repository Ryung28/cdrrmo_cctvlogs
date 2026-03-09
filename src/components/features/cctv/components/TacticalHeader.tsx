import { LayoutGrid, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface TacticalHeaderProps {
    period: 'monthly' | 'quarterly' | 'yearly';
    onPeriodChange: (period: 'monthly' | 'quarterly' | 'yearly') => void;
    actionType: string | null;
    onActionTypeChange: (type: any) => void;
    searchQuery: string;
    onSearchChange: (val: string) => void;
}

export default function TacticalHeader({
    period,
    onPeriodChange,
    actionType,
    onActionTypeChange,
    searchQuery,
    onSearchChange
}: TacticalHeaderProps) {
    return (
        <div className="w-full h-full grid grid-cols-[auto_1fr_auto] items-center gap-0 overflow-hidden px-4">
            {/* Column 1: Branding (Condensed) */}
            <div className="flex items-center gap-4 flex-shrink-0 pr-8 md:pr-10 lg:pr-12 border-r border-white/10 h-full min-[1920px]:pr-16">
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 min-[1920px]:w-14 min-[1920px]:h-14 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center relative z-10 shadow-xl overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-7 h-7 min-[1920px]:w-10 min-[1920px]:h-10 object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent pointer-events-none" />
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-[20px] min-[1920px]:text-[24px] font-black text-white italic leading-[0.8] tracking-tighter uppercase whitespace-nowrap">
                        CCTV <span className="text-blue-600">LOGBOOK</span>
                    </h1>
                    <h2 className="text-[16px] min-[1920px]:text-[20px] font-black text-white italic leading-none tracking-tighter uppercase whitespace-nowrap mt-0.5">
                        DATABASE
                    </h2>
                    <p className="text-[8px] min-[1920px]:text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] whitespace-nowrap mt-1">
                        Oroquieta City Command Center
                    </p>
                </div>
            </div>

            {/* Column 2: Tactical Center (Categories Only) */}
            <div className="flex-1 flex flex-col items-center justify-center h-full px-8 gap-0 py-2 min-w-0">
                {/* Categories */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-2xl min-[1920px]:max-w-3xl">
                    {([
                        { label: 'CCTV REVIEW', val: 'CCTV Review' },
                        { label: 'EXTRACT FOOTAGE', val: 'Footage Extraction' },
                        { label: 'OFFLINE CAMERA', val: 'Offline Cameras' }
                    ]).map((item) => (
                        <button
                            key={item.label}
                            onClick={() => onActionTypeChange(actionType === item.val ? null : item.val)}
                            className={clsx(
                                "relative py-3.5 min-[1920px]:py-4.5 text-[9px] min-[1920px]:text-[11px] font-black uppercase tracking-widest transition-all border rounded-md truncate px-4 overflow-hidden group/btn",
                                actionType === item.val
                                    ? "bg-blue-600/20 text-blue-100 border-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.15)] shadow-inner"
                                    : "bg-slate-900/40 backdrop-blur-md text-slate-500 border-white/[0.03] hover:text-slate-300 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                        >
                            {/* Glass Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />

                            <span className="relative z-10 drop-shadow-sm">{item.label}</span>

                            {/* Active Indicator Bar */}
                            <div className={clsx(
                                "absolute bottom-0 left-0 h-[2px] transition-all duration-500 bg-blue-500",
                                actionType === item.val ? "w-full opacity-100" : "w-0 opacity-0"
                            )} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Column 3: Temporal Filters (Compact) */}
            <div className="flex items-center flex-shrink-0 pl-8 min-[1920px]:pl-16 border-l border-white/10 h-full">
                <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center bg-slate-950/40 p-0.5 border border-white/5 rounded-sm">
                        {(['monthly', 'quarterly', 'yearly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPeriodChange(p)}
                                className={clsx(
                                    "px-4 py-1.5 min-[1920px]:px-6 min-[1920px]:py-2.5 text-[8px] min-[1920px]:text-[10px] font-black uppercase tracking-widest transition-all border border-transparent whitespace-nowrap rounded-sm",
                                    period === p
                                        ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                        : "text-slate-600 hover:text-slate-400 hover:bg-white/5"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
