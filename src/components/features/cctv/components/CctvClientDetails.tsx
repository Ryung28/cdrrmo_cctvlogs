'use client';

import { Phone, MapPin } from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CctvLog } from '@/lib/schemas/cctv_schema';

interface CctvClientDetailsProps {
    register: UseFormRegister<CctvLog>;
    errors: FieldErrors<CctvLog>;
    setValue: UseFormSetValue<CctvLog>;
    watch: UseFormWatch<CctvLog>;
}

export default function CctvClientDetails({ register, errors, setValue, watch }: CctvClientDetailsProps) {
    // Technical Patterns Applied: Type-Safe Error Narrowing
    // We cast to a broad error map to safely access union-specific fields without TS compiler noise
    const formErrors = errors as FieldErrors<any>;

    // Dynamic masking for Philippines contact numbers
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 11);
        setValue('contact_number' as any, val, { shouldValidate: true });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-2">
                <label className="enterprise-label font-outfit tracking-widest text-slate-500">CONTACT NUMBER</label>
                <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                        type="text"
                        placeholder="09XXXXXXXXX"
                        className="enterprise-input !pl-12 !bg-slate-950/50 font-bold text-white font-mono"
                        {...register('contact_number' as any)}
                        onChange={handleContactChange}
                    />
                </div>
                {formErrors.contact_number && (
                    <p className="text-red-500 text-[10px] font-bold uppercase mt-2">
                        {formErrors.contact_number.message as string}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label className="enterprise-label font-outfit tracking-widest text-slate-500">COMPLETE ADDRESS</label>
                <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                        type="text"
                        placeholder="House No., Street, Brgy, City"
                        className="enterprise-input !pl-12 !bg-slate-950/50 font-bold text-white font-mono"
                        {...register('address' as any)}
                    />
                </div>
                {formErrors.address && (
                    <p className="text-red-500 text-[10px] font-bold uppercase mt-2">
                        {formErrors.address.message as string}
                    </p>
                )}
            </div>
        </div>
    );
}
