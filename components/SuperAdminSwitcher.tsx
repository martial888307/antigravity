'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { Entreprise } from '@/types';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SuperAdminSwitcher() {
    const { profile, user } = useAuth();
    const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Only fetch if user is super admin
    useEffect(() => {
        if (profile?.is_super_admin) {
            fetchEntreprises();
        }
    }, [profile]);

    const fetchEntreprises = async () => {
        const { data, error } = await supabase
            .from('entreprises')
            .select('*')
            .order('nom');

        if (data) {
            setEntreprises(data as Entreprise[]);
        }
    };

    const handleSwitch = async (entrepriseId: string | null) => {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ override_entreprise_id: entrepriseId })
                .eq('id', user.id);

            if (error) throw error;

            // Force reload to refresh all data with new RLS context
            window.location.reload();
        } catch (error) {
            console.error('Error switching context:', error);
            alert('Erreur lors du changement de contexte');
            setLoading(false);
        }
    };

    if (!profile?.is_super_admin) return null;

    const currentOverride = profile.override_entreprise_id;
    const isImpersonating = !!currentOverride;

    return (
        <div className="px-4 py-2 mt-2 border-t border-slate-200 bg-slate-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider w-full mb-2 ${isImpersonating ? 'text-red-600' : 'text-slate-500'}`}
            >
                {isImpersonating ? (
                    <>
                        <Eye size={14} />
                        Mode Super Admin (Actif)
                    </>
                ) : (
                    <>
                        <EyeOff size={14} />
                        Mode Super Admin
                    </>
                )}
            </button>

            {isOpen && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <select
                        value={currentOverride || ''}
                        onChange={(e) => handleSwitch(e.target.value || null)}
                        disabled={loading}
                        className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">-- Vue par défaut (Mon entreprise) --</option>
                        {entreprises.map((ent) => (
                            <option key={ent.id} value={ent.id}>
                                {ent.nom}
                            </option>
                        ))}
                    </select>

                    {loading && (
                        <div className="flex justify-center">
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
