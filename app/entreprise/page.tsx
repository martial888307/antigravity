'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Building2, Save, Loader2 } from 'lucide-react';

export default function EnterprisePage() {
    const { entreprise, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        siret: '',
    });

    useEffect(() => {
        if (entreprise) {
            setFormData({
                nom: entreprise.nom || '',
                email: entreprise.email || '',
                siret: entreprise.siret || '',
            });
        }
    }, [entreprise]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entreprise) return;

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('entreprises')
                .update({
                    nom: formData.nom,
                    email: formData.email,
                    siret: formData.siret,
                })
                .eq('id', entreprise.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Informations mises à jour avec succès.' });
        } catch (error: any) {
            console.error('Error updating enterprise:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!entreprise) {
        return (
            <div className="p-8 text-center text-slate-600">
                Aucune entreprise associée.
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Building2 className="text-blue-600" size={32} />
                    Mon Entreprise
                </h1>
                <p className="text-slate-600 mt-2">
                    Gérez les informations de votre société.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-1">
                                Nom de l'entreprise
                            </label>
                            <input
                                type="text"
                                id="nom"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="siret" className="block text-sm font-medium text-slate-700 mb-1">
                                Numéro SIRET
                            </label>
                            <input
                                type="text"
                                id="siret"
                                value={formData.siret}
                                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="123 456 789 00012"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email de contact
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Statut de l'abonnement : <span className="font-medium text-blue-600 capitalize">{entreprise.subscription_status}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Enregistrer
                        </button>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
