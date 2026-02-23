'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cctvLogSchema, CctvLog } from '@/lib/schemas/cctv_schema';
import { createCctvLogAction } from '@/app/actions/cctv_actions';
import { useState, useEffect } from 'react';
import {
    Calendar,
    User,
    Info,
    Loader2,
    Clock,
    Camera,
    Tag,
    Save,
    ScanSearch,
    Monitor,
    FileVideo,
    VideoOff,
    CheckCircle2,
    Activity
} from 'lucide-react';
import { clsx } from 'clsx';

const CLASSIFICATION_OPTIONS = [
    "Lost Valuables",
    "Traffic Accident",
    "Criminal Investigation",
    "Public Safety",
    "Suspicious Person",
    "Medical Emergency"
];

const ACTION_TYPES = [
    { id: 'CCTV Review', icon: ScanSearch, label: 'CCTV Review' },
    { id: 'Footage Extraction', icon: FileVideo, label: 'Footage Extraction' },
    { id: 'Offline Cameras', icon: VideoOff, label: 'Offline Camera' },
];

export default function CctvForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAction, setSelectedAction] = useState<CctvLog['action_type']>('CCTV Review');

    // Real-time time generator
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentDate(now.toISOString().split('T')[0]);
            setCurrentTime(now.toTimeString().split(' ')[0]);
        };
        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, dirtyFields },
        reset,
    } = useForm<CctvLog>({
        resolver: zodResolver(cctvLogSchema),
        defaultValues: {
            action_type: 'CCTV Review',
            date_of_action: "",
            classification: "",
            camera_name: "",
            incident_datetime: "",
            client_name: "",
            remarks: ""
        },
    });

    const classificationValue = watch('classification');

    // Sync form values with real-time state
    useEffect(() => {
        // Automatically sync if the user hasn't manually modified the fields
        if (!dirtyFields.date_of_action) {
            setValue('date_of_action', currentDate);
        }
        if (!dirtyFields.incident_datetime) {
            setValue('incident_datetime', `${currentDate} ${currentTime}`);
        }
    }, [currentDate, currentTime, setValue, dirtyFields]);

    const onSubmit = async (data: CctvLog) => {
        setIsSubmitting(true);
        try {
            const result = await createCctvLogAction(data);
            if (result.success) {
                alert('Log entry saved successfully!');
                reset({
                    action_type: selectedAction,
                    date_of_action: currentDate,
                    incident_datetime: `${currentDate} ${currentTime}`,
                    classification: "",
                    camera_name: "",
                    client_name: "",
                    remarks: ""
                });
            } else {
                alert(result.error || 'Failed to save log.');
            }
        } catch (error) {
            alert('An error occurred while saving.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Premium Industrial Action Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ACTION_TYPES.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                            setSelectedAction(item.id as CctvLog['action_type']);
                            setValue('action_type', item.id as CctvLog['action_type']);
                        }}
                        className={clsx(
                            "enterprise-action-card group",
                            selectedAction === item.id && "active"
                        )}
                    >
                        {/* Senior Dev Details */}
                        <div className="card-accent" />
                        <div className="scanning-line" />

                        <div className="selection-indicator" />

                        <item.icon className={clsx(
                            "w-10 h-10 mb-5 transition-all duration-500 z-10",
                            selectedAction === item.id ? "text-blue-500 scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-slate-600 group-hover:text-slate-400 group-hover:scale-105"
                        )} />

                        <span className={clsx(
                            "text-[11px] font-black tracking-[0.2em] uppercase transition-colors z-10",
                            selectedAction === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                        )}>{item.label}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <input type="hidden" {...register('action_type')} />

                {/* Row 1: Date of Review */}
                <div className="space-y-2">
                    <label className="enterprise-label">Date of Review</label>
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 opacity-60 pointer-events-none" />
                        <input
                            type="date"
                            className="enterprise-input [color-scheme:dark] block"
                            {...register('date_of_action')}
                        />
                    </div>
                    {errors.date_of_action && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.date_of_action.message}</p>}
                </div>

                {/* Row 2: Classification Row */}
                <div className="space-y-4">
                    <label className="enterprise-label">Classification</label>
                    <div className="relative group">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 opacity-60" />
                        <input
                            type="text"
                            placeholder="Type classification or select from below..."
                            className="enterprise-input"
                            {...register('classification')}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {CLASSIFICATION_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setValue('classification', opt)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                                    classificationValue === opt
                                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                                        : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                                )}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    {errors.classification && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.classification.message}</p>}
                </div>

                {/* Row 3: Camera and Incident Time and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="enterprise-label">Camera Name</label>
                        <div className="relative group">
                            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 opacity-60" />
                            <input
                                type="text"
                                placeholder="Enter camera name"
                                className="enterprise-input"
                                {...register('camera_name')}
                            />
                        </div>
                        {errors.camera_name && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.camera_name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="enterprise-label">Incident Time and Date</label>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 opacity-60" />
                            <input
                                type="text"
                                className="enterprise-input"
                                placeholder="YYYY-MM-DD HH:MM:SS"
                                {...register('incident_datetime')}
                            />
                        </div>
                        {errors.incident_datetime && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.incident_datetime.message}</p>}
                    </div>
                </div>

                {/* Row 4: Client Name */}
                <div className="space-y-2">
                    <label className="enterprise-label">Client Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 opacity-60" />
                        <input
                            type="text"
                            placeholder="Enter client name"
                            className="enterprise-input"
                            {...register('client_name')}
                        />
                    </div>
                    {errors.client_name && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.client_name.message}</p>}
                </div>

                {/* Row 5: Remarks */}
                <div className="space-y-2">
                    <label className="enterprise-label">Remarks</label>
                    <div className="relative group">
                        <Info className="absolute left-4 top-4 w-5 h-5 text-blue-500 opacity-60" />
                        <textarea
                            rows={4}
                            placeholder="Type any additional details about the incident here..."
                            className="enterprise-input !pl-12 resize-none"
                            {...register('remarks')}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Saving entry...</span>
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            <span>Save to Digital Logbook</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
