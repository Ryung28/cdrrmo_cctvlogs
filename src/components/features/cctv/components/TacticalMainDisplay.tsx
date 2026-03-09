import { useState, useEffect } from 'react';
import { User, Phone, MapPin, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { clsx } from 'clsx';

interface TacticalMainDisplayProps {
    clientData?: {
        name: string;
        contact: string;
        address: string;
    };
    children: React.ReactNode;
    isFocused?: boolean;
    onFocusToggle?: () => void;
}

export default function TacticalMainDisplay({
    clientData,
    children,
    isFocused = false,
    onFocusToggle
}: TacticalMainDisplayProps) {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [isLiveStreaming, setIsLiveStreaming] = useState(false);

    // Identity Mapping: Auto-reveal when data is selected
    useEffect(() => {
        if (clientData?.name) {
            setIsDetailsVisible(true);
        } else {
            setIsDetailsVisible(false);
            setIsLiveStreaming(false);
        }
    }, [clientData?.name]);

    return (
        <div
            className={clsx(
                "w-full h-full bg-[#0f172a]/40 relative min-w-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]",
                // Kinetic Height Variable System (312px Strict Matrix Cap)
                "[--matrix-h:312px] [--shaft-h:330px]",
                "min-[1920px]:[--matrix-h:312px] min-[1920px]:[--shaft-h:630px]"
            )}
        >
            <div className="flex flex-col h-full relative overflow-hidden">
                {/* 1 & 2. SHARED VIEWPORT ANCHOR (Responsive Flex Shaft) */}
                <div
                    className={clsx(
                        "w-full border-b border-blue-500/10 transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] overflow-hidden flex flex-col z-40",
                        // Eliminate Unused Vertical Space: Snapshot takes all remaining space
                        "flex-1 min-h-0"
                    )}
                >
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative group/viewport">
                        {/* 1. ADAPTIVE SNAPSHOT AREA */}
                        <div className={clsx(
                            "bg-[#0c1425] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]",
                            isDetailsVisible ? "flex-1 opacity-60 grayscale-[0.5]" : "flex-1 opacity-100 grayscale-0",
                            isFocused && "pt-8"
                        )}>
                            <div className={clsx(
                                "tactical-header-clip absolute left-0 bg-blue-600 text-white scale-75 origin-top-left font-black tracking-widest px-4 py-1 z-10 uppercase transition-all duration-700",
                                isFocused ? "top-3" : "top-0"
                            )}>
                                {isLiveStreaming ? 'LIVE_INTEL_STREAM' : 'Snapshot'}
                            </div>

                            {/* Premium LIGTAS Brand Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center p-12 overflow-hidden pointer-events-none">
                                <div className={clsx(
                                    "flex flex-col items-center gap-6 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] w-full h-full",
                                    isLiveStreaming ? "scale-110 opacity-20 blur-sm" : "scale-100 opacity-100"
                                )}>
                                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-blue-500 blur-[100px] opacity-20 animate-pulse w-64 h-64 mx-auto rounded-full" />
                                        <img
                                            src="/logo.png"
                                            alt="LIGTAS_CORE"
                                            className="max-w-full max-h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(37,99,235,0.4)] brightness-[1.15]"
                                        />
                                        <div className="mt-8 transition-opacity duration-700 delay-300">
                                            <span className="text-[14px] font-black tracking-[0.8em] text-white/50 uppercase pl-[0.8em]">CDRRMO DATA CENTER</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating EXPAND Toggle */}
                            <div className="absolute bottom-4 right-6 z-30">
                                <button
                                    onClick={onFocusToggle}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 font-black tracking-widest shadow-lg",
                                        isFocused
                                            ? "bg-blue-600 border-blue-400 text-white shadow-blue-500/20"
                                            : "bg-slate-900/80 border-white/10 text-slate-400 hover:text-white hover:border-blue-500/40"
                                    )}
                                >
                                    <Maximize2 className={clsx("w-3.5 h-3.5 transition-transform duration-500", isFocused && "rotate-45")} />
                                    <span className="text-[9px] uppercase">{isFocused ? 'COLLAPSE' : 'EXPAND'}</span>
                                </button>
                            </div>

                            <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                <div className={clsx(
                                    "w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px]",
                                    isLiveStreaming ? "bg-green-500 shadow-green-500" : "bg-blue-500 shadow-blue-500"
                                )} />
                            </div>
                        </div>

                        {/* 2. MICRO-IDENTITY HUD */}
                        <div className={clsx(
                            "z-40 bg-slate-900/95 backdrop-blur-2xl border-t border-white/[0.05] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] overflow-hidden flex flex-col shrink-0",
                            isDetailsVisible ? "h-[120px] opacity-100" : "h-0 opacity-0 pointer-events-none"
                        )}>
                            <div className="w-full h-full max-w-[95vw] lg:max-w-[98vw] 2xl:max-w-[1800px] mx-auto flex gap-8 px-8 items-center overflow-hidden">
                                <div className="relative shrink-0">
                                    <div className="w-18 h-18 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-xl flex items-center justify-center shadow-2xl relative group overflow-hidden">
                                        <User className="w-9 h-9 text-blue-500/50 group-hover:text-blue-400 transition-colors" />
                                        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-500/40" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0 relative">
                                            <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,black_85%,transparent)]">
                                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic truncate leading-none py-1">
                                                    {clientData?.name || 'Awaiting Selection'}
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-6">
                                            <button
                                                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                                                className={clsx(
                                                    "flex items-center gap-3 px-5 py-2 rounded-xl border transition-all duration-300 font-black tracking-[0.15em] shadow-xl",
                                                    isLiveStreaming ? "bg-red-600 border-red-400 text-white shadow-red-500/20" : "bg-green-600 border-green-400 text-white shadow-green-500/20"
                                                )}
                                            >
                                                <div className={clsx("w-2 h-2 rounded-full bg-white", isLiveStreaming && "animate-pulse")} />
                                                <span className="text-[10px] uppercase">{isLiveStreaming ? 'STOP' : 'PLAY'}</span>
                                            </button>
                                            <button onClick={() => setIsDetailsVisible(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-slate-500 hover:text-white border border-white/5">
                                                <ChevronDown className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 text-slate-500">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-white/5 rounded-md"><Phone className="w-3.5 h-3.5 text-blue-500/60" /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-600 tracking-widest uppercase">Contact</span>
                                                <span className="text-xs font-mono font-bold text-slate-400 tracking-tight">{clientData?.contact || '--- --- ----'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-white/5 rounded-md"><MapPin className="w-3.5 h-3.5 text-blue-500/60" /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-600 tracking-widest uppercase">Address</span>
                                                <span className="text-xs font-bold text-slate-400 truncate max-w-md">{clientData?.address || 'Unmapped Location'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Operational Log Window (Intrinsic Height Clamping) */}
                <div
                    className={clsx(
                        "w-full bg-[#0c1425] border-t border-white/5 z-10 transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] overflow-hidden",
                        isFocused ? "h-[120px]" : "h-[var(--matrix-h)]"
                    )}
                    style={{ willChange: 'height' }}
                >
                    <div className="w-full h-full flex flex-col transform-gpu will-change-transform transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]">
                        <div className="flex-1 overflow-x-auto w-full h-full scrollbar-hide">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
