'use client';

import { clsx } from 'clsx';
import { ChevronDown, CheckCircle2, ScanSearch, FileVideo, VideoOff } from 'lucide-react';
import { CctvLog } from '@/lib/schemas/cctv_schema';
import FloatingOverlay from '@/components/shared/FloatingOverlay';

const ACTION_TYPES = [
    { id: 'CCTV Review', icon: ScanSearch, label: 'CCTV Review' },
    { id: 'Footage Extraction', icon: FileVideo, label: 'Footage Extraction' },
    { id: 'Offline Cameras', icon: VideoOff, label: 'Offline Camera' },
] as const;

interface CctvLogTypeSelectorProps {
    value: CctvLog['action_type'] | null;
    onChange: (value: CctvLog['action_type']) => void;
    isOpen: boolean;
    onToggle: () => void;
    error?: string;
}

export default function CctvLogTypeSelector({ value, onChange, isOpen, onToggle, error }: CctvLogTypeSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="enterprise-label font-outfit tracking-widest text-slate-500">WHAT TYPE OF LOG ARE YOU RECORDING?</label>
            <FloatingOverlay
                isOpen={isOpen}
                onClose={onToggle}
                className="w-[var(--radix-popper-anchor-width)]"
                trigger={
                    <button
                        type="button"
                        onClick={onToggle}
                        className="enterprise-input flex items-center justify-between cursor-pointer !bg-slate-950/50 w-full"
                    >
                        <span className="flex items-center gap-3">
                            {value ? (
                                <>
                                    {(() => {
                                        const icon = ACTION_TYPES.find(t => t.id === value)?.icon || ScanSearch;
                                        const Icon = icon;
                                        return <Icon className="w-5 h-5 text-blue-500" />;
                                    })()}
                                    <span className="font-bold">{value}</span>
                                </>
                            ) : (
                                <span className="text-slate-500">Pick a log category...</span>
                            )}
                        </span>
                        <ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                    </button>
                }
            >
                <div className="w-full bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 animate-in fade-in slide-in-from-top-2">
                    {ACTION_TYPES.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                onChange(item.id as CctvLog['action_type']);
                                onToggle();
                            }}
                            className={clsx(
                                "w-full flex items-center gap-3 px-5 py-4 text-left transition-all border-b border-white/5 last:border-0 group",
                                value === item.id ? "bg-blue-600/10" : "hover:bg-white/5"
                            )}
                        >
                            <item.icon className={clsx("w-5 h-5 transition-colors", value === item.id ? "text-blue-400" : "text-blue-500/70 group-hover:text-blue-400")} />
                            <span className={clsx("font-medium transition-colors", value === item.id ? "text-blue-100" : "text-slate-300 group-hover:text-white")}>{item.label}</span>
                            {value === item.id && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                        </button>
                    ))}
                </div>
            </FloatingOverlay>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1">{error}</p>}
        </div>
    );
}
