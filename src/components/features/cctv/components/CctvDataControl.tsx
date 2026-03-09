'use client';

import { useState, useRef } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { CctvRepository } from '@/lib/repositories/cctv_repository';
import { CctvLogModel } from '@/lib/schemas/cctv_schema';
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface DataControlProps {
    logs: CctvLogModel[];
    onRefresh: () => void;
}

export default function CctvDataControl({ logs, onRefresh }: DataControlProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. BACKUP (EXPORT)
    const handleExport = async () => {
        try {
            setIsExporting(true);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const dataStr = JSON.stringify(logs, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `cctv_backup_${timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Backup created successfully');
        } catch (error) {
            toast.error('Export failed');
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    // 2. RESTORE (IMPORT)
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsImporting(true);
            const content = await file.text();
            const data = JSON.parse(content);

            if (!Array.isArray(data)) {
                throw new Error('Invalid backup format: Expected an array of logs');
            }

            // Bulk Upsert wrapping the logic for high integrity
            const { error } = await CctvRepository.bulkUpsertLogs(data);

            if (error) throw new Error(error);

            toast.success(`Successfully imported ${data.length} records`);
            onRefresh();

            // Clear input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
            toast.error(error.message || 'Import failed');
            console.error(error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
            />

            {/* EXPORT BUTTON */}
            <button
                onClick={handleExport}
                disabled={isExporting || logs.length === 0}
                title="Create JSON Backup"
                className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all duration-300",
                    "bg-blue-600/10 border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-blue-300 disabled:opacity-20 select-none cursor-pointer"
                )}
            >
                {isExporting ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : (
                    <Download size={12} />
                )}
                <span className="text-[9px] font-black uppercase tracking-widest">Backup</span>
            </button>

            {/* IMPORT BUTTON */}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                title="Restore from JSON"
                className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all duration-300",
                    "bg-[#bef264]/10 border-[#bef264]/20 hover:border-[#bef264]/40 text-[#bef264]/80 hover:text-[#bef264] disabled:opacity-20 select-none cursor-pointer"
                )}
            >
                {isImporting ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : (
                    <Upload size={12} />
                )}
                <span className="text-[9px] font-black uppercase tracking-widest">Restore</span>
            </button>
        </div>
    );
}
