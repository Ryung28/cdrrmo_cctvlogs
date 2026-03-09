'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { clsx } from 'clsx';

interface CompactCalendarProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    onClose: () => void;
}

/**
 * Enterprise Single Date Picker Terminal
 * Modular, encapsulated component for precise Date selection
 * 
 * SECURITY NOTE: Implements "Wait and See" (Mounting Guard) pattern
 * to prevent Hydration Mismatches in Next.js SSR environment.
 * All time-sensitive logic runs only after client-side mount.
 */
export default function CompactCalendar({ value, onChange, onClose }: CompactCalendarProps) {
    // 🛡️ HYDRATION SHIELD: Wait until mounted before accessing browser-only APIs
    const [hasMounted, setHasMounted] = useState(false);
    const [viewDate, setViewDate] = useState<Date | null>(null);
    const [today, setToday] = useState<Date | null>(null);


    // Initialize on client only - this prevents server/client mismatch
    useEffect(() => {
        const now = new Date();
        setToday(now);
        setViewDate(value ? new Date(value) : now);
        setHasMounted(true);
    }, [value]);

    // Sync viewDate when value changes externally
    useEffect(() => {
        if (value && hasMounted) setViewDate(new Date(value));
    }, [value, hasMounted]);

    // Calendar generation logic (DRY: Shared logic pattern with range picker)
    const daysInMonth = useMemo(() => {
        if (!viewDate) return [];
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();

        const calendar = [];
        for (let i = 0; i < firstDay; i++) calendar.push(null);
        for (let i = 1; i <= days; i++) calendar.push(new Date(year, month, i));
        return calendar;
    }, [viewDate]);

    const handleDateClick = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        onChange(dateStr);
        onClose();
    };

    const changeMonth = (offset: number) => {
        if (!viewDate) return;
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    // 🛡️ STABLE STATE: Render placeholder during SSR and initial client render
    if (!hasMounted || !viewDate || !today) {
        return (
            <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-slate-950/20 rounded-2xl overflow-hidden w-full max-w-[280px]">
                    <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5">
                        <div className="w-4 h-4" />
                        <div className="h-3 w-24 bg-slate-700 rounded animate-pulse" />
                        <div className="w-4 h-4" />
                    </div>
                    <div className="p-3 bg-slate-950/50">
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-[8px] font-black text-slate-600 uppercase">
                                    {d.substring(0, 1)}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-8 w-full rounded-lg bg-slate-800/30 animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden min-w-[240px] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-2.5 border-b border-white/5 bg-white/5">
                    <button onClick={() => changeMonth(-1)} type="button" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-white">
                        {viewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </h4>
                    <button onClick={() => changeMonth(1)} type="button" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                </div>

                {/* Days Grid */}
                <div className="p-2.5 bg-slate-950/50">
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-[7px] font-black text-slate-600 uppercase">
                                {d.substring(0, 1)}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map((date, i) => {
                            if (!date) return <div key={`empty-${i}`} />;

                            const dateStr = date.toISOString().split('T')[0];
                            const selected = value === dateStr;
                            const isToday = date.toDateString() === today.toDateString();

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleDateClick(date)}
                                    className={clsx(
                                        "h-7 w-full rounded-lg text-[10px] font-black transition-all relative flex items-center justify-center",
                                        selected ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]" :
                                            "text-slate-500 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {date.getDate()}
                                    {isToday && !selected && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-blue-500 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
