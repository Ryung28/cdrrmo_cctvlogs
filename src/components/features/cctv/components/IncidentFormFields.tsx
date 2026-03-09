'use client';

import { User, Info, Clock, Calendar } from 'lucide-react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { CctvLog } from '@/lib/schemas/cctv_schema';
import DateTimeTerminal from '../DateTimeTerminal';
import CompactCalendar from '../CompactCalendar';

interface IncidentFormFieldsProps {
    register: UseFormRegister<CctvLog>;
    watch: UseFormWatch<CctvLog>;
    setValue: UseFormSetValue<CctvLog>;
    errors: any;
    openPickerId: string | null;
    setOpenPickerId: (id: string | null) => void;
    formPickerRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
    formatTacticalTime: (value: string | undefined | null) => React.ReactNode;
    classificationValue?: string;
    getClassificationPlaceholder: (classification: string) => string;
    classificationRemarks: string;
    onClassificationRemarksChange: (value: string) => void;
}

export default function IncidentFormFields({
    register,
    watch,
    setValue,
    errors,
    openPickerId,
    setOpenPickerId,
    formPickerRefs,
    formatTacticalTime,
    classificationValue,
    getClassificationPlaceholder,
    classificationRemarks,
    onClassificationRemarksChange
}: IncidentFormFieldsProps) {
    return (
        <div className="space-y-8">
            {classificationValue && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{classificationValue} Remarks</label>
                    <div className="relative group">
                        <Info className="absolute left-4 top-4 w-4 h-4 text-blue-400" />
                        <textarea
                            rows={2}
                            placeholder={getClassificationPlaceholder(classificationValue)}
                            className="enterprise-input !pl-12 resize-none !bg-slate-950/20"
                            value={classificationRemarks}
                            onChange={(e) => onClassificationRemarksChange(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Specific Incident Date/Time Picker */}
                <div className="space-y-2">
                    <label className="enterprise-label">Date and Time of Event</label>
                    <div className="relative group" ref={el => { formPickerRefs.current['incidentdatetime'] = el; }}>
                        <button
                            type="button"
                            onClick={() => setOpenPickerId(openPickerId === 'incidentdatetime' ? null : 'incidentdatetime')}
                            className="enterprise-input flex items-center !bg-slate-950/50 cursor-pointer text-left overflow-hidden"
                        >
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none select-none" />
                            <div className="pl-6">
                                {formatTacticalTime(watch('incident_datetime')) || <span className="text-slate-500">YYYY-MM-DD HH:MM:SS</span>}
                            </div>
                        </button>
                        {openPickerId === 'incidentdatetime' && (
                            <div className="absolute right-0 bottom-full mb-2 z-[110]">
                                <DateTimeTerminal
                                    value={watch('incident_datetime') || ""}
                                    onChange={(val) => setValue('incident_datetime', val)}
                                    onClose={() => setOpenPickerId(null)}
                                />
                            </div>
                        )}
                    </div>
                    {errors.incident_datetime && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.incident_datetime.message as string}</p>}
                </div>

                {/* Date of Log Input */}
                <div className="space-y-2">
                    <label className="enterprise-label">Date of Log</label>
                    <div className="relative group" ref={el => { formPickerRefs.current['dateoflog'] = el; }}>
                        <button
                            type="button"
                            onClick={() => setOpenPickerId(openPickerId === 'dateoflog' ? null : 'dateoflog')}
                            className="enterprise-input flex items-center !bg-slate-950/50"
                        >
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none select-none" />
                            <span className={watch('date_of_action') ? "text-white pl-6" : "text-slate-500 pl-6"}>
                                {watch('date_of_action') || "Select Log Date"}
                            </span>
                        </button>
                        {openPickerId === 'dateoflog' && (
                            <div className="absolute bottom-full left-0 z-[100] mb-2">
                                <CompactCalendar
                                    value={watch('date_of_action') || ""}
                                    onChange={(val) => setValue('date_of_action', val)}
                                    onClose={() => setOpenPickerId(null)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="enterprise-label">Client Name (Optional)</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input type="text" placeholder="Who is requesting?" className="enterprise-input !pl-12 !bg-slate-950/50" {...register('client_name')} />
                    </div>
                    {errors.client_name && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.client_name.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <label className="enterprise-label">Additional Remarks</label>
                    <div className="relative group">
                        <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input type="text" placeholder="Extra notes..." className="enterprise-input !pl-12 !bg-slate-950/50" {...register('remarks')} />
                    </div>
                </div>
            </div>
        </div>
    );
}
