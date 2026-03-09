'use server';

import { CctvRepository } from '@/lib/repositories/cctv_repository';
import { cctvLogSchema, CctvLog, CctvReviewLog, OfflineCamerasLog, CctvLogModel, footageExtractionSchema } from '@/lib/schemas/cctv_schema';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

/**
 * Server Action: createCCTVLog
 * Pattern: Typed Result Pattern
 * Description: Inserts a new CCTV log entry into the Supabase 'cctv_logs' table.
 */
export async function createCCTVLog(formData: CctvLog) {
    console.log('[TRANSIT] createCCTVLog Payload Triggered');

    // 1. Zod Validation (The Brain)
    const validatedFields = cctvLogSchema.safeParse(formData);

    if (!validatedFields.success) {
        console.error('[CRITICAL] Server Validation Failure:', validatedFields.error.flatten());
        return {
            success: false,
            message: 'Validation failed. Please check the operational parameters.',
            errors: validatedFields.error.flatten().fieldErrors
        };
    }

    const validatedData = validatedFields.data;

    try {
        // 2. Data Preparation (The Manager)
        let dbData: any = {
            action_type: validatedData.action_type,
            date_of_action: validatedData.date_of_action || new Date().toISOString().split('T')[0],
            remarks: validatedData.remarks || '',
            classification_remarks: validatedData.classification_remarks || '',
            contact_number: (validatedData as any).contact_number || '',
            address: (validatedData as any).address || '',
            office: (validatedData as any).office || '',
        };

        // Handle discriminatory logic for Offline Cameras vs Reviews
        if (validatedData.action_type === 'Offline Cameras') {
            const offlineData = validatedData as OfflineCamerasLog;
            dbData.classification = 'Offline';
            dbData.camera_name = '';
            dbData.incident_datetime = '';
            dbData.client_name = '';

            // PASS RAW OBJECT: Supabase-js handles JSONB serialization
            dbData.offline_cameras = offlineData.offline_cameras || [];
        } else {
            const reviewData = validatedData as any;
            dbData.classification = reviewData.classification || '';

            if (reviewData.cameras && Array.isArray(reviewData.cameras)) {
                dbData.camera_name = reviewData.cameras.map((c: any) => c.name).join(', ');
            } else {
                dbData.camera_name = '';
            }

            dbData.incident_datetime = reviewData.incident_datetime || '';
            dbData.incident_datetime_end = reviewData.incident_datetime_end || '';
            dbData.client_name = reviewData.client_name || '';
            dbData.offline_cameras = [];
        }

        // 3. Database Commit (The Vault)
        let { data, error } = await CctvRepository.createLog(dbData);

        // EXTRAORDINARY MEASURE: Handle PGRST204 Cache Desync
        // If the API refuses the new column, retry without it to ensure the log is saved
        if (error && (error.message?.includes('incident_datetime_end') || error.includes('incident_datetime_end'))) {
            console.warn('[RECOVERY] Supabase cache desync detected. Retrying without incident_datetime_end.');
            const fallbackData = { ...dbData };
            delete fallbackData.incident_datetime_end;
            const retry = await CctvRepository.createLog(fallbackData);
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error('[SUPABASE] Insertion Error:', error);
            return {
                success: false,
                message: `DATABASE_REJECTION: ${error.message || error}`
            };
        }

        // 4. Path Revalidation (Sync)
        revalidatePath('/');
        return {
            success: true,
            message: 'Log Committed: Entry successfully synced to the central matrix.',
            data
        };
    } catch (error) {
        console.error('[UNEXPECTED] Action Crash:', error);
        return {
            success: false,
            message: 'Critical system error: Handshake rejected by server.'
        };
    }
}

// Server action to fetch logs with advanced filtering
export async function getLogsAction(page: number = 1, pageSize: number = 10, actionType?: string, startDate?: string, endDate?: string) {
    try {
        // Senior Logic: Calculate offset for pagination
        const offset = (page - 1) * pageSize;

        // Base queries for parallel stats acquisition
        const reviewQuery = supabase.from('cctv_logs').select('*', { count: 'exact', head: true }).eq('action_type', 'CCTV Review');
        const extractQuery = supabase.from('cctv_logs').select('*', { count: 'exact', head: true }).eq('action_type', 'Footage Extraction');
        const offlineQuery = supabase.from('cctv_logs').select('*', { count: 'exact', head: true }).eq('action_type', 'Offline Cameras');

        // Apply date range filter to status cards if provided
        if (startDate) {
            reviewQuery.gte('date_of_action', startDate);
            extractQuery.gte('date_of_action', startDate);
            offlineQuery.gte('date_of_action', startDate);
        }

        if (endDate) {
            reviewQuery.lte('date_of_action', endDate);
            extractQuery.lte('date_of_action', endDate);
            offlineQuery.lte('date_of_action', endDate);
        }

        // Parallel execution for high-performance dashboard stats
        const [logsResponse, reviewCount, extractCount, offlineCount] = await Promise.all([
            CctvRepository.getLogs({
                from: offset,
                to: offset + pageSize - 1,
                actionType,
                startDate,
                endDate
            }),
            reviewQuery,
            extractQuery,
            offlineQuery
        ]);

        if (logsResponse.error) {
            console.error('Failed to fetch logs:', logsResponse.error);
            return { logs: [], total: 0, stats: { reviews: 0, extractions: 0, offline: 0 } };
        }

        return {
            logs: (logsResponse.data || []) as CctvLogModel[],
            total: logsResponse.count || 0,
            // Senior Logic: Return global stats relative to the selected date if present
            stats: {
                total: logsResponse.count || 0,
                reviews: reviewCount.count || 0,
                extractions: extractCount.count || 0,
                offline: offlineCount.count || 0
            }
        };
    } catch (error) {
        console.error('Error fetching logs:', error);
        return { logs: [], total: 0, stats: { reviews: 0, extractions: 0, offline: 0 } };
    }
}

// Server action to delete a log
export async function deleteLogAction(id: string) {
    try {
        const { error } = await CctvRepository.deleteLog(id);

        if (error) {
            console.error('Failed to delete log:', error);
            return { error: 'Failed to delete log entry.' };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting log:', error);
        return { error: 'An unexpected error occurred while deleting.' };
    }
}
