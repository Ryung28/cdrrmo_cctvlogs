import { TrendingUp, FileText, Settings, LogOut, Download, Upload, User, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { CctvRepository } from '@/lib/repositories/cctv_repository';
import { CctvLogModel } from '@/lib/schemas/cctv_schema';
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface TacticalSidebarProps {
    stats: {
        total: number;
        reviews: number;
        extractions: number;
        offline: number;
    };
    categoryStats: {
        label: string;
        value: number; // 0 to 100
    }[];
    subCategoryStats: {
        label: string;
        value: number; // 0 to 100
    }[];
    allLogs?: CctvLogModel[];
    onRefresh?: () => void;
    isFocused?: boolean;
}

export default function TacticalSidebar({
    stats,
    categoryStats,
    subCategoryStats,
    allLogs = [],
    onRefresh,
    isFocused = false
}: TacticalSidebarProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. BACKUP (EXPORT)
    const handleExport = async () => {
        try {
            setIsExporting(true);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const dataStr = JSON.stringify(allLogs, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `cctv_backup_${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Backup created successfully');
        } catch (error) {
            toast.error('Export failed');
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    // 2. RESTORE (IMPORT)
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsImporting(true);
            const content = await file.text();
            const data = JSON.parse(content);

            if (!Array.isArray(data)) {
                throw new Error('Invalid backup format: Expected an array of logs');
            }

            const { error } = await CctvRepository.bulkUpsertLogs(data);
            if (error) throw new Error(error);

            toast.success(`Successfully imported ${data.length} records`);
            if (onRefresh) onRefresh();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
            toast.error(error.message || 'Import failed');
            console.error(error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/20 divide-y divide-white/5 relative">
            {/* 1. Global Metric Box (Pinned Top - Condensed clamping) */}
            <div className={clsx(
                "py-4 px-0 bg-slate-900/40 border-b border-blue-500/10 shrink-0 transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] relative z-20",
                isFocused ? "mt-3 pt-4" : "mt-0 pt-0"
            )}>
                <div className="grid grid-cols-2 gap-px bg-white/5">
                    <div className="text-center py-3 bg-slate-950/60">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Total Review</p>
                        <p className="text-2xl font-black text-white italic leading-tight tracking-tighter">{stats.reviews}</p>
                    </div>
                    <div className="text-center py-3 bg-slate-950/60">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Total Extract</p>
                        <p className="text-2xl font-black text-white italic leading-tight tracking-tighter">{stats.extractions}</p>
                    </div>
                </div>
            </div>

            {/* Hidden Input for Import */}
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />

            {/* 2. Main Categories (Tightened Spacing) */}
            <div className="py-6 px-5 space-y-6 shrink-0 overflow-y-auto scrollbar-hide flex-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-3.5 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Log Summary</span>
                </div>
                <div className="space-y-5">
                    {categoryStats.map((stat, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between items-end px-0.5">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                <span className="text-[9px] font-mono text-slate-600 font-bold tracking-tighter">{Math.round(stat.value)}%</span>
                            </div>
                            <div className="tactical-progress-track h-1.5 bg-white/5 overflow-hidden rounded-full">
                                <div className="tactical-progress-fill h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${stat.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-8 flex items-center gap-2.5">
                    <div className="w-1 h-3.5 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">INCIDENT STATS</span>
                </div>
                <div className="space-y-5">
                    {subCategoryStats.map((stat, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between items-center px-0.5">
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">{stat.label}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/80 animate-pulse" />
                                    <span className="text-[8px] font-mono text-slate-700 uppercase font-bold tracking-tighter">Live</span>
                                </div>
                            </div>
                            <div className="tactical-progress-track h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="tactical-progress-fill h-full bg-blue-600/80 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${stat.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. SETTINGS & PROFILE (Enterprise Anchor) */}
            <div className="p-4 border-t border-white/5 bg-slate-900/60 backdrop-blur-md relative shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">SYSTEM CONTROL</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-tight">ERO v2.4.0-SEC</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={clsx(
                            "w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-300",
                            isSettingsOpen
                                ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                : "bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-blue-500/30 shadow-xl"
                        )}
                    >
                        <Settings className={clsx("w-5 h-5 transition-transform duration-500", isSettingsOpen && "rotate-90")} />
                    </button>
                </div>

                {/* 
                    CONFINED TACTICAL OVERLAY 
                    Precise Column Clamping & Bleed Prevention
                */}
                {isSettingsOpen && (
                    <div className="absolute bottom-[calc(100%+0.5rem)] right-0 left-0 mx-2 bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.9)] overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out isolate">
                        {/* Kinetic Fullbleed Anchor Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500/30" />

                        {/* Menu Header: Compact Containment */}
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none mb-0.5">ERO SECURE</span>
                                <span className="text-xs font-black text-white uppercase italic tracking-tighter truncate">COMMAND CONSOLE</span>
                            </div>
                        </div>

                        {/* Menu Groups: Vertical Compaction */}
                        <div className="p-2 space-y-0.5">
                            {/* Profile Console */}
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group/item">
                                <User className="w-4 h-4 text-slate-500 group-hover/item:text-blue-400 transition-colors shrink-0" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-white transition-colors truncate">Admin Profile</span>
                            </button>

                            {/* Backup Utility */}
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group/item disabled:opacity-20"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" /> : <Download className="w-4 h-4 text-slate-500 group-hover/item:text-blue-400 transition-colors shrink-0" />}
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-white transition-colors truncate">Backup Archives</span>
                            </button>

                            {/* Import Utility */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isImporting}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group/item disabled:opacity-20"
                            >
                                {isImporting ? <Loader2 className="w-4 h-4 text-[#bef264] animate-spin shrink-0" /> : <Upload className="w-4 h-4 text-slate-500 group-hover/item:text-[#bef264] transition-colors shrink-0" />}
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-white transition-colors truncate">Restore System</span>
                            </button>

                            <div className="h-px bg-white/5 mx-2 my-1.5" />

                            {/* Session Termination */}
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-600/10 transition-all group/item text-slate-500 hover:text-red-500">
                                <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover/item:-translate-x-0.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest truncate">Secure Exit</span>
                            </button>
                        </div>

                        {/* Compact HUD Footer */}
                        <div className="p-2.5 bg-black/40 border-t border-white/5 text-center">
                            <span className="text-[6.5px] font-black text-slate-700 uppercase tracking-[0.3em]">CDRRMO SECURE INTERFACE // V2.4.0</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
