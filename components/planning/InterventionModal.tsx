'use client';

import { Intervention } from '@/types';
import { X, Calendar, Clock, MapPin, User, Trash2 } from 'lucide-react';

interface InterventionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (id: string) => void;
    intervention: Intervention | null;
}

export default function InterventionModal({ isOpen, onClose, onDelete, intervention }: InterventionModalProps) {
    if (!isOpen || !intervention) return null;

    const date = new Date(intervention.date_debut);
    const isAM = date.getHours() < 12;
    const period = isAM ? 'Matin (9h - 12h)' : 'Après-midi (14h - 17h)';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Détails de l'intervention</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Collaborator Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0">
                            {intervention.collaborateur?.photo_url ? (
                                <img
                                    src={intervention.collaborateur.photo_url}
                                    alt={intervention.collaborateur.prenom}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-slate-400">
                                    {intervention.collaborateur?.prenom?.[0]}{intervention.collaborateur?.nom?.[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">
                                {intervention.collaborateur?.prenom} {intervention.collaborateur?.nom}
                            </div>
                            <div className="text-sm text-slate-500">{intervention.collaborateur?.poste}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 text-slate-700">
                            <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-medium">Date</div>
                                <div className="text-sm text-slate-600">{date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-slate-700">
                            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-medium">Créneau</div>
                                <div className="text-sm text-slate-600">{period}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-slate-700">
                            <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-medium">Chantier</div>
                                <div className="text-sm text-slate-600 font-semibold">{intervention.chantier?.description}</div>
                                <div className="text-sm text-slate-500">
                                    {intervention.chantier?.client?.nom ? `${intervention.chantier.client.nom} - ` : ''}
                                    {intervention.chantier?.ville}
                                </div>
                            </div>
                        </div>

                        {intervention.commentaire && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 italic">
                                "{intervention.commentaire}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => onDelete(intervention.id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium"
                    >
                        <Trash2 size={18} />
                        <span>Supprimer</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md shadow-blue-200 transition-all font-medium"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}
