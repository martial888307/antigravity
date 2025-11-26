'use client';

import { Client } from '@/types';
import { Trash2, MapPin } from 'lucide-react';

interface ClientListProps {
    clients: Client[];
    onEdit: (client: Client) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
    if (clients.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 mb-2">Aucun client trouvé</div>
                <div className="text-sm text-slate-500">Cliquez sur le bouton + pour commencer</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-6 py-4">Nom complet</th>
                            <th className="px-6 py-4">Adresse</th>
                            <th className="px-6 py-4">Ville</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clients.map((client) => (
                            <tr
                                key={client.id}
                                onClick={() => onEdit(client)}
                                className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                                        {client.nom} {client.prenom}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-slate-400" />
                                        {client.adresse}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                        {client.codePostal} {client.ville}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => onDelete(client.id, e)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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
    );
}
