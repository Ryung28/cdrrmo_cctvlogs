'use client';

import { Save, Loader2, AlertCircle, X, ChevronDown } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CctvLog } from '@/lib/schemas/cctv_schema';
import { clsx } from 'clsx';

interface CommandPanelProps {
    register: UseFormRegister<CctvLog>;
    errors: FieldErrors<CctvLog>;
    isSubmitting: boolean;
    onSubmit: () => void; // This is the prop definition
    onClose: () => void;
    dropdownSelection: string | null;
}

// ─── Reusable FieldWrapper ─────────────────────────────────────────────────────
function FieldWrapper({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            {children}
            {error && (
                <span className="flex items-center gap-1.5 text-[9px] text-red-500 font-bold px-2 py-1 bg-red-500/5 rounded-full w-fit">
                    <AlertCircle size={10} /> {error}
                </span>
            )}
        </div>
    );
}

// ─── Base Input Styles ─────────────────────────────────────────────────────────
const inputBase = "w-full bg-white/[0.03] border border-white/10 text-white text-[13px] font-medium px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all placeholder:text-slate-700 rounded-xl";
const selectBase = "w-full bg-[#0b1120] border border-white/10 text-white text-[13px] font-bold px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all rounded-xl appearance-none cursor-pointer uppercase tracking-tight";

export default function CommandPanel({
    register,
    errors,
    isSubmitting,
    onSubmit,
    onClose,
    dropdownSelection
}: CommandPanelProps) {

    const typeColor = dropdownSelection === 'CCTV Review'
        ? 'text-blue-400'
        : dropdownSelection === 'Footage Extraction'
            ? 'text-purple-400'
            : 'text-red-400';

    const typeAccent = dropdownSelection === 'CCTV Review' ? 'bg-blue-500' :
        dropdownSelection === 'Footage Extraction' ? 'bg-purple-500' : 'bg-red-500';

    return (
        <>
            {/* Backdrop Dimmer */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[70] animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Command Panel */}
            <aside
                className={clsx(
                    "fixed right-4 top-4 bottom-4 w-[380px] z-[80] flex flex-col",
                    "bg-[#0a0f18] border border-white/10 rounded-[2rem]",
                    "shadow-[0_20px_100px_rgba(0,0,0,0.8)]",
                    "animate-in slide-in-from-right-full duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                )}
            >
                {/* ── Panel Header ─────────────────────────────────────── */}
                <div className="px-8 py-8 shrink-0 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className={clsx("w-8 h-1 rounded-full mb-2", typeAccent)} />
                        <h2 className={clsx("text-2xl font-black tracking-tight", typeColor)}>
                            {dropdownSelection || 'Input Form'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable Body ──────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-8 space-y-8 pb-10">

                    {dropdownSelection === 'Footage Extraction' ? (
                        /* ================== FOOTAGE EXTRACTION LAYOUT ================== */
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* 1. Basic Info Section */}
                            <div className="space-y-4">
                                <FieldWrapper label="Client Name" error={(errors as any)?.client_name?.message}>
                                    <input {...register('client_name' as any)} className={inputBase} placeholder="E.g. Juan Dela Cruz" />
                                </FieldWrapper>

                                <div className="grid grid-cols-2 gap-4">
                                    <FieldWrapper label="Office / Department" error={(errors as any)?.office?.message}>
                                        <input {...register('office' as any)} className={inputBase} placeholder="E.g. PNP / NBI" />
                                    </FieldWrapper>
                                    <FieldWrapper label="Contact Number" error={(errors as any)?.contact_number?.message}>
                                        <input
                                            {...register('contact_number' as any)}
                                            className={clsx(inputBase, "font-mono")}
                                            placeholder="09XXXXXXXXX"
                                            maxLength={11}
                                            onInput={(e: any) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                                        />
                                    </FieldWrapper>
                                </div>

                                <FieldWrapper label="Address" error={(errors as any)?.address?.message}>
                                    <input {...register('address' as any)} className={inputBase} placeholder="Requesting party address..." />
                                </FieldWrapper>
                            </div>

                            {/* 2. Mode & Classification */}
                            <div className="grid grid-cols-2 gap-4">
                                <FieldWrapper label="Extraction Mode" error={(errors as any)?.classification?.message}>
                                    <select {...register('classification' as any)} className={selectBase}>
                                        <option value="">Mode...</option>
                                        <option value="Flashdrive (RAW)">Flashdrive (RAW)</option>
                                        <option value="Video/Photo Sharing">Video/Photo Sharing</option>
                                    </select>
                                </FieldWrapper>
                                <FieldWrapper label="Incident Type" error={(errors as any)?.classification_remarks?.message}>
                                    <select {...register('classification_remarks' as any)} className={selectBase}>
                                        <option value="">Type...</option>
                                        <option value="Traffic Accident">Traffic Accident</option>
                                        <option value="Criminal Investigation">Criminal Investigation</option>
                                        <option value="Public Safety">Public Safety</option>
                                    </select>
                                </FieldWrapper>
                            </div>

                            {/* 3. QUAD COLUMN (Tactical Grid) */}
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6 shadow-inner">
                                <div className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] ml-1">Incident Parameters</div>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                    <FieldWrapper label="Incident Title" error={(errors as any)?.remarks?.message}>
                                        <input {...register('remarks' as any)} className={clsx(inputBase, "bg-[#0b1120]")} placeholder="Case Name..." />
                                    </FieldWrapper>

                                    <FieldWrapper label="Camera Station" error={(errors as any)?.cameras?.[0]?.name?.message}>
                                        <input {...register('cameras.0.name' as any)} className={clsx(inputBase, "bg-[#0b1120] uppercase font-black")} placeholder="ID/Station..." />
                                    </FieldWrapper>

                                    <FieldWrapper label="Start Point">
                                        <div className="flex flex-col gap-1.5">
                                            <input type="date" {...register('cameras.0.date' as any)} className={clsx(inputBase, "py-2 px-3 text-xs bg-[#0b1120]")} />
                                            <input type="time" {...register('cameras.0.timestamp' as any)} className={clsx(inputBase, "py-2 px-3 text-xs bg-[#0b1120]")} />
                                        </div>
                                    </FieldWrapper>

                                    <FieldWrapper label="End Point">
                                        <div className="flex flex-col gap-1.5">
                                            <input type="date" {...register('incident_datetime_end' as any)} className={clsx(inputBase, "py-2 px-3 text-xs bg-[#0b1120]")} />
                                            <input type="time" {...register('incident_datetime_end' as any)} className={clsx(inputBase, "py-2 px-3 text-xs bg-[#0b1120]")} />
                                        </div>
                                    </FieldWrapper>
                                </div>
                            </div>

                            {/* 4. Extraction Date */}
                            <FieldWrapper label="Date of Extraction" error={(errors as any)?.date_of_action?.message}>
                                <input type="date" {...register('date_of_action' as any)} className={inputBase} />
                            </FieldWrapper>
                        </div>
                    ) : (
                        /* ================== STANDARD REVIEW LAYOUT ================== */
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <FieldWrapper label="Client Name" error={(errors as any)?.client_name?.message}>
                                    <input {...register('client_name' as any)} className={inputBase} placeholder="E.g. Juan Dela Cruz" />
                                </FieldWrapper>

                                <FieldWrapper label="Address" error={(errors as any)?.address?.message}>
                                    <input {...register('address' as any)} className={inputBase} placeholder="Enter location..." />
                                </FieldWrapper>

                                <FieldWrapper label="Contact Number" error={(errors as any)?.contact_number?.message}>
                                    <input
                                        {...register('contact_number' as any)}
                                        className={clsx(inputBase, "font-mono text-lg")}
                                        placeholder="09XXXXXXXXX"
                                        maxLength={11}
                                        onInput={(e: any) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                                    />
                                </FieldWrapper>
                            </div>

                            <div className="h-[1px] bg-white/5 w-full" />

                            <div className="space-y-6">
                                <FieldWrapper label="CCTV Review Classification" error={(errors as any)?.classification?.message}>
                                    <div className="relative group">
                                        <select {...register('classification' as any)} className={selectBase}>
                                            <option value="">Select Type...</option>
                                            <option value="Lost Valuables">Lost Valuables</option>
                                            <option value="Traffic Accident">Traffic Accident</option>
                                            <option value="Criminal Investigation">Criminal Investigation</option>
                                            <option value="Theft/Robbery">Theft / Robbery</option>
                                            <option value="Assault">Assault</option>
                                            <option value="Public Safety">Public Safety</option>
                                            <option value="Medical Emergency">Medical Emergency</option>
                                            <option value="Personnel Audit">Personnel Audit</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                </FieldWrapper>

                                <FieldWrapper label="Date / Time of Review">
                                    <input type="datetime-local" {...register('incident_datetime' as any)} className={clsx(inputBase, 'font-medium')} />
                                </FieldWrapper>
                            </div>

                            <div className="h-[1px] bg-white/5 w-full" />

                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-6">
                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Camera Details</div>
                                <FieldWrapper label="Camera Name" error={(errors as any)?.cameras?.[0]?.name?.message}>
                                    <input {...register('cameras.0.name' as any)} className={clsx(inputBase, 'uppercase font-black tracking-widest bg-[#0b1120]')} placeholder="Station Name..." />
                                </FieldWrapper>

                                <div className="grid grid-cols-2 gap-4">
                                    <FieldWrapper label="Date">
                                        <input type="date" {...register('cameras.0.date' as any)} className={clsx(inputBase, 'py-2 px-3 text-xs')} />
                                    </FieldWrapper>
                                    <FieldWrapper label="Time">
                                        <input type="time" {...register('cameras.0.timestamp' as any)} className={clsx(inputBase, 'py-2 px-3 text-xs')} />
                                    </FieldWrapper>
                                </div>
                            </div>

                            <FieldWrapper label="Remarks">
                                <textarea {...register('remarks' as any)} rows={4} className={clsx(inputBase, 'resize-none leading-relaxed min-h-[120px]')} placeholder="Enter notes..." />
                            </FieldWrapper>
                        </div>
                    )}
                </div>

                {/* ── Compact Commit Footer ─────────────────────────────────────── */}
                <div className="p-5 border-t border-white/5 bg-white/[0.01] flex items-center gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-[10px] font-bold text-slate-500 hover:text-white hover:bg-white/5 border border-white/5 transition-all rounded-xl uppercase tracking-widest"
                    >
                        Discard
                    </button>

                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className={clsx(
                            "flex-[2] flex items-center justify-center gap-2",
                            "py-3 font-black text-[12px] uppercase tracking-tight",
                            "bg-[#bef264] text-[#020617] rounded-xl transition-all",
                            "hover:bg-[#d9f99d] active:scale-[0.98] shadow-lg",
                            "disabled:opacity-40"
                        )}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Commit Sync
                    </button>
                </div>
            </aside>
        </>
    );
}
