'use client';

import { useState, useTransition } from 'react';
import { CctvLogModel } from '@/lib/schemas/cctv_schema';
import { deleteLogAction } from '@/app/actions/cctv_actions';
import { notify } from '@/lib/utils/notifications';
import {
    Trash2,
    Eye,
    EyeOff,
    Clock,
    Camera,
    FileVideo,
    VideoOff,
    ScanSearch,
    AlertCircle,
    Loader2,
    Calendar,
    User,
    Tag,
    Info,
    Phone,
    MapPin,
    Building2
} from 'lucide-react';
import { clsx } from 'clsx';

interface CctvLogListProps {
    logs: CctvLogModel[];
    onDelete?: (id: string) => Promise<void>;
    onOptimisticAdd?: (log: CctvLogModel) => void;
}

export default function CctvLogList({ logs, onDelete }: CctvLogListProps) {
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Toggle log expansion
    const toggleExpand = (id: string) => {
        setExpandedLogs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Handle delete with optimistic UI and toast notifications
    const handleDelete = async (id: string) => {
        notify.confirm('Delete this log entry?', async () => {
            setDeletingId(id);
            startTransition(async () => {
                const result = await deleteLogAction(id);
                if (result.error) {
                    notify.removal(false, 'Removal Failed');
                    setDeletingId(null);
                } else {
                    notify.removal(true, 'Entry Removed');
                }
            });
        });
    };

    // Get icon based on action type
    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'CCTV Review':
                return ScanSearch;
            case 'Footage Extraction':
                return FileVideo;
            case 'Offline Cameras':
                return VideoOff;
            default:
                return Camera;
        }
    };

    // Parse offline cameras JSON
    const parseOfflineCameras = (json: string | undefined) => {
        if (!json) return [];
        try {
            return JSON.parse(json);
        } catch {
            return [];
        }
    };

    // Format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        if (!timestamp) return '-';
        try {
            return new Date(timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return timestamp;
        }
    };

    if (logs.length === 0) {
        return (
            <div className="text-center py-16 bg-slate-900/20 rounded-3xl border border-dashed border-white/5 animate-in fade-in zoom-in-95 duration-700">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-950/50 mb-6 border border-white/5 shadow-2xl">
                    <AlertCircle className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-400">Mission Parameters yielded no logs</h3>
                <p className="text-slate-600 text-sm mt-2 max-w-xs mx-auto">
                    Adjust your operational filters or mission date to locate specific logs, or record a new entry.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={() => window.location.search = ""}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Reset All Criteria
                    </button>
                    <button
                        onClick={() => {
                            const btn = document.querySelector('button[onClick*="setActiveView(\'create\')"]') as HTMLButtonElement;
                            if (btn) btn.click();
                        }}
                        className="px-6 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/20"
                    >
                        Create New Log
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Logs</h2>
                <span className="text-sm text-slate-500">{logs.length} entries</span>
            </div>

            {logs.map((log) => {
                const Icon = getActionIcon(log.action_type);
                const isExpanded = expandedLogs.has(log.id);
                const isDeleting = deletingId === log.id;
                const offlineCameras = parseOfflineCameras(log.offline_cameras);

                return (
                    <div
                        key={log.id}
                        className={clsx(
                            "enterprise-card overflow-hidden transition-all duration-300",
                            isDeleting && "opacity-50"
                        )}
                    >
                        {/* Log Header */}
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => toggleExpand(log.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden group/icon",
                                    log.action_type === 'Offline Cameras' ? "bg-orange-500/20" : "bg-blue-500/20"
                                )}>
                                    <Icon className={clsx(
                                        "w-5 h-5 relative z-10",
                                        log.action_type === 'Offline Cameras' ? "text-orange-400" : "text-blue-400"
                                    )} />
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm tracking-tight text-white uppercase">{log.action_type}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Clock className="w-3 h-3 text-blue-500/70" />
                                        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-tighter">
                                            {formatTimestamp(log.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {log.action_type !== 'Offline Cameras' && log.classification && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                                        {log.classification}
                                    </span>
                                )}
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    {isExpanded ? (
                                        <EyeOff className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-slate-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="border-t border-white/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                                {/* Action Type Specific Fields */}
                                {log.action_type === 'Offline Cameras' ? (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                                            List of Offline Cameras ({offlineCameras.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {offlineCameras.map((cam: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                                    <Camera className="w-4 h-4 text-orange-400" />
                                                    <span className="font-medium text-white">{cam.camera_name}</span>
                                                    <span className="text-slate-600">/</span>
                                                    <span className="text-slate-400 font-mono text-xs">{cam.offline_date}</span>
                                                    <span className="text-slate-600">/</span>
                                                    <span className="text-slate-400 font-mono text-xs">{cam.offline_time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-950/30 rounded-xl border border-white/5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Tag className="w-3.5 h-3.5" />
                                                <span className="text-[10px] uppercase font-black tracking-widest">Entry Category</span>
                                            </div>
                                            <p className="text-sm text-white font-semibold">{log.classification || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Camera className="w-3.5 h-3.5" />
                                                <span className="text-[10px] uppercase font-black tracking-widest">Camera Used</span>
                                            </div>
                                            <p className="text-sm font-mono text-blue-400">{log.camera_name || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] uppercase font-black tracking-widest">Event time</span>
                                            </div>
                                            <p className="text-sm font-mono text-white">{log.incident_datetime || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <User className="w-3.5 h-3.5" />
                                                <span className="text-[10px] uppercase font-black tracking-widest">Requested By</span>
                                            </div>
                                            <p className="text-sm text-white font-semibold">{log.client_name || '-'}</p>
                                        </div>

                                        {/* Contact & Address Row */}
                                        {log.contact_number && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] uppercase font-black tracking-widest">Contact No.</span>
                                                </div>
                                                <p className="text-sm font-mono text-blue-400">{log.contact_number}</p>
                                            </div>
                                        )}
                                        {log.address && (
                                            <div className="md:col-span-3 space-y-1">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] uppercase font-black tracking-widest">Resident Address</span>
                                                </div>
                                                <p className="text-sm text-white font-medium">{log.address}</p>
                                            </div>
                                        )}
                                        {log.office && (
                                            <div className="md:col-span-4 space-y-1">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] uppercase font-black tracking-widest">Requesting Office</span>
                                                </div>
                                                <p className="text-sm text-blue-400 font-black uppercase tracking-widest">{log.office}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Detailed Information Stack */}
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Date of Action */}
                                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                                            <Calendar className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Date of Action</p>
                                                <p className="text-sm font-mono text-white">{formatDate(log.date_of_action || '')}</p>
                                            </div>
                                        </div>

                                        {/* Case Details Remarks */}
                                        {log.classification_remarks && (
                                            <div className="flex items-start gap-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                                <Info className="w-5 h-5 text-blue-400 mt-1" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Category Remarks</p>
                                                    <p className="text-sm text-slate-300 leading-relaxed">{log.classification_remarks}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action/Repair Remarks */}
                                    {log.remarks && (
                                        <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4 text-slate-500" />
                                                <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">Additional Notes</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">{log.remarks}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Delete Button */}
                                <div className="pt-4 border-t border-white/10 flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(log.id);
                                        }}
                                        disabled={isDeleting || isPending}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-bold">Delete</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}