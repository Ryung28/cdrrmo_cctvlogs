'use client';

import { Camera, Calendar, Clock, Trash2, Plus, Server, MessageSquare } from 'lucide-react';
import { UseFormRegister, Control, useFieldArray, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { CctvLog } from '@/lib/schemas/cctv_schema';
import CompactCalendar from '../CompactCalendar';
import TimePickerTerminal from '../TimePickerTerminal';
import FloatingOverlay from '@/components/shared/FloatingOverlay';

interface OfflineCameraEntryListProps {
    register: UseFormRegister<CctvLog>;
    control: Control<CctvLog>;
    watch: UseFormWatch<CctvLog>;
    setValue: UseFormSetValue<CctvLog>;
    errors: any;
    openPickerId: string | null;
    setOpenPickerId: (id: string | null) => void;
    formatTacticalTime: (value: string | undefined | null) => React.ReactNode;
}

export default function OfflineCameraEntryList({
    register,
    control,
    watch,
    setValue,
    errors,
    openPickerId,
    setOpenPickerId,
    formatTacticalTime
}: OfflineCameraEntryListProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "offline_cameras" as any
    });

    return (
        <div className="space-y-6">
            <div className="header-aligned-row justify-between">
                <label className="enterprise-label !mb-0 font-outfit tracking-widest text-slate-500">CAMERA INCIDENTS</label>
                <button
                    type="button"
                    onClick={() => append({
                        camera_name: '',
                        nvr: '',
                        offline_date: new Date().toISOString().split('T')[0],
                        offline_time: '',
                        remarks: ''
                    })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                >
                    <Plus className="w-4 h-4" /> Add Camera
                </button>
            </div>

            <div className="space-y-4">
                {fields.map((field: any, index: number) => (
                    <div key={field.id} className="p-5 bg-slate-950/50 rounded-2xl border border-white/5 space-y-4 group/entry transition-all hover:border-blue-500/20">
                        {/* Row 1: Primary Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            {/* Camera Name */}
                            <div className="md:col-span-3 space-y-2">
                                <label className="enterprise-label font-outfit tracking-widest text-slate-500">CAMERA ID/NAME</label>
                                <div className="relative group">
                                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. CAM-01"
                                        className="enterprise-input !text-sm font-mono"
                                        {...register(`offline_cameras.${index}.camera_name` as any)}
                                    />
                                </div>
                            </div>

                            {/* NVR Designation */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="enterprise-label font-outfit tracking-widest text-slate-500">NVR_ID</label>
                                <div className="relative group">
                                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500/50" />
                                    <input
                                        type="text"
                                        placeholder="NVR-A"
                                        className="enterprise-input !text-sm font-mono italic"
                                        {...register(`offline_cameras.${index}.nvr` as any)}
                                    />
                                </div>
                            </div>

                            {/* Date Picker */}
                            <div className="md:col-span-3 space-y-2">
                                <label className="enterprise-label font-outfit tracking-widest text-slate-500">OFFLINE SINCE</label>
                                <FloatingOverlay
                                    isOpen={openPickerId === `offdate-${index}`}
                                    onClose={() => setOpenPickerId(null)}
                                    trigger={
                                        <button
                                            type="button"
                                            onClick={() => setOpenPickerId(openPickerId === `offdate-${index}` ? null : `offdate-${index}`)}
                                            className="enterprise-input !text-sm flex items-center cursor-pointer text-left overflow-hidden font-mono"
                                        >
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none select-none" />
                                            <span className={watch(`offline_cameras.${index}.offline_date` as any) ? "text-white" : "text-slate-600"}>
                                                {watch(`offline_cameras.${index}.offline_date` as any) || "Select Date"}
                                            </span>
                                        </button>
                                    }
                                >
                                    <CompactCalendar
                                        value={watch(`offline_cameras.${index}.offline_date` as any) || ""}
                                        onChange={(val) => {
                                            setValue(`offline_cameras.${index}.offline_date` as any, val);
                                            setOpenPickerId(null);
                                        }}
                                        onClose={() => setOpenPickerId(null)}
                                    />
                                </FloatingOverlay>
                            </div>

                            {/* Time Picker */}
                            <div className="md:col-span-3 space-y-2">
                                <label className="enterprise-label font-outfit tracking-widest text-slate-500">TIME</label>
                                <FloatingOverlay
                                    isOpen={openPickerId === `offtime-${index}`}
                                    onClose={() => setOpenPickerId(null)}
                                    placement="bottom-end"
                                    trigger={
                                        <button
                                            type="button"
                                            onClick={() => setOpenPickerId(openPickerId === `offtime-${index}` ? null : `offtime-${index}`)}
                                            className="enterprise-input !text-sm flex items-center cursor-pointer text-left overflow-hidden font-mono"
                                        >
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none select-none" />
                                            <div className="font-bold">
                                                {formatTacticalTime(watch(`offline_cameras.${index}.offline_time` as any)) || <span className="text-slate-600 font-normal">Set Time</span>}
                                            </div>
                                        </button>
                                    }
                                >
                                    <TimePickerTerminal
                                        value={watch(`offline_cameras.${index}.offline_time` as any) || ""}
                                        onChange={(val) => {
                                            setValue(`offline_cameras.${index}.offline_time` as any, val);
                                            setOpenPickerId(null);
                                        }}
                                        onClose={() => setOpenPickerId(null)}
                                    />
                                </FloatingOverlay>
                            </div>

                            {/* Removal Command */}
                            <div className="md:col-span-1 flex justify-end pb-1">
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="h-[2.6rem] w-[2.6rem] flex items-center justify-center text-red-500 hover:bg-red-500/20 hover:scale-110 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Secondary Metadata (Remarks) */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.03]">
                            <label className="enterprise-label font-outfit tracking-widest text-slate-400 opacity-60 flex items-center gap-2">
                                <MessageSquare className="w-3 h-3" /> INTERNAL REMARKS
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Power supply issues, disconnected cable..."
                                className="enterprise-input !bg-slate-900/40 border-dashed border-white/5 focus:border-blue-500/30 text-[11px]"
                                {...register(`offline_cameras.${index}.remarks` as any)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {(errors as any).offline_cameras && (
                <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1 animate-pulse">
                    {Array.isArray((errors as any).offline_cameras)
                        ? "Tactical Halt: Please complete all operational parameters for each camera."
                        : ((errors as any).offline_cameras as any).message}
                </p>
            )}
        </div>
    );
}
