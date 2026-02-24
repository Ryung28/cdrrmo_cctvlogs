'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    cctvLogSchema,
    cctvReviewSchema,
    footageExtractionSchema,
    offlineCamerasSchema,
    CctvLog,
    CctvReviewLog,
    OfflineCamerasLog,
    CctvLogModel
} from '@/lib/schemas/cctv_schema';
import { createCctvLogAction } from '@/app/actions/cctv_actions';
import { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import CctvLogList from './CctvLogList';
import { toast } from 'sonner';
import {
    Calendar, User, Info, Loader2, Clock, Camera, Tag, Save,
    ScanSearch, FileVideo, VideoOff, CheckCircle2, ChevronDown,
    X, Plus, Trash2, AlertCircle, PartyPopper, Eye
} from 'lucide-react';
import { clsx } from 'clsx';
import { useMemo } from 'react';

const CLASSIFICATION_OPTIONS = [
    "Lost Valuables", "Traffic Accident", "Criminal Investigation",
    "Public Safety", "Suspicious Person", "Medical Emergency"
];

const ACTION_TYPES = [
    { id: 'CCTV Review', icon: ScanSearch, label: 'CCTV Review' },
    { id: 'Footage Extraction', icon: FileVideo, label: 'Footage Extraction' },
    { id: 'Offline Cameras', icon: VideoOff, label: 'Offline Camera' },
];

interface OfflineCameraEntryForm {
    camera_name: string;
    offline_date: string;
    offline_time: string;
}

interface CctvFormProps {
    allLogs: CctvLogModel[];
}

export default function CctvForm({ allLogs }: CctvFormProps) {
    const router = useRouter();

    // View State
    const [activeView, setActiveView] = useState<'view' | 'create'>('view');
    const [filterCategory, setFilterCategory] = useState<CctvLog['action_type'] | null>(null);
    const [dropdownSelection, setDropdownSelection] = useState<CctvLog['action_type'] | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [optimisticLogs, setOptimisticLogs] = useState<CctvLogModel[]>([]);
    const [isClassificationOpen, setIsClassificationOpen] = useState(false);
    const [classificationRemarks, setClassificationRemarks] = useState("");

    const isOfflineCameras = dropdownSelection === 'Offline Cameras';

    const getSchema = () => {
        if (dropdownSelection === 'CCTV Review') return cctvReviewSchema;
        if (dropdownSelection === 'Footage Extraction') return footageExtractionSchema;
        if (dropdownSelection === 'Offline Cameras') return offlineCamerasSchema;
        return cctvLogSchema;
    };

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
        reset
    } = useForm<CctvLog>({
        resolver: zodResolver(getSchema()),
        defaultValues: {
            action_type: undefined,
            date_of_action: new Date().toISOString().split('T')[0],
            classification: "",
            camera_name: "",
            incident_datetime: "",
            client_name: "",
            remarks: "",
            classification_remarks: "",
            offline_cameras: [{ camera_name: '', offline_date: new Date().toISOString().split('T')[0], offline_time: '' }]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "offline_cameras" as any // Type cast for discriminated union compatibility
    });

    // Stats calculation optimized for Senior Dev performance
    const stats = useMemo(() => {
        const combined = [...allLogs, ...optimisticLogs];
        return {
            total: combined.length,
            reviews: combined.filter(l => l.action_type === 'CCTV Review').length,
            extractions: combined.filter(l => l.action_type === 'Footage Extraction').length,
            offline: combined.filter(l => l.action_type === 'Offline Cameras').length,
        };
    }, [allLogs, optimisticLogs]);

    const getClassificationPlaceholder = (classification: string) => {
        const placeholders: Record<string, string> = {
            'Lost Valuables': 'Item description, where lost, time noticed...',
            'Traffic Accident': 'Vehicles involved, plate numbers, direction...',
            'Criminal Investigation': 'Suspect description, incident details...',
            'Public Safety': 'Hazard type, location, immediate actions...',
            'Suspicious Person': 'Physical appearance, behavior observed...',
            'Medical Emergency': 'Patient condition, assistance rendered...'
        };
        return placeholders[classification] || 'Additional details...';
    };

    const classificationValue = watch('classification');

    useEffect(() => {
        if (dropdownSelection) setValue('action_type', dropdownSelection);
    }, [dropdownSelection, setValue]);

    const onSubmit = async (data: CctvLog) => {
        setIsSubmitting(true);
        setSubmitError(null);

        const optimisticLog = {
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            action_type: dropdownSelection || 'CCTV Review',
            date_of_action: data.date_of_action || new Date().toISOString().split('T')[0],
            classification: data.classification || '',
            camera_name: data.camera_name || '',
            incident_datetime: data.incident_datetime || '',
            client_name: data.client_name || '',
            remarks: data.remarks || '',
            classification_remarks: classificationRemarks || '',
            offline_cameras: dropdownSelection === 'Offline Cameras'
                ? JSON.stringify((data as OfflineCamerasLog).offline_cameras || [])
                : '[]'
        } as CctvLogModel;

        // Optimistic update
        setOptimisticLogs(prev => [optimisticLog, ...prev]);
        setActiveView('view');
        setFilterCategory(dropdownSelection);

        try {
            // Prepare payload
            const payload = {
                ...data,
                classification_remarks: classificationRemarks,
            } as CctvLog;

            const result = await createCctvLogAction(payload);

            if (result.success) {
                toast.success('Log entry recorded');
                router.refresh();
                setOptimisticLogs(prev => prev.filter(log => log.id !== optimisticLog.id));
                reset();
                setClassificationRemarks("");
                setDropdownSelection(null);
            } else {
                // Rollback on failure
                setOptimisticLogs(prev => prev.filter(log => log.id !== optimisticLog.id));
                setSubmitError(result.error || 'Failed to save log.');
                toast.error('Submission failed');
            }
        } catch (error) {
            // Rollback on error
            setOptimisticLogs(prev => prev.filter(log => log.id !== optimisticLog.id));
            setSubmitError(error instanceof Error ? error.message : 'An error occurred.');
            toast.error('System error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredLogs = useMemo(() => {
        const combined = [...optimisticLogs, ...allLogs];
        if (!filterCategory) return combined;
        return combined.filter(log => log.action_type === filterCategory);
    }, [allLogs, optimisticLogs, filterCategory]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Dashboard Header - Click to create new entry */}
            <div className="flex flex-col md:flex-row gap-6">
                {ACTION_TYPES.map((item) => {
                    const count = item.id === 'CCTV Review' ? stats.reviews : item.id === 'Footage Extraction' ? stats.extractions : stats.offline;
                    const isFiltering = filterCategory === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                if (filterCategory === item.id) {
                                    setFilterCategory(null);
                                } else {
                                    setFilterCategory(item.id as CctvLog['action_type']);
                                    setActiveView('view');
                                }
                            }}
                            className={clsx(
                                "flex-1 relative group p-6 rounded-2xl border transition-all duration-300 overflow-hidden text-left",
                                isFiltering
                                    ? "bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50"
                                    : "bg-slate-900/40 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <item.icon className={clsx("w-8 h-8 transition-colors duration-300", isFiltering ? "text-blue-500" : "text-slate-500 group-hover:text-slate-400")} />
                                <span className={clsx("text-2xl font-black tracking-tight", isFiltering ? "text-white" : "text-slate-600 group-hover:text-slate-400")}>{count}</span>
                            </div>
                            <div className="mt-4">
                                <h3 className={clsx("text-[10px] font-black tracking-[0.2em] uppercase", isFiltering ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400")}>{item.label}</h3>
                                <p className="text-xs text-slate-500 mt-1 capitalize">
                                    {isFiltering ? "Viewing Respective Data" : "Click to view logs"}
                                </p>
                            </div>
                            {isFiltering && <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 blur-2xl -mr-4 -mt-4 opacity-100" />}
                        </button>
                    );
                })}
            </div>

            {/* Action Tabs */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex gap-8">
                    <button onClick={() => setActiveView('view')} className={clsx("text-sm font-bold tracking-widest uppercase pb-4 -mb-4 transition-all relative", activeView === 'view' ? "text-white" : "text-slate-500 hover:text-slate-300")}>
                        Logbook History
                        {activeView === 'view' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                    </button>
                    <button onClick={() => setActiveView('create')} className={clsx("text-sm font-bold tracking-widest uppercase pb-4 -mb-4 transition-all relative", activeView === 'create' ? "text-white" : "text-slate-500 hover:text-slate-300")}>
                        + Create New Entry
                        {activeView === 'create' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                    </button>
                </div>
                {filterCategory && (<button onClick={() => setFilterCategory(null)} className="text-xs font-bold text-slate-500 hover:text-blue-400 flex items-center gap-2 group transition-colors"><X className="w-3 h-3 transition-transform group-hover:rotate-90" /> Clear {filterCategory} Filter</button>)}
            </div>

            {/* Main Content */}
            <div className="min-h-[400px]">
                {activeView === 'view' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CctvLogList logs={filteredLogs} />
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-3xl mx-auto py-4">
                        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 shadow-2xl">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Action Selector */}
                                <div className="space-y-2">
                                    <label className="enterprise-label">What type of log are you recording?</label>
                                    <div className="relative">
                                        <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="enterprise-input flex items-center justify-between cursor-pointer !bg-slate-950/50">
                                            <span className="flex items-center gap-3">
                                                {dropdownSelection ? (<>{(() => { const icon = ACTION_TYPES.find(t => t.id === dropdownSelection)?.icon || ScanSearch; const Icon = icon; return <Icon className="w-5 h-5 text-blue-500" />; })()}<span className="font-bold">{dropdownSelection}</span></>) : (<span className="text-slate-500">Pick a log category...</span>)}
                                            </span>
                                            <ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute z-50 w-full mt-2 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 animate-in fade-in slide-in-from-top-2">
                                                {ACTION_TYPES.map((item) => (
                                                    <button key={item.id} type="button" onClick={() => { setDropdownSelection(item.id as CctvLog['action_type']); setIsDropdownOpen(false); }}
                                                        className={clsx(
                                                            "w-full flex items-center gap-3 px-5 py-4 text-left transition-all border-b border-white/5 last:border-0 group",
                                                            dropdownSelection === item.id ? "bg-blue-600/10" : "hover:bg-white/5"
                                                        )}>
                                                        <item.icon className={clsx("w-5 h-5 transition-colors", dropdownSelection === item.id ? "text-blue-400" : "text-blue-500/70 group-hover:text-blue-400")} />
                                                        <span className={clsx("font-medium transition-colors", dropdownSelection === item.id ? "text-blue-100" : "text-slate-300 group-hover:text-white")}>{item.label}</span>
                                                        {dropdownSelection === item.id && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.action_type && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1">{errors.action_type.message as string}</p>}
                                </div>

                                {dropdownSelection && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                        {isOfflineCameras ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <label className="enterprise-label">Camera Incidents</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => append({ camera_name: '', offline_date: new Date().toISOString().split('T')[0], offline_time: '' })}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add Camera
                                                    </button>
                                                </div>

                                                {fields.map((field: any, index: number) => (
                                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-5 bg-slate-950/50 rounded-2xl border border-white/5">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Camera ID/Name</label>
                                                            <div className="relative group">
                                                                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. CAM-01"
                                                                    className="enterprise-input !h-10 !text-sm !pl-10"
                                                                    {...register(`offline_cameras.${index}.camera_name` as any)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Offline Since</label>
                                                            <div className="relative group">
                                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                                                <input
                                                                    type="date"
                                                                    className="enterprise-input !h-10 !text-sm !pl-10 [color-scheme:dark]"
                                                                    {...register(`offline_cameras.${index}.offline_date` as any)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</label>
                                                            <div className="relative group">
                                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                                                <input
                                                                    type="time"
                                                                    className="enterprise-input !h-10 !text-sm !pl-10"
                                                                    {...register(`offline_cameras.${index}.offline_time` as any)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end pb-1">
                                                            {fields.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => remove(index)}
                                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {(errors as any).offline_cameras && (
                                                    <p className="text-red-500 text-[10px] font-bold uppercase mt-2 ml-1">
                                                        {Array.isArray((errors as any).offline_cameras)
                                                            ? "Please complete all fields for each camera."
                                                            : ((errors as any).offline_cameras as any).message}
                                                    </p>
                                                )}

                                                <div className="space-y-2">
                                                    <label className="enterprise-label">Additional Notes or Steps Taken</label>
                                                    <div className="relative group">
                                                        <Info className="absolute left-4 top-4 w-5 h-5 text-blue-400" />
                                                        <textarea
                                                            rows={3}
                                                            placeholder="Describe any actions, repairs, or details here..."
                                                            className="enterprise-input !pl-12 resize-none !bg-slate-950/50"
                                                            {...register('remarks')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2"><label className="enterprise-label">Date of Log</label><div className="relative group"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" /><input type="date" className="enterprise-input !bg-slate-950/50 [color-scheme:dark]" {...register('date_of_action')} /></div>{errors.date_of_action && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.date_of_action.message as string}</p>}</div>
                                                    <div className="space-y-2"><label className="enterprise-label">What is the case category?</label><div className="relative"><button type="button" onClick={() => setIsClassificationOpen(!isClassificationOpen)} className="enterprise-input flex items-center justify-between cursor-pointer !bg-slate-950/50"><span className="flex items-center gap-3"><Tag className="w-5 h-5 text-blue-400" /><span className={classificationValue ? "text-white font-bold" : "text-slate-500"}>{classificationValue || "Choose a category..."}</span></span><ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-transform", isClassificationOpen && "rotate-180")} /></button>{isClassificationOpen && <div className="absolute z-50 w-full mt-2 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">{CLASSIFICATION_OPTIONS.map((opt) => (<button key={opt} type="button" onClick={() => { setValue('classification', opt); setIsClassificationOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"><span className="font-medium text-slate-300">{opt}</span>{classificationValue === opt && <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500" />}</button>))}</div>}</div>{errors.classification && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.classification.message as string}</p>}</div>
                                                </div>
                                                {classificationValue && (<div className="space-y-2 animate-in fade-in slide-in-from-top-2"><label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{classificationValue} Remarks</label><div className="relative group"><Info className="absolute left-4 top-4 w-5 h-5 text-blue-400" /><textarea rows={2} placeholder={getClassificationPlaceholder(classificationValue)} className="enterprise-input !pl-12 resize-none !bg-slate-950/20" value={classificationRemarks} onChange={(e) => setClassificationRemarks(e.target.value)} /></div></div>)}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2"><label className="enterprise-label">Camera Name or ID</label><div className="relative group"><Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" /><input type="text" placeholder="e.g. SOUTH-MAIN-01" className="enterprise-input !bg-slate-950/50" {...register('camera_name')} /></div>{errors.camera_name && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.camera_name.message as string}</p>}</div>
                                                    <div className="space-y-2"><label className="enterprise-label">Date and Time of Event</label><div className="relative group"><Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" /><input type="text" className="enterprise-input !bg-slate-950/50" placeholder="YYYY-MM-DD HH:MM:SS" {...register('incident_datetime')} /></div>{errors.incident_datetime && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.incident_datetime.message as string}</p>}</div>
                                                </div>
                                                <div className="space-y-2"><label className="enterprise-label">Client or Person Involved</label><div className="relative group"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" /><input type="text" placeholder="Full name of person or requester" className="enterprise-input !bg-slate-950/50" {...register('client_name')} /></div>{errors.client_name && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.client_name.message as string}</p>}</div>
                                                <div className="space-y-2"><label className="enterprise-label">Additional Case Notes</label><div className="relative group"><AlertCircle className="absolute left-4 top-4 w-5 h-5 text-blue-400" /><textarea rows={4} placeholder="Provide a clear description of the events..." className="enterprise-input !pl-12 resize-none !bg-slate-950/50" {...register('remarks')} /></div></div>
                                            </>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {isSubmitting ? (<><Loader2 size={20} className="animate-spin" /><span>Saving...</span></>) : (<><Save size={20} /><span>Save Log Entry</span></>)}
                                        </button>
                                        {submitError && (<div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 animate-in shake"><AlertCircle className="w-5 h-5" /><span className="text-xs font-black uppercase tracking-wider">{submitError}</span></div>)}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
