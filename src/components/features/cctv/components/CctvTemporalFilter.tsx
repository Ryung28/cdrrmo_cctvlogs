'use client';

import { Calendar, Trash2 } from 'lucide-react';
import FloatingOverlay from '@/components/shared/FloatingOverlay';
import DateRangePicker from '../DateRangePicker';
import { useState } from 'react';

interface CctvTemporalFilterProps {
    startDate: string;
    endDate: string;
    onRangeChange: (start: string, end: string) => void;
    onReset?: () => void;
    showReset?: boolean;
}

export default function CctvTemporalFilter({
    startDate,
    endDate,
    onRangeChange,
    onReset,
    showReset = false
}: CctvTemporalFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-center gap-4">
            {/* Unified Temporal Range Terminal */}
            <FloatingOverlay
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                placement="bottom-end"
                trigger={
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-3 px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5 hover:border-blue-500/20 hover:bg-slate-900/50 cursor-pointer transition-all group"
                    >
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
                            <span className={startDate ? "text-blue-400" : "text-slate-600"}>
                                {startDate ? startDate.replace(/-/g, '/') : 'START'}
                            </span>
                            <span className="text-slate-800 font-black">→</span>
                            <span className={endDate ? "text-blue-400" : "text-slate-600"}>
                                {endDate ? endDate.replace(/-/g, '/') : 'END'}
                            </span>
                        </div>
                    </div>
                }
            >
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onRangeChange={(start, end) => {
                        onRangeChange(start, end);
                    }}
                    onClose={() => setIsOpen(false)}
                />
            </FloatingOverlay>

            {showReset && onReset && (
                <button
                    onClick={onReset}
                    className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group"
                    title="Reset Filters"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
