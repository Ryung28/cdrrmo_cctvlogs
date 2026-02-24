'use server';

import { CctvRepository } from '@/lib/repositories/cctv_repository';
import { cctvLogSchema, CctvLog, CctvReviewLog, OfflineCamerasLog, CctvLogModel, footageExtractionSchema } from '@/lib/schemas/cctv_schema';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function createCctvLogAction(formData: CctvLog) {
    console.log('[createCctvLogAction] Received formData:', JSON.stringify(formData, null, 2));

    // Validate data server-side using discriminated union
    const validatedFields = cctvLogSchema.safeParse(formData);

    if (!validatedFields.success) {
        console.error('[createCctvLogAction] Validation Error:', validatedFields.error.flatten());
        return {
            error: `Validation failed: ${validatedFields.error.issues.map(i => i.message).join(', ')}`,
        };
    }

    const validatedData = validatedFields.data;

    try {
        // Prepare data for database based on action type
        let dbData: any = {
            action_type: validatedData.action_type,
            date_of_action: validatedData.date_of_action || new Date().toISOString().split('T')[0],
            remarks: validatedData.remarks || '',
            classification_remarks: validatedData.classification_remarks || '',
        };

        // Handle different action types
        if (validatedData.action_type === 'Offline Cameras') {
            const offlineData = validatedData as OfflineCamerasLog;
            dbData.classification = '';
            dbData.camera_name = '';
            dbData.incident_datetime = '';
            dbData.client_name = '';

            // Handle offline cameras array - convert to JSON string
            if (offlineData.offline_cameras && Array.isArray(offlineData.offline_cameras)) {
                dbData.offline_cameras = JSON.stringify(offlineData.offline_cameras);
            } else {
                dbData.offline_cameras = '[]';
            }
        } else {
            const reviewData = validatedData as CctvReviewLog;
            dbData.classification = reviewData.classification || '';
            dbData.camera_name = reviewData.camera_name || '';
            dbData.incident_datetime = reviewData.incident_datetime || '';
            dbData.client_name = reviewData.client_name || '';
            dbData.offline_cameras = '[]';
        }

        const { data, error } = await CctvRepository.createLog(dbData);

        if (error) {
            console.error('Supabase Error:', error);
            return { error: `Failed to create log entry: ${error.message}` };
        }

        revalidatePath('/');
        return { success: true, data };
    } catch (error) {
        console.error('Unexpected Error:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

// Server action to fetch logs
export async function getLogsAction(page: number = 1, pageSize: number = 10) {
    try {
        // Senior Logic: Calculate offset for pagination
        const offset = (page - 1) * pageSize;

        // Parallel execution for high-performance dashboard stats
        const [logsResponse, reviewCount, extractCount, offlineCount] = await Promise.all([
            CctvRepository.getLogs({
                from: offset,
                to: offset + pageSize - 1
            }),
            supabase.from('cctv_logs').select('*', { count: 'exact', head: true }).eq('action_type', 'CCTV Review'),
            supabase.from('cctv_logs').select('*', { count: 'exact', head: true }).eq('action_type', 'Footage Extraction'),
            supabase.from('cctv_logs').select('*', { count: 'exact', head: true }).eq('action_type', 'Offline Cameras')
        ]);

        if (logsResponse.error) {
            console.error('Failed to fetch logs:', logsResponse.error);
            return { logs: [], total: 0, stats: { reviews: 0, extractions: 0, offline: 0 } };
        }

        return {
            logs: (logsResponse.data || []) as CctvLogModel[],
            total: logsResponse.count || 0,
            // Senior Logic: Return global stats so dashboard cards are always accurate
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
