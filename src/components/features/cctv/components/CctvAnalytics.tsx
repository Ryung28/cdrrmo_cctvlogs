'use client';

import { useMemo, useState } from 'react';
import { CctvLogModel } from '@/lib/schemas/cctv_schema';
import {
    TrendingUp,
    PieChart as PieChartIcon,
    Zap,
    Target,
    CalendarCheck,
    BarChart3,
    Activity,
    ShieldAlert,
    Camera,
    LayoutDashboard,
    ListFilter
} from 'lucide-react';
import CctvDataControl from './CctvDataControl';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import { clsx } from 'clsx';

interface CctvAnalyticsProps {
    logs: CctvLogModel[];
    onRefresh?: () => void;
}

type Perspective = 'trends' | 'metrics';

export default function CctvAnalytics({ logs, onRefresh }: CctvAnalyticsProps) {
    const [activePerspective, setActivePerspective] = useState<Perspective>('trends');

    // Data Processing
    const { chartData, donutData, barData, topCameras, totalLogs, metrics } = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const activity = new Array(7).fill(0);
        const classificationCounts: Record<string, number> = {};
        const cameraCounts: Record<string, number> = {};
        const now = new Date();

        logs.forEach(log => {
            const date = new Date(log.created_at);
            const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
            if (diffDays < 7) activity[date.getDay()]++;

            if (log.classification) classificationCounts[log.classification] = (classificationCounts[log.classification] || 0) + 1;

            const cams = log.camera_name?.split(',').map(c => c.split('[')[0].trim()) || [];
            cams.forEach(c => { if (c) cameraCounts[c] = (cameraCounts[c] || 0) + 1; });
        });

        const sortedClassifications = Object.entries(classificationCounts).sort((a, b) => b[1] - a[1]);

        return {
            chartData: days.map((day, i) => ({ name: day, logs: activity[i] })),
            donutData: sortedClassifications.slice(0, 3).map(([name, value], i) => ({
                name, value, color: i === 0 ? '#3b82f6' : i === 1 ? '#8b5cf6' : '#64748b'
            })),
            barData: sortedClassifications.slice(0, 5).map(([name, value]) => ({ name, value })),
            topCameras: Object.entries(cameraCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, count]) => ({ name, count })),
            totalLogs: logs.length,
            metrics: { peak: Math.max(...activity, 1), avg: (logs.length / 7).toFixed(1) }
        };
    }, [logs]);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-700 mb-6">
            {/* COMPACT SELECTOR & DATA CONTROLS */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex bg-slate-900/40 p-1 border border-white/5 rounded-xl backdrop-blur-md self-start">
                    <button
                        onClick={() => setActivePerspective('trends')}
                        className={clsx(
                            "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                            activePerspective === 'trends' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <LayoutDashboard size={12} /> Summary
                    </button>
                    <button
                        onClick={() => setActivePerspective('metrics')}
                        className={clsx(
                            "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                            activePerspective === 'metrics' ? "bg-purple-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <ListFilter size={12} /> Top Stats
                    </button>
                </div>

                <div className="flex-shrink-0">
                    <CctvDataControl
                        logs={logs}
                        onRefresh={onRefresh || (() => window.location.reload())}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {activePerspective === 'trends' ? (
                    <>
                        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-xl relative animate-in fade-in slide-in-from-left-2 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={18} className="text-blue-400" />
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Weekly Activity</h3>
                                        <p className="text-slate-500 text-[10px]">Logs recorded in the last 7 days</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-black text-blue-400">{metrics.avg}</span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase">Daily Avg</span>
                                </div>
                            </div>
                            <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="cLogs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} dy={5} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }} />
                                        <Area type="monotone" dataKey="logs" stroke="#3b82f6" strokeWidth={2} fill="url(#cLogs)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-xl flex flex-col items-center animate-in fade-in slide-in-from-right-2 duration-500">
                            <div className="w-full flex items-center gap-3 mb-6">
                                <Target size={18} className="text-purple-400" />
                                <h3 className="text-sm font-bold text-white">Case Types</h3>
                            </div>
                            <div className="h-40 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                                            {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl font-black text-white">{totalLogs}</span>
                                    <span className="text-[7px] font-bold text-slate-600 uppercase">Total</span>
                                </div>
                            </div>
                            <div className="w-full space-y-2 mt-4">
                                {donutData.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{d.name}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-white">{Math.round((d.value / (totalLogs || 1)) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-xl relative animate-in fade-in slide-in-from-left-2 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart3 size={18} className="text-orange-400" />
                                <h3 className="text-sm font-bold text-white">Most Frequent Cases</h3>
                            </div>
                            <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9 }} width={100} />
                                        <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={15} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-5 shadow-xl flex flex-col animate-in fade-in slide-in-from-right-2 duration-500">
                            <div className="w-full flex items-center gap-3 mb-6">
                                <Camera size={18} className="text-cyan-400" />
                                <h3 className="text-sm font-bold text-white">Busy Cameras</h3>
                            </div>
                            <div className="space-y-3 flex-1">
                                {topCameras.length > 0 ? topCameras.map((cam, i) => (
                                    <div key={i} className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase truncate pr-2">{cam.name}</span>
                                        <span className="text-[10px] font-mono font-black text-cyan-400">{cam.count} <span className="text-[7px] text-slate-500">LOGS</span></span>
                                    </div>
                                )) : (
                                    <div className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-2xl opacity-20">
                                        <span className="text-[9px] font-black uppercase tracking-widest">No Data</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}
