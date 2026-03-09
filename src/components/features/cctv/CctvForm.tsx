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
import { createCCTVLog } from '@/app/actions/cctv_actions';
import { useState, useEffect, useActionState, useRef, useMemo, useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CctvLogList from './CctvLogList';
import CompactCalendar from './CompactCalendar';
import TimePickerTerminal from './TimePickerTerminal';
import DateTimeTerminal from './DateTimeTerminal';
import { notify } from '@/lib/utils/notifications';
import {
    Loader2, Save, AlertCircle, PartyPopper, Eye, ChevronLeft, ChevronRight,
    Calendar, Info, Clock, User
} from 'lucide-react';
import { clsx } from 'clsx';
import { DEFAULT_CLASSIFICATION_OPTIONS } from './components/ClassificationSelector';

// Modular Sub-components
import TacticalHeader from './components/TacticalHeader';
import TacticalSidebar from './components/TacticalSidebar';
import TacticalMainDisplay from './components/TacticalMainDisplay';
import TacticalStatusMonitor from './components/TacticalStatusMonitor';
import CommandPanel from './components/CommandPanel';
import TacticalLogMatrix from './components/TacticalLogMatrix';

interface CctvFormProps {
    allLogs: CctvLogModel[];
    totalCount: number;
    currentPage: number;
    globalStats?: {
        reviews: number;
        extractions: number;
        offline: number;
    };
    initialCategory?: string;
    initialStartDate?: string;
    initialEndDate?: string;
}

export default function CctvForm({ allLogs, totalCount, currentPage, globalStats, initialCategory, initialStartDate, initialEndDate }: CctvFormProps) {
    const router = useRouter();
    const PAGE_SIZE = 5;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // View State
    const [activeView, setActiveView] = useState<'view' | 'create'>('view');
    const [filterCategory, setFilterCategory] = useState<CctvLog['action_type'] | null>((initialCategory as any) || null);
    const [startDate, setStartDate] = useState<string>(initialStartDate || "");
    const [endDate, setEndDate] = useState<string>(initialEndDate || "");
    const [dropdownSelection, setDropdownSelection] = useState<CctvLog['action_type'] | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activePeriod, setActivePeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
    const [isFocusMode, setIsFocusMode] = useState(false);

    const selectedLog = useMemo(() =>
        allLogs.find(log => log.id === selectedLogId),
        [allLogs, selectedLogId]);

    // Senior Logic: Sync URL state with internal state when navigation occurs
    useEffect(() => {
        setFilterCategory((initialCategory as any) || null);
        setStartDate(initialStartDate || "");
        setEndDate(initialEndDate || "");
    }, [initialCategory, initialStartDate, initialEndDate]);

    // UI State
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Enterprise Optimistic UI Logic
    const [optimisticLogs, addOptimisticLog] = useOptimistic(
        allLogs,
        (currentLogs, newLog: CctvLogModel) => [newLog, ...currentLogs]
    );

    const [classificationRemarks, setClassificationRemarks] = useState("");

    // Dynamic Categories State - Add/Delete custom categories
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    // Terminal Open States (Enterprise UI Management)
    const [openPickerId, setOpenPickerId] = useState<string | null>(null);

    const closeAllPickers = () => setOpenPickerId(null);

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
            cameras: [{ name: "", timestamp: "" }],
            incident_datetime: "",
            client_name: "",
            contact_number: "",
            address: "",
            office: "",
            remarks: "",
            classification_remarks: "",
            offline_cameras: [{
                camera_name: '',
                nvr: '',
                offline_date: new Date().toISOString().split('T')[0],
                offline_time: '',
                remarks: ''
            }]
        },
    });

    const classificationValue = watch('classification');

    const { fields: cameraFields, append: appendCamera, remove: removeCamera } = useFieldArray({
        control,
        name: "cameras" as any
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "offline_cameras" as any
    });

    // Delete custom category (cannot delete defaults)
    const handleDeleteCategory = (categoryToDelete: string) => {
        if (!DEFAULT_CLASSIFICATION_OPTIONS.includes(categoryToDelete as typeof DEFAULT_CLASSIFICATION_OPTIONS[number])) {
            setCustomCategories(prev => prev.filter(c => c !== categoryToDelete));
            if (classificationValue === categoryToDelete) {
                setValue('classification', "");
            }
        }
    };

    const handleSmartDate = (fieldName: keyof CctvLog, value: string) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length === 8) {
            const formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
            setValue(fieldName, formatted as any);
        } else if (digits.length === 7) {
            const formatted = `${digits.slice(0, 4)}-0${digits.slice(4, 5)}-${digits.slice(5, 7)}`;
            setValue(fieldName, formatted as any);
        }
    };

    const stats = useMemo(() => {
        if (globalStats) {
            return {
                total: totalCount,
                reviews: globalStats.reviews,
                extractions: globalStats.extractions,
                offline: globalStats.offline
            };
        }

        return {
            total: optimisticLogs.length,
            reviews: optimisticLogs.filter(l => l.action_type === 'CCTV Review').length,
            extractions: optimisticLogs.filter(l => l.action_type === 'Footage Extraction').length,
            offline: optimisticLogs.filter(l => l.action_type === 'Offline Cameras').length,
        };
    }, [optimisticLogs, globalStats, totalCount]);

    useEffect(() => {
        if (dropdownSelection) setValue('action_type', dropdownSelection);
    }, [dropdownSelection, setValue]);

    const onSubmit = async (data: CctvLog) => {
        setSubmitError(null);

        // 1. Prepare Optimistic Payload
        const optimisticPayload: CctvLogModel = {
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            action_type: dropdownSelection || 'CCTV Review',
            date_of_action: data.date_of_action || new Date().toISOString().split('T')[0],
            classification: data.classification || '',
            camera_name: (data as any).cameras?.map((c: any) =>
                c.timestamp ? `${c.name} [${c.timestamp}]` : c.name
            ).join(', ') || '',
            incident_datetime: data.incident_datetime || '',
            client_name: data.client_name || '',
            contact_number: (data as any).contact_number || '',
            address: (data as any).address || '',
            office: (data as any).office || '',
            remarks: data.remarks || '',
            classification_remarks: classificationRemarks || '',
            offline_cameras: '[]'
        } as any;

        // 2. Wrap in Transition for React 19 / Next.js 15 Compatibility
        startTransition(async () => {
            try {
                // Trigger UI update immediately
                addOptimisticLog(optimisticPayload);
                setDropdownSelection(null);

                // Server Handshake
                const result = await createCCTVLog(data);

                if (result.success) {
                    notify.success('Log Committed: Entry synced successfully.');
                    router.refresh();
                    reset();
                    setClassificationRemarks("");
                } else {
                    setDropdownSelection(data.action_type as any);
                    setSubmitError(result.message);
                    notify.error('Sync Failed', result.message);
                }
            } catch (error) {
                setDropdownSelection(data.action_type as any);
                setSubmitError('System Error: Handshake timed out.');
                notify.error('System Error');
            }
        });
    };

    const filteredLogs = useMemo(() => {
        let combined = optimisticLogs;

        if (filterCategory) {
            combined = combined.filter(log => log.action_type === filterCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            combined = combined.filter(log =>
                log.client_name?.toLowerCase().includes(q) ||
                log.remarks?.toLowerCase().includes(q) ||
                log.classification?.toLowerCase().includes(q)
            );
        }

        return combined;
    }, [optimisticLogs, filterCategory, searchQuery]);

    const updateHistoryFilter = (category: CctvLog['action_type'] | null, start: string, end: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', '1');

        if (category) params.set('category', category);
        else params.delete('category');

        if (start) params.set('startDate', start);
        else params.delete('startDate');

        if (end) params.set('endDate', end);
        else params.delete('endDate');

        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePeriodChange = (p: 'monthly' | 'quarterly' | 'yearly') => {
        setActivePeriod(p);
        const now = new Date();
        let start = '';
        let end = '';

        if (p === 'monthly') {
            start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        } else if (p === 'quarterly') {
            const quarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
            end = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
        } else if (p === 'yearly') {
            start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            end = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        }

        updateHistoryFilter(filterCategory, start, end);
    };

    const categoryStats = useMemo(() => {
        const total = stats.reviews + stats.extractions || 1;
        return [
            { label: 'Lost Valuables', value: (allLogs.filter(l => l.classification === 'Lost Valuables').length / total) * 100 },
            { label: 'Traffic Accident', value: (allLogs.filter(l => l.classification === 'Traffic Accident').length / total) * 100 },
            { label: 'Criminal Case', value: (allLogs.filter(l => l.classification === 'Criminal Investigation').length / total) * 100 },
        ];
    }, [allLogs, stats]);

    const subCategoryStats = useMemo(() => {
        return [
            { label: 'Theft/Robbery', value: 85 },
            { label: 'Assault', value: 45 },
        ];
    }, [allLogs]);

    const offlineCameraDetails = useMemo(() => {
        const offlineLogs = allLogs.filter(l => l.action_type === 'Offline Cameras');
        const list: { name: string, remarks: string }[] = [];

        offlineLogs.forEach(log => {
            if (log.offline_cameras) {
                try {
                    const cams = JSON.parse(log.offline_cameras as string);
                    cams.forEach((c: any) => {
                        list.push({ name: c.camera_name, remarks: log.remarks || 'No Remarks' });
                    });
                } catch (e) { }
            }
        });

        return list.slice(0, 8);
    }, [allLogs]);

    return (
        <div className={clsx(
            "w-full h-[100dvh] bg-[#0f172a] tactical-grid-bg font-outfit relative overflow-hidden flex flex-col selection:bg-[#bef264] selection:text-black",
            // Tactical Scaling Engine
            "[--header-h:80px]",
            "min-[1920px]:[--header-h:92px]"
        )}>
            {/* 1. TOP TACTICAL TITLE BAR - VANISHING COMMAND CEILING */}
            <header className={clsx(
                "w-full border-b border-white/5 bg-[#0b1120]/95 backdrop-blur-md relative z-50 overflow-hidden shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]",
                isFocusMode ? "h-0 opacity-0 -translate-y-full" : "h-[var(--header-h)] opacity-100"
            )}>
                <div className="w-full h-full px-4 text-nowrap">
                    <TacticalHeader
                        period={activePeriod}
                        onPeriodChange={handlePeriodChange}
                        actionType={dropdownSelection}
                        onActionTypeChange={(type) => {
                            setDropdownSelection(type);
                            setFilterCategory(type);
                            updateHistoryFilter(type, startDate, endDate);
                        }}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                </div>
            </header>

            {/* 2. CORE DOCKING AREA - FULLBLEED VIEWPORT GRID */}
            <div className="flex-1 w-full overflow-hidden flex flex-col min-h-0">
                <div
                    className="flex-1 w-full grid bg-slate-950/20 shadow-inner transition-[grid-template-columns] duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] relative overflow-hidden"
                    style={{
                        gridTemplateColumns: isFocusMode
                            ? 'minmax(220px, 220px) minmax(0, 1fr) minmax(220px, 220px)'
                            : 'minmax(270px, 270px) minmax(0, 1fr) minmax(270px, 270px)',
                        minHeight: '0'
                    }}
                >
                    <aside className="z-50 relative border-r border-white/5 bg-[#0b1120]/95 backdrop-blur-3xl overflow-y-auto overflow-x-hidden scrollbar-hide h-full transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]">
                        <TacticalSidebar
                            stats={stats}
                            categoryStats={categoryStats}
                            subCategoryStats={subCategoryStats}
                            allLogs={allLogs}
                            onRefresh={() => router.refresh()}
                            isFocused={isFocusMode}
                        />
                    </aside>

                    {/* CENTER FLOW: MAIN DATA MATRIX (COL 2) */}
                    <main className="flex flex-col h-full bg-[#0c1425] relative z-20 min-w-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                        <TacticalMainDisplay
                            isFocused={isFocusMode}
                            onFocusToggle={() => setIsFocusMode(!isFocusMode)}
                            clientData={selectedLog ? {
                                name: selectedLog.client_name || '',
                                contact: selectedLog.contact_number || '',
                                address: selectedLog.address || ''
                            } : undefined}
                        >
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                <TacticalLogMatrix
                                    logs={filteredLogs}
                                    onLogSelect={(id) => setSelectedLogId(id === selectedLogId ? null : id)}
                                    selectedLogId={selectedLogId}
                                    activeTab={filterCategory === 'Footage Extraction' ? 'extraction' : 'review'}
                                    onTabChange={(tab) => {
                                        const cat = tab === 'review' ? 'CCTV Review' : 'Footage Extraction';
                                        setFilterCategory(cat as any);
                                        updateHistoryFilter(cat as any, startDate, endDate);
                                    }}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    isExpanded={isFocusMode}
                                />
                            </div>
                        </TacticalMainDisplay>
                    </main>

                    <aside className="z-50 relative border-l border-white/5 bg-[#0b1120]/95 backdrop-blur-3xl overflow-y-auto overflow-x-hidden scrollbar-hide h-full transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]">
                        <TacticalStatusMonitor
                            offlineCameras={offlineCameraDetails}
                            totalCount={totalCount || 50}
                            offlineCount={stats.offline}
                            isFocused={isFocusMode}
                        />
                    </aside>
                </div>
            </div>

            {/* 3. COMMAND PANEL - SIDE OVERLAY (replaces bottom horizontal deck) */}
            {dropdownSelection && (
                <CommandPanel
                    register={register}
                    errors={errors}
                    isSubmitting={isPending}
                    onSubmit={handleSubmit(onSubmit)}
                    onClose={() => {
                        setDropdownSelection(null);
                        reset();
                    }}
                    dropdownSelection={dropdownSelection}
                />
            )}
        </div>
    );
}
