'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    X
} from 'lucide-react';
import { clsx } from 'clsx';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onRangeChange: (start: string, end: string) => void;
    onClose: () => void;
}

/**
 * Enterprise Date Range Picker Terminal
 * Dual-calendar view for selecting date ranges
 * 
 * SECURITY NOTE: Implements "Wait and See" (Mounting Guard) pattern
 * to prevent Hydration Mismatches in Next.js SSR environment.
 * All time-sensitive logic runs only after client-side mount.
 */
export default function DateRangePicker({ startDate, endDate, onRangeChange, onClose }: DateRangePickerProps) {
    // 🛡️ HYDRATION SHIELD: Wait until mounted before accessing browser-only APIs
    const [hasMounted, setHasMounted] = useState(false);
    const [viewDate, setViewDate] = useState<Date | null>(null);
    const [today, setToday] = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<string | null>(null);


    // Initialize on client only - this prevents server/client mismatch
    useEffect(() => {
        const now = new Date();
        setToday(now);
        setViewDate(startDate ? new Date(startDate) : now);
        setHasMounted(true);
    }, [startDate]);

    // Parse dates to UTC midnight for consistent comparison
    const parseDateStr = (dateStr: string) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };

    const startTs = useMemo(() => parseDateStr(startDate), [startDate]);
    const endTs = useMemo(() => parseDateStr(endDate), [endDate]);
    const hoverTs = useMemo(() => (hoverDate ? parseDateStr(hoverDate) : null), [hoverDate]);

    // Calendar generation logic
    const daysInMonth = useMemo(() => {
        if (!viewDate) return [];
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();

        const calendar = [];
        // Padding for previous month
        for (let i = 0; i < firstDay; i++) {
            calendar.push(null);
        }
        // Current month days
        for (let i = 1; i <= days; i++) {
            calendar.push(new Date(year, month, i));
        }
        return calendar;
    }, [viewDate]);

    const handleDateClick = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dateTs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

        if (!startDate || (startDate && endDate)) {
            // Start new selection or reset selection if previously complete
            onRangeChange(dateStr, "");
        } else {
            // Selecting end date
            if (dateTs < startTs!) {
                // If end is before start, swap them
                onRangeChange(dateStr, startDate);
            } else {
                onRangeChange(startDate, dateStr);
            }
            // Logic change: We no longer call onClose() here to keep overlay persistent
        }
    };

    const changeMonth = (offset: number) => {
        if (!viewDate) return;
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const isSelected = (ts: number) => ts === startTs || ts === endTs;
    const isInRange = (ts: number) => {
        if (startTs && endTs) {
            return ts > startTs && ts < endTs;
        }
        if (startTs && hoverTs && !endTs) {
            const min = Math.min(startTs, hoverTs);
            const max = Math.max(startTs, hoverTs);
            return ts > min && ts < max;
        }
        return false;
    };

    // 🛡️ STABLE STATE: Render placeholder during SSR and initial client render
    if (!hasMounted || !viewDate || !today) {
        return (
            <div className="z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-slate-950 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden w-[320px]">
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                        <div className="w-4 h-4" />
                        <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
                        <div className="w-4 h-4" />
                    </div>
                    <div className="p-4 bg-slate-950/50">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-[9px] font-black text-slate-600 uppercase pt-1">
                                    {d}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-9 w-full rounded-lg bg-slate-800/30 animate-pulse" />
                            ))}
                        </div>
                    </div>
                    <div className="px-4 py-3 bg-white/5 border-t border-white/5">
                        <div className="h-4 w-16 bg-slate-700 rounded animate-pulse ml-auto" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-950 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden w-[320px]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                    </button>
                    <div className="text-center">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest mt-0.5">
                            {!startDate ? "Selecting Start Date" : !endDate ? "Selecting End Date" : "Range Selected"}
                        </div>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* Days Grid */}
                <div className="p-4 bg-slate-950/50">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-[9px] font-black text-slate-600 uppercase pt-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map((date, i) => {
                            if (!date) return <div key={`empty-${i}`} />;

                            const ts = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                            const selected = isSelected(ts);
                            const range = isInRange(ts);
                            const isToday = ts === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDateClick(date)}
                                    onMouseEnter={() => setHoverDate(date.toISOString().split('T')[0])}
                                    onMouseLeave={() => setHoverDate(null)}
                                    className={clsx(
                                        "h-9 w-full rounded-lg text-xs font-bold transition-all relative flex items-center justify-center",
                                        selected ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" :
                                            range ? "bg-blue-500/10 text-blue-400" :
                                                "text-slate-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {date.getDate()}
                                    {isToday && !selected && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className={clsx(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            startDate && endDate
                                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                                : "text-slate-600 hover:text-white"
                        )}
                    >
                        {startDate && endDate ? "Apply Range" : "Close"}
                    </button>
                </div>
            </div>
        </div>
    );
}
