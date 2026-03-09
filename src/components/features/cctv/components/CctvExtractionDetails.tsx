'use client';

import { Building2 } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CctvLog } from '@/lib/schemas/cctv_schema';

interface CctvExtractionDetailsProps {
    register: UseFormRegister<CctvLog>;
    errors: FieldErrors<CctvLog>;
}

export default function CctvExtractionDetails({ register, errors }: CctvExtractionDetailsProps) {
    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-2">
                <label className="enterprise-label font-outfit tracking-widest text-slate-500">OFFICE / DEPARTMENT</label>
                <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                        type="text"
                        placeholder="e.g. PNP, NBI, Brgy. Hall, etc."
                        className="enterprise-input !pl-12 !bg-slate-950/50 font-bold text-white font-mono"
                        {...register('office' as any)}
                    />
                </div>
                {errors && (errors as any).office && (
                    <p className="text-red-500 text-[10px] font-bold uppercase mt-2">
                        {(errors as any).office.message}
                    </p>
                )}
            </div>
        </div>
    );
}
