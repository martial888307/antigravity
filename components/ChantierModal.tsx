'use client';

import { useState, useEffect } from 'react';
import { Chantier, Client } from '@/types';
import { X } from 'lucide-react';

interface ChantierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (chantier: Omit<Chantier, 'id' | 'created_at' | 'client'>) => Promise<void>;
    initialData?: Chantier | null;
    selectedClient?: Client | null;
}

export default function ChantierModal({ isOpen, onClose, onSave, initialData, selectedClient }: ChantierModalProps) {
    const [formData, setFormData] = useState({
        description: '',
        adresse: '',
        codePostal: '',
        ville: '',
        date_debut: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                description: initialData.description,
                adresse: initialData.adresse,
                codePostal: initialData.codePostal,
                ville: initialData.ville,
                date_debut: initialData.date_debut,
            });
        } else if (selectedClient) {
            // Pre-fill with selected client's address
            setFormData({
                description: '',
                adresse: selectedClient.adresse,
                codePostal: selectedClient.codePostal,
                ville: selectedClient.ville,
                date_debut: new Date().toISOString().split('T')[0],
            });
        }
    }, [initialData, selectedClient, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient && !initialData) return; // Should not happen

        setLoading(true);
        try {
            await onSave({
                ...formData,
                client_id: initialData ? initialData.client_id : selectedClient!.id,
            });
            onClose();
        } catch (error) {
            console.error('Error saving chantier:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-blue-100 shrink-0">
                    <h2 className="text-xl font-semibold text-blue-950">
                        {initialData ? 'Modifier le chantier' : 'Nouveau chantier'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="chantier-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                <div className="text-sm text-blue-600 font-medium mb-1">Client</div>
                                <div className="text-lg font-semibold text-blue-900">
                                    {initialData?.client?.nom || selectedClient?.nom} {initialData?.client?.prenom || selectedClient?.prenom}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-800 mb-1">Description du chantier</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Rénovation salle de bain..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-800 mb-1">Date de début</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    value={formData.date_debut}
                                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-800 mb-1">Adresse du chantier</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                    value={formData.adresse}
                                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-800 mb-1">Code Postal</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                        value={formData.codePostal}
                                        onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-800 mb-1">Ville</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                        value={formData.ville}
                                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-full min-h-[300px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                            <iframe
                                width="100%"
                                height="100%"
                                className="absolute inset-0"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                    `${formData.adresse} ${formData.codePostal} ${formData.ville}`
                                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            ></iframe>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-100 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="chantier-form"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md shadow-blue-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
