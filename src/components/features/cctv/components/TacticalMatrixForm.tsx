'use client';

import { Save, Loader2, AlertCircle } from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CctvLog } from '@/lib/schemas/cctv_schema';

interface TacticalMatrixFormProps {
    register: UseFormRegister<CctvLog>;
    errors: FieldErrors<CctvLog>;
    isSubmitting: boolean;
    onSubmit: () => void;
    dropdownSelection: string | null;
}

export default function TacticalMatrixForm({ register, errors, isSubmitting, onSubmit, dropdownSelection }: TacticalMatrixFormProps) {
    return (
        <div className="tactical-box border-l-2 border-l-[#bef264]">
            <div className="tactical-header-clip">INPUT (CCTV {dropdownSelection || 'REVIEW'})</div>
            <div className="overflow-x-auto scrollbar-hide">
                <div className="min-w-[1000px]">
                    {/* Matrix Header Labels */}
                    <div className="flex bg-slate-100/5 border-b border-white/5">
                        <div className="w-[10%] tactical-matrix-header whitespace-nowrap">CLIENT NAME</div>
                        <div className="w-[10%] tactical-matrix-header whitespace-nowrap">ADDRESS</div>
                        <div className="w-[8%] tactical-matrix-header whitespace-nowrap">CONTACT #</div>
                        <div className="w-[14%] tactical-matrix-header italic text-blue-400 whitespace-nowrap">CLASSIFICATION</div>
                        <div className="w-[10%] tactical-matrix-header whitespace-nowrap">DATE/TIME REVIEW</div>

                        {/* 4-COLUMN CAMERA USED SECTION */}
                        <div className="w-[40%] flex border-r border-white/5">
                            <div className="w-full text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 py-3 text-center bg-blue-500/5 italic border-b border-blue-500/20 absolute top-0">CAMERA USED</div>
                            <div className="flex w-full pt-6">
                                <div className="w-[25%] tactical-matrix-header !py-1 text-[7px] border-r border-white/[0.03]">CAMERA NAME</div>
                                <div className="w-[25%] tactical-matrix-header !py-1 text-[7px] border-r border-white/[0.03]">DATE</div>
                                <div className="w-[25%] tactical-matrix-header !py-1 text-[7px] border-r border-white/[0.03]">TIME</div>
                                <div className="w-[25%] tactical-matrix-header !py-1 text-[7px]">REMARKS</div>
                            </div>
                        </div>

                        <div className="w-[8%] tactical-matrix-header whitespace-nowrap">ACTION DATE</div>
                    </div>

                    {/* Matrix Row Inputs */}
                    <div className="flex h-12">
                        <div className="w-[10%]">
                            <input {...register('client_name' as any)} className="tactical-input-cell bg-transparent border-r border-white/5 focus:bg-white/[0.02]" placeholder="Full Name..." />
                        </div>
                        <div className="w-[10%]">
                            <input {...register('address' as any)} className="tactical-input-cell bg-transparent border-r border-white/5 focus:bg-white/[0.02]" placeholder="Area/Locality..." />
                        </div>
                        <div className="w-[8%]">
                            <input
                                {...register('contact_number' as any)}
                                className="tactical-input-cell bg-transparent border-r border-white/5 focus:bg-white/[0.02]"
                                placeholder="09XXX..."
                                maxLength={11}
                                onInput={(e: any) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                }}
                            />
                        </div>
                        <div className="w-[14%]">
                            <select {...register('classification' as any)} className="tactical-input-cell bg-[#020617] text-white font-bold border-r border-white/5 appearance-none cursor-pointer hover:bg-white/[0.02] px-3">
                                <option value="">SELECT...</option>
                                <option value="Lost Valuables">LOST VALUABLES</option>
                                <option value="Traffic Accident">TRAFFIC ACCIDENT</option>
                                <option value="Criminal Investigation">CRIMINAL INVESTIGATION</option>
                                <option value="Theft/Robbery">THEFT/ROBBERY</option>
                                <option value="Assault">ASSAULT</option>
                                <option value="Public Safety">PUBLIC SAFETY</option>
                                <option value="Medical Emergency">MEDICAL EMERGENCY</option>
                                <option value="Personnel Audit">PERSONNEL AUDIT</option>
                            </select>
                        </div>
                        <div className="w-[10%]">
                            <input type="datetime-local" {...register('incident_datetime' as any)} className="tactical-input-cell bg-[#020617]/40 text-white border-r border-white/5 focus:bg-white/[0.05] text-[10px] font-mono px-2" />
                        </div>

                        {/* 4-COLUMN CAMERA USED INPUTS */}
                        <div className="w-[40%] flex border-r border-white/5 h-full">
                            <div className="w-[25%] border-r border-white/5">
                                <input {...register('cameras.0.name' as any)} className="tactical-input-cell bg-transparent h-full text-[10px]" placeholder="CAM_ID" />
                            </div>
                            <div className="w-[25%] border-r border-white/5">
                                <input type="date" {...register('cameras.0.date' as any)} className="tactical-input-cell bg-transparent h-full text-[9px] font-mono px-1" />
                            </div>
                            <div className="w-[25%] border-r border-white/5">
                                <input type="time" {...register('cameras.0.timestamp' as any)} className="tactical-input-cell bg-transparent h-full text-[9px] font-mono px-1" />
                            </div>
                            <div className="w-[25%]">
                                <input {...register('remarks' as any)} className="tactical-input-cell bg-transparent h-full text-[10px]" placeholder="LOGS..." />
                            </div>
                        </div>

                        <div className="w-[8%]">
                            <input type="date" {...register('date_of_action' as any)} className="tactical-input-cell bg-transparent focus:bg-white/[0.02] text-[10px] font-mono" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-3 bg-slate-950/60 flex justify-between items-center">
                <div className="flex gap-4">
                    {errors.client_name && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1"><AlertCircle size={10} /> Name Required</span>}
                    {errors.classification && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1"><AlertCircle size={10} /> Type Required</span>}
                </div>

                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 px-8 py-2 bg-[#bef264] text-[#020617] font-black italic text-[10px] uppercase tracking-tighter hover:bg-[#d9f99d] transition-colors disabled:opacity-50 rounded shadow-[0_0_20px_rgba(190,242,100,0.2)]"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Save className="w-3 h-3" />
                    )}
                    Commit Data to Database
                </button>
            </div>
        </div>
    );
}
