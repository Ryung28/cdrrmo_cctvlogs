import { supabase } from '../supabase';
import { CctvLog, CctvLogModel } from '../schemas/cctv_schema';

export class CctvRepository {
    private static readonly TABLE_NAME = 'cctv_logs';

    static async createLog(log: CctvLog): Promise<{ data: CctvLogModel | null; error: any }> {
        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .insert([log])
            .select()
            .single();

        return { data: data as CctvLogModel, error };
    }

    static async getLogs(): Promise<{ data: CctvLogModel[] | null; error: any }> {
        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        return { data: data as CctvLogModel[], error };
    }

    static async getLogById(id: string): Promise<{ data: CctvLogModel | null; error: any }> {
        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        return { data: data as CctvLogModel, error };
    }
}
