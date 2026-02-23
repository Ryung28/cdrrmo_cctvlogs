'use server';

import { CctvRepository } from '@/lib/repositories/cctv_repository';
import { cctvLogSchema, CctvLog } from '@/lib/schemas/cctv_schema';
import { revalidatePath } from 'next/cache';

export async function createCctvLogAction(formData: CctvLog) {
    // Validate data server-side
    const validatedFields = cctvLogSchema.safeParse(formData);

    if (!validatedFields.success) {
        return {
            error: 'Invalid fields. Please check your input.',
            details: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { data, error } = await CctvRepository.createLog(validatedFields.data);

    if (error) {
        console.error('Supabase Error:', error);
        return { error: 'Failed to create log entry. Please try again.' };
    }

    revalidatePath('/'); // Revalidate the home page to show updated logs if needed
    return { success: true, data };
}
