'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Clock,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

interface TimePickerTerminalProps {
    value: string; // HH:mm
    onChange: (time: string) => void;
    onClose: () => void;
}

/**
 * Enterprise Time Precision Terminal
 * Encapsulated logic for selecting military-standard operation times
 */
export default function TimePickerTerminal({ value, onChange, onClose }: TimePickerTerminalProps) {
    const [hours, setHours] = useState(value ? parseInt(value.split(':')[0]) : 12);
    const [minutes, setMinutes] = useState(value ? parseInt(value.split(':')[1]) : 0);

    const containerRef = useRef<HTMLDivElement>(null);

    const updateTime = (h: number, m: number) => {
        const hStr = h.toString().padStart(2, '0');
        const mStr = m.toString().padStart(2, '0');
        onChange(`${hStr}:${mStr}`);
    };

    const adjustHour = (delta: number) => {
        let next = hours + delta;
        if (next > 23) next = 0;
        if (next < 0) next = 23;
        setHours(next);
        updateTime(next, minutes);
    };

    const adjustMinute = (delta: number) => {
        let next = minutes + delta;
        if (next > 59) next = 0;
        if (next < 0) next = 59;
        setMinutes(next);
        updateTime(hours, next);
    };

    return (
        <div className="z-50 animate-in fade-in duration-200">
            <div className="bg-slate-950 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden w-[200px] p-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Hour Column */}
                    <div className="flex flex-col items-center gap-2">
                        <button type="button" onClick={() => adjustHour(1)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-blue-400">
                            <ChevronUp className="w-5 h-5" />
                        </button>
                        <div className="text-2xl font-black text-white font-mono bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl border border-white/5">
                            {hours.toString().padStart(2, '0')}
                        </div>
                        <button type="button" onClick={() => adjustHour(-1)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-blue-400">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-2xl font-black text-slate-700 animate-pulse">:</div>

                    {/* Minute Column */}
                    <div className="flex flex-col items-center gap-2">
                        <button type="button" onClick={() => adjustMinute(5)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-blue-400">
                            <ChevronUp className="w-5 h-5" />
                        </button>
                        <div className="text-2xl font-black text-white font-mono bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl border border-white/5">
                            {minutes.toString().padStart(2, '0')}
                        </div>
                        <button type="button" onClick={() => adjustMinute(-5)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-blue-400">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full mt-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-blue-500/20"
                >
                    Confirm Time
                </button>
            </div>
        </div>
    );
}
