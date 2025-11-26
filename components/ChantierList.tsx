'use client';

import { Chantier } from '@/types';
import { Trash2, MapPin, Calendar, User } from 'lucide-react';

interface ChantierListProps {
    chantiers: Chantier[];
    onEdit: (chantier: Chantier) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function ChantierList({ chantiers, onEdit, onDelete }: ChantierListProps) {
    if (chantiers.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-300 shadow-sm">
                <div className="text-slate-400 mb-2">Aucun chantier trouvé</div>
                <div className="text-sm text-slate-500">Cliquez sur le bouton + pour commencer</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {chantiers.map((chantier) => (
                    <div key={chantier.id} onClick={() => onEdit(chantier)} className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-slate-900 text-lg line-clamp-1">{chantier.description}</h3>
                                <div className="flex items-center gap-1 text-blue-700 text-sm font-medium mt-1">
                                    <User size={14} />
                                    <span>{chantier.client?.nom} {chantier.client?.prenom}</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => onDelete(chantier.id, e)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-slate-400 shrink-0" />
                                <span className="line-clamp-1">{chantier.adresse}, {chantier.ville}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400 shrink-0" />
                                <span>{new Date(chantier.date_debut).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Lieu</th>
                                <th className="px-6 py-4">Date début</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {chantiers.map((chantier) => (
                                <tr
                                    key={chantier.id}
                                    onClick={() => onEdit(chantier)}
                                    className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-950 group-hover:text-blue-800 transition-colors line-clamp-1">
                                            {chantier.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            {chantier.client?.nom} {chantier.client?.prenom}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-500" />
                                            {chantier.ville}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-500" />
                                            {new Date(chantier.date_debut).toLocaleDateString('fr-FR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={(e) => onDelete(chantier.id, e)}
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
