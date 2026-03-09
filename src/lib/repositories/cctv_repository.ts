import { supabase } from '../supabase';
import { CctvLogModel } from '../schemas/cctv_schema';

export class CctvRepository {
    private static readonly TABLE_NAME = 'cctv_logs';

    // Accept any object to support flexible schema with offline_cameras JSON
    static async createLog(log: any): Promise<{ data: CctvLogModel | null; error: any }> {
        console.log('Creating log in Supabase...');

        const { data, error } = await supabase
            .from('cctv_logs')
            .insert([log])
            .select()
            .single();

        if (error) {
            console.error('Supabase createLog error:', JSON.stringify(error, null, 2));

            // Check if it's a table not found error
            if (error.code === '42P01' || (error.message && error.message.includes('relation'))) {
                console.log('Table cctv_logs not found. Please create the table in Supabase.');
                return { data: null, error: 'Database table not found. Please set up the Supabase table.' };
            }

            return { data: null, error: error.message };
        }

        console.log('Log created successfully:', data);
        return { data: data as CctvLogModel, error: null };
    }

    // Get all logs with pagination and filtering support
    static async getLogs(options?: {
        from?: number;
        to?: number;
        actionType?: string;
        startDate?: string;
        endDate?: string;
        cache?: boolean;
        cacheDuration?: number
    }): Promise<{ data: CctvLogModel[] | null; error: any; count: number | null }> {
        console.log('Fetching logs with filters:', {
            from: options?.from,
            to: options?.to,
            actionType: options?.actionType,
            startDate: options?.startDate,
            endDate: options?.endDate
        });

        let query = supabase
            .from('cctv_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        // Apply filters
        if (options?.actionType) {
            query = query.eq('action_type', options.actionType);
        }

        if (options?.startDate) {
            query = query.gte('date_of_action', options.startDate);
        }

        if (options?.endDate) {
            query = query.lte('date_of_action', options.endDate);
        }

        // Apply range if provided for pagination
        if (options?.from !== undefined && options?.to !== undefined) {
            query = query.range(options.from, options.to);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase getLogs error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });

            // Check if it's a table not found error
            if (error.code === '42P01') {
                console.log('Table cctv_logs not found (42P01).');
                return { data: [], error: null, count: 0 };
            }

            // For other errors, still return empty to prevent crash
            return { data: [], error: null, count: 0 };
        } else {
            console.log('Logs fetched successfully:', data?.length || 0, 'records, total count:', count);
        }

        return { data: data as CctvLogModel[], error: null, count };
    }

    static async getLogById(id: string): Promise<{ data: CctvLogModel | null; error: any }> {
        const { data, error } = await supabase
            .from('cctv_logs')
            .select('*')
            .eq('id', id)
            .single();

        return { data: data as CctvLogModel, error };
    }

    // Bulk upsert logs for import/restore
    static async bulkUpsertLogs(logs: any[]): Promise<{ data: CctvLogModel[] | null; error: any }> {
        console.log(`Bulk upserting ${logs.length} logs...`);

        const { data, error } = await supabase
            .from('cctv_logs')
            .upsert(logs, { onConflict: 'id' })
            .select();

        if (error) {
            console.error('Supabase bulkUpsertLogs error:', error);
            return { data: null, error: error.message };
        }

        return { data: data as CctvLogModel[], error: null };
    }

    static async deleteLog(id: string): Promise<{ error: any }> {
        const { error } = await supabase
            .from('cctv_logs')
            .delete()
            .eq('id', id);

        return { error };
    }
}
