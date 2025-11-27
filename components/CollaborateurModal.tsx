'use client';

import { useState, useEffect } from 'react';
import { Collaborateur } from '@/types';
import { X, Upload } from 'lucide-react';

interface CollaborateurModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (collaborateur: Omit<Collaborateur, 'id' | 'created_at'>) => Promise<void>;
    initialData?: Collaborateur | null;
}

export default function CollaborateurModal({ isOpen, onClose, onSave, initialData }: CollaborateurModalProps) {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        poste: '',
        photo_url: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nom: initialData.nom,
                prenom: initialData.prenom,
                poste: initialData.poste,
                photo_url: initialData.photo_url || '',
            });
        } else {
            setFormData({
                nom: '',
                prenom: '',
                poste: '',
                photo_url: '',
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
            console.error('Error saving collaborateur:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-blue-100 shrink-0">
                    <h2 className="text-xl font-semibold text-blue-950">
                        {initialData ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="collaborateur-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                                    {formData.photo_url ? (
                                        <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-slate-400 text-3xl font-bold">
                                            {formData.prenom?.[0]}{formData.nom?.[0]}
                                        </span>
                                    )}
                                </div>
                                {/* Placeholder for upload feature - for now just URL input */}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-800 mb-1">Poste</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                value={formData.poste}
                                onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                                placeholder="Ex: Chef de chantier"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-800 mb-1">URL Photo (Optionnel)</label>
                            <input
                                type="url"
                                className="w-full px-3 py-2 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                                value={formData.photo_url}
                                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                                placeholder="https://..."
                            />
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
                        form="collaborateur-form"
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
