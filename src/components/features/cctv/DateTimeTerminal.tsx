'use client';

import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Check
} from 'lucide-react';
import { clsx } from 'clsx';
import CompactCalendar from './CompactCalendar';

interface DateTimeTerminalProps {
    value: string; // YYYY-MM-DD HH:mm:ss
    onChange: (value: string) => void;
    onClose: () => void;
}

/**
 * Enterprise Unified Temporal Terminal (V2 - Modern High-Efficiency)
 * High-speed 12-hour selection with forensic precision
 * 
 * SECURITY NOTE: Implements "Wait and See" (Mounting Guard) pattern
 * to prevent Hydration Mismatches in Next.js SSR environment.
 * All time-sensitive logic runs only after client-side mount.
 */
export default function DateTimeTerminal({ value, onChange, onClose }: DateTimeTerminalProps) {
    // 🛡️ HYDRATION SHIELD: Wait until mounted before accessing browser-only APIs
    const [hasMounted, setHasMounted] = useState(false);
    const [currentDate, setCurrentDate] = useState("");
    const [hours, setHours] = useState(12); // 1-12
    const [minutes, setMinutes] = useState(0); // 0-59
    const [seconds, setSeconds] = useState(0); // 0-59
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
    const [timeTab, setTimeTab] = useState<'hour' | 'minute' | 'second'>('hour');
    const [rawInput, setRawInput] = useState(""); // HHMMSS format

    // Sync initial value - only runs on client after mount
    useEffect(() => {
        setHasMounted(true);

        if (value) {
            const [date, time] = value.split(' ');
            setCurrentDate(date || "");
            if (time) {
                const [h, m, s] = time.split(':').map(Number);
                const displayHour = h % 12 || 12;
                setHours(displayHour);
                setMinutes(m || 0);
                setSeconds(s || 0);
                setAmpm(h >= 12 ? 'PM' : 'AM');
                // Sync raw input
                setRawInput(`${displayHour.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}${s.toString().padStart(2, '0')}`);
            }
        } else {
            const now = new Date();
            setCurrentDate(now.toISOString().split('T')[0]);
            const h = now.getHours();
            const displayHour = h % 12 || 12;
            const m = now.getMinutes();
            const s = now.getSeconds();
            setHours(displayHour);
            setMinutes(m);
            setSeconds(s);
            setAmpm(h >= 12 ? 'PM' : 'AM');
            setRawInput(`${displayHour.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}${s.toString().padStart(2, '0')}`);
        }
    }, [value]);

    const handleConfirm = () => {
        // Convert back to 24h for storage
        let h24 = hours;
        if (ampm === 'PM' && hours < 12) h24 += 12;
        if (ampm === 'AM' && hours === 12) h24 = 0;

        const h = h24.toString().padStart(2, '0');
        const m = minutes.toString().padStart(2, '0');
        const s = seconds.toString().padStart(2, '0');
        onChange(`${currentDate} ${h}:${m}:${s}`);
        onClose();
    };

    // 🛡️ STABLE STATE: Render placeholder during SSR and initial client render
    if (!hasMounted) {
        return (
            <div className="z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-slate-950 border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 max-w-fit">
                    {/* Left Side - Placeholder */}
                    <div className="w-[260px] p-2 bg-slate-900/20">
                        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 mb-2">
                            <Calendar className="w-3 h-3 text-blue-400" />
                            <div className="h-2 w-16 bg-slate-700 rounded animate-pulse" />
                        </div>
                        <div className="h-[200px] bg-slate-800/30 rounded-xl animate-pulse" />
                    </div>
                    {/* Right Side - Placeholder */}
                    <div className="w-[260px] p-6 bg-slate-950 flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-3 h-3 text-blue-400" />
                            <div className="h-2 w-20 bg-slate-700 rounded animate-pulse" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 h-[120px] bg-slate-800/30 rounded-xl animate-pulse" />
                            <div className="flex-1 h-[120px] bg-slate-800/30 rounded-xl animate-pulse" />
                            <div className="w-[60px] h-[120px] bg-slate-800/30 rounded-xl animate-pulse" />
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="h-10 bg-slate-800/30 rounded-2xl animate-pulse" />
                            <div className="h-12 bg-slate-800/30 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Generate time options
    const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
    const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const secondOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    const syncRawFromParts = (h: number, m: number, s: number) => {
        setRawInput(`${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}${s.toString().padStart(2, '0')}`);
    };

    const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setRawInput(val);

        if (val.length >= 1) {
            let h = parseInt(val.slice(0, 2));
            if (val.length === 1) h = parseInt(val);

            if (h > 12) {
                // Savy logic: if user types "13", assume 01 PM
                if (h <= 23) {
                    setAmpm('PM');
                    setHours(h === 12 ? 12 : h - 12);
                } else {
                    setHours(12);
                }
            } else if (h === 0) {
                setHours(12);
                setAmpm('AM');
            } else {
                setHours(h);
            }
        }

        if (val.length >= 3) {
            let m = parseInt(val.slice(2, 4));
            if (val.length === 3) m = parseInt(val.slice(2, 3));
            if (m > 59) m = 59;
            setMinutes(m);
            setTimeTab('minute');
        } else if (val.length >= 1) {
            setTimeTab('hour');
        }

        if (val.length >= 5) {
            let s = parseInt(val.slice(4, 6));
            if (val.length === 5) s = parseInt(val.slice(4, 5));
            if (s > 59) s = 59;
            setSeconds(s);
            setTimeTab('second');
        }
    };

    // Handle "Now" preset - needs to be in useEffect to avoid hydration issues
    const handleNowClick = () => {
        const now = new Date();
        const h = now.getHours() % 12 || 12;
        const m = now.getMinutes();
        const s = now.getSeconds();
        const p = now.getHours() >= 12 ? 'PM' : 'AM';
        setHours(h);
        setMinutes(m);
        setSeconds(s);
        setAmpm(p);
        syncRawFromParts(h, m, s);
    };

    return (
        <div className="z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 max-w-fit mx-auto">

                {/* Tactical Date Segment (Left) */}
                <div className="w-[230px] p-3 bg-slate-900/20">
                    <div className="px-2 py-2 border-b border-white/5 flex items-center gap-2 mb-2">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Incident Date</span>
                    </div>
                    <CompactCalendar
                        value={currentDate}
                        onChange={(d) => setCurrentDate(d)}
                        onClose={() => { }}
                    />
                </div>

                {/* Modern Time Segment (Right - Calendar-style Grid) */}
                <div className="w-[280px] p-5 bg-slate-950 flex flex-col min-h-[320px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-blue-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Incident Time</span>
                        </div>
                        {hasMounted && (
                            <button
                                type="button"
                                onClick={handleNowClick}
                                className="text-[8px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors"
                            >
                                Set Now
                            </button>
                        )}
                    </div>

                    {/* Center Content Group: Time Input + AM/PM */}
                    <div className="flex-1 flex flex-col justify-center gap-6">
                        {/* Tactical Terminal Input */}
                        <div className="relative group">
                            <div className="relative flex items-center bg-slate-900/40 border border-white/5 group-hover:border-blue-500/30 rounded-2xl p-5 transition-all h-[80px]">
                                <input
                                    type="text"
                                    value={rawInput}
                                    onChange={handleTimeInputChange}
                                    placeholder="000000"
                                    className="absolute inset-0 opacity-0 cursor-text z-20 w-full"
                                    autoFocus
                                />
                                <div className="flex items-center gap-4 w-full justify-between pointer-events-none">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[7px] font-black text-slate-700 uppercase mb-1">HH</span>
                                            <span className={clsx(
                                                "text-2xl font-mono font-black tracking-widest transition-colors",
                                                rawInput.length >= 2 ? "text-white" : "text-white/20"
                                            )}>
                                                {rawInput.slice(0, 2).padEnd(2, '_')}
                                            </span>
                                        </div>
                                        <span className="text-blue-500/30 text-lg font-black mt-3 animate-pulse">:</span>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[7px] font-black text-slate-700 uppercase mb-1">MM</span>
                                            <span className={clsx(
                                                "text-2xl font-mono font-black tracking-widest transition-colors",
                                                rawInput.length >= 4 ? "text-white" : "text-white/20"
                                            )}>
                                                {rawInput.slice(2, 4).padEnd(2, '_')}
                                            </span>
                                        </div>
                                        <span className="text-blue-500/30 text-lg font-black mt-3 animate-pulse">:</span>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[7px] font-black text-slate-700 uppercase mb-1">SS</span>
                                            <span className={clsx(
                                                "text-2xl font-mono font-black tracking-widest transition-colors",
                                                rawInput.length >= 6 ? "text-white" : "text-white/20"
                                            )}>
                                                {rawInput.slice(4, 6).padEnd(2, '_')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end pt-3">
                                        <span className="text-sm font-black text-blue-400 tracking-tighter">{ampm}</span>
                                        <div className="w-2 h-4 bg-blue-500 animate-pulse mt-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AM/PM Toggle (Integrated into center group) */}
                        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                            {['AM', 'PM'].map((period) => (
                                <button
                                    key={period}
                                    type="button"
                                    onClick={() => { setAmpm(period as 'AM' | 'PM'); }}
                                    className={clsx(
                                        "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        ampm === period
                                            ? "bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.4)]"
                                            : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons (Footer) */}
                    <div className="pt-6 border-t border-white/5 flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors border border-white/10 hover:border-white/20 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 uppercase text-[9px] tracking-widest"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Confirm Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
