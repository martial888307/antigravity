'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { X } from 'lucide-react';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Omit<Client, 'id' | 'created_at'>) => Promise<void>;
    initialData?: Client | null;
}

export default function ClientModal({ isOpen, onClose, onSave, initialData }: ClientModalProps) {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        adresse: '',
        codePostal: '',
        ville: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nom: initialData.nom,
                prenom: initialData.prenom,
                adresse: initialData.adresse,
                codePostal: initialData.codePostal,
                ville: initialData.ville,
            });
        } else {
            setFormData({
                nom: '',
                prenom: '',
                adresse: '',
                codePostal: '',
                ville: '',
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving client:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-blue-100 shrink-0">
                    <h2 className="text-xl font-semibold text-blue-950">
                        {initialData ? 'Modifier le client' : 'Nouveau client'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="client-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-slate-900 mb-4">Informations personnelles</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-800 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-800 mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                        value={formData.prenom}
                                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-800 mb-1">Adresse</label>
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
                        form="client-form"
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
