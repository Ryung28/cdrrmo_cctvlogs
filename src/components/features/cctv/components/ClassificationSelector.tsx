'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Tag, ChevronDown, CheckCircle2, Trash2, Plus, X } from 'lucide-react';
import FloatingOverlay from '@/components/shared/FloatingOverlay';

export const DEFAULT_CLASSIFICATION_OPTIONS = [
    "Lost Valuables", "Traffic Accident", "Criminal Investigation",
    "Public Safety", "Suspicious Person", "Medical Emergency"
] as const;

interface ClassificationSelectorProps {
    value: string;
    onChange: (value: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    error?: string;
    customCategories: string[];
    onAddCategory: (name: string) => void;
    onDeleteCategory: (name: string) => void;
}

export default function ClassificationSelector({
    value,
    onChange,
    isOpen,
    onToggle,
    error,
    customCategories,
    onAddCategory,
    onDeleteCategory
}: ClassificationSelectorProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
        if (inputValue.trim()) {
            onAddCategory(inputValue.trim());
            setInputValue("");
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="header-aligned-row">
                <label className="enterprise-label !mb-0 font-outfit tracking-wider">WHAT IS THE CASE CATEGORY?</label>
            </div>
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
                            <Tag className="w-4 h-4 text-blue-400" />
                            <span className={value ? "text-white font-bold" : "text-slate-500"}>{value || "Choose a category..."}</span>
                        </span>
                        <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                    </button>
                }
            >
                <div className="w-full bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 max-h-[300px] overflow-y-auto">
                    {/* Default Categories */}
                    {DEFAULT_CLASSIFICATION_OPTIONS.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => { onChange(opt); onToggle(); }}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{opt}</span>
                            {value === opt && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500" />}
                        </button>
                    ))}

                    {/* Custom Categories */}
                    {customCategories.map((opt) => (
                        <div key={opt} className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                            <button
                                type="button"
                                onClick={() => { onChange(opt); onToggle(); }}
                                className="flex items-center gap-3 flex-1"
                            >
                                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">{opt}</span>
                                {value === opt && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDeleteCategory(opt); }}
                                className="p-1 text-red-500 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {/* Add New Category */}
                    {isAdding ? (
                        <div className="p-3 border-t border-white/10 bg-slate-900/50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New category name"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder:text-slate-500 uppercase focus:outline-none focus:border-blue-500"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsAdding(false); setInputValue(""); }}
                                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/5 transition-colors border-t border-white/10"
                        >
                            <Plus className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Add New Category</span>
                        </button>
                    )}
                </div>
            </FloatingOverlay>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{error}</p>}
        </div>
    );
}
