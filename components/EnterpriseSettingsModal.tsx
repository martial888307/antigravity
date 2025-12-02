'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Building2, Save, Loader2, X } from 'lucide-react';

interface EnterpriseSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EnterpriseSettingsModal({ isOpen, onClose }: EnterpriseSettingsModalProps) {
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

            // Close modal after short delay on success
            setTimeout(() => {
                setMessage(null);
                onClose();
            }, 1500);

        } catch (error: any) {
            console.error('Error updating enterprise:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="text-blue-600" size={24} />
                        Mon Entreprise
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {authLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : !entreprise ? (
                        <div className="text-center py-8 text-slate-500">
                            Aucune entreprise associée.
                        </div>
                    ) : (
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
                                    Statut : <span className="font-medium text-blue-600 capitalize">{entreprise.subscription_status}</span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Enregistrer
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.text}
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
