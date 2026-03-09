'use client';

import { Camera, Clock, Trash2, Plus } from 'lucide-react';
import { UseFormRegister, Control, useFieldArray, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { CctvLog } from '@/lib/schemas/cctv_schema';
import DateTimeTerminal from '../DateTimeTerminal';
import FloatingOverlay from '@/components/shared/FloatingOverlay';

interface CameraEntryListProps {
    register: UseFormRegister<CctvLog>;
    control: Control<CctvLog>;
    watch: UseFormWatch<CctvLog>;
    setValue: UseFormSetValue<CctvLog>;
    errors: any;
    openPickerId: string | null;
    setOpenPickerId: (id: string | null) => void;
    hideLabel?: boolean;
}

export default function CameraEntryList({
    register,
    control,
    watch,
    setValue,
    errors,
    openPickerId,
    setOpenPickerId,
    hideLabel = false
}: CameraEntryListProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "cameras" as any
    });

    return (
        <div className="space-y-2">
            <div className="header-aligned-row justify-between">
                {!hideLabel && <label className="enterprise-label !mb-0 font-outfit tracking-widest text-slate-500">CAMERA NAME OR ID</label>}
                <button
                    type="button"
                    onClick={() => append({ name: "", timestamp: "" })}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                >
                    <Plus className="w-3 h-3" /> Add
                </button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="animate-in slide-in-from-left-2 duration-300">
                        <div className="flex items-start gap-3">
                            {/* Camera Name (3/4 Width) */}
                            <div className="flex-[3] relative">
                                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder={index === 0 ? "e.g. SOUTH-MAIN-01" : "Additional camera..."}
                                    className="enterprise-input !pl-12 !bg-slate-950/50 !text-sm font-mono"
                                    {...register(`cameras.${index}.name` as any)}
                                />
                            </div>

                            <div className="flex-[1.5]">
                                <FloatingOverlay
                                    isOpen={openPickerId === `cam-time-${index}`}
                                    onClose={() => setOpenPickerId(null)}
                                    placement="bottom-end"
                                    trigger={
                                        <button
                                            type="button"
                                            onClick={() => setOpenPickerId(openPickerId === `cam-time-${index}` ? null : `cam-time-${index}`)}
                                            className="enterprise-input !bg-slate-950/50 !px-4 flex items-center justify-between cursor-pointer border-white/10"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                                <span className="text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {watch(`cameras.${index}.timestamp` as any) ? (
                                                        <span className="text-blue-400">{watch(`cameras.${index}.timestamp` as any).split(' ')[1] || 'SET'}</span>
                                                    ) : (
                                                        <span className="text-slate-600">TIME</span>
                                                    )}
                                                </span>
                                            </div>
                                        </button>
                                    }
                                >
                                    <DateTimeTerminal
                                        value={watch(`cameras.${index}.timestamp` as any) || ""}
                                        onChange={(val) => {
                                            setValue(`cameras.${index}.timestamp` as any, val);
                                            setOpenPickerId(null);
                                        }}
                                        onClose={() => setOpenPickerId(null)}
                                    />
                                </FloatingOverlay>
                            </div>

                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="h-[2.6rem] w-[2.6rem] flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4 px-1 mt-1">
                            {errors.cameras?.[index]?.name && (
                                <p className="text-red-500 text-[9px] font-black uppercase">
                                    {errors.cameras[index]?.name?.message as string}
                                </p>
                            )}
                            {watch(`cameras.${index}.timestamp` as any) && (
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                    On-Screen: <span className="text-blue-500/80">{watch(`cameras.${index}.timestamp` as any)}</span>
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
