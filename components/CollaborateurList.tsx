'use client';

import { Collaborateur } from '@/types';
import { Trash2, Briefcase } from 'lucide-react';

interface CollaborateurListProps {
    collaborateurs: Collaborateur[];
    onEdit: (collaborateur: Collaborateur) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function CollaborateurList({ collaborateurs, onEdit, onDelete }: CollaborateurListProps) {
    if (collaborateurs.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-300 shadow-sm">
                <div className="text-slate-400 mb-2">Aucun collaborateur trouvé</div>
                <div className="text-sm text-slate-500">Cliquez sur le bouton + pour ajouter un membre</div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborateurs.map((collab) => (
                <div
                    key={collab.id}
                    onClick={() => onEdit(collab)}
                    className="bg-white rounded-xl border border-slate-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group relative"
                >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => onDelete(collab.id, e)}
                            className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors shadow-sm"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md mb-4">
                            {collab.photo_url ? (
                                <img src={collab.photo_url} alt={`${collab.prenom} ${collab.nom}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                                    {collab.prenom[0]}{collab.nom[0]}
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {collab.prenom} {collab.nom}
                        </h3>

                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                            <Briefcase size={14} />
                            <span>{collab.poste}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
