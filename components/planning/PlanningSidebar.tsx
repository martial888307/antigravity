'use client';

import { useState, useEffect } from 'react';
import { Chantier, Collaborateur } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { X, Clock, Eye, EyeOff } from 'lucide-react';

interface PlanningSidebarProps {
    chantiers: Chantier[];
    collaborateurs: Collaborateur[];
    selectedChantier: Chantier | null;
    onSelectChantier: (chantier: Chantier | null) => void;
    interventions: any[]; // We'll type this properly later or use a derived type
    filteredCollaboratorIds: string[];
    onToggleFilter: (id: string) => void;
    children?: React.ReactNode;
}

export default function PlanningSidebar({
    chantiers,
    collaborateurs,
    selectedChantier,
    onSelectChantier,
    interventions,
    filteredCollaboratorIds,
    onToggleFilter,
    children
}: PlanningSidebarProps) {
    // Calculate stats for selected chantier
    const getChantierStats = () => {
        if (!selectedChantier) return null;
        const plannedHours = interventions
            .filter((i) => i.chantier_id === selectedChantier.id)
            .reduce((acc, curr) => {
                const start = new Date(curr.date_debut);
                const end = new Date(curr.date_fin);
                const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                return acc + hours;
            }, 0);

        return {
            planned: plannedHours,
            sold: selectedChantier.temps_vendu || 0,
            remaining: (selectedChantier.temps_vendu || 0) - plannedHours,
        };
    };

    const stats = getChantierStats();

    return (
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Planning</h2>

                {/* Chantier Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Chantier en cours</label>
                    {selectedChantier ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 relative">
                            <button
                                onClick={() => onSelectChantier(null)}
                                className="absolute top-2 right-2 text-blue-400 hover:text-blue-700"
                            >
                                <X size={16} />
                            </button>
                            <div className="font-semibold text-blue-900 pr-6 truncate">{selectedChantier.description}</div>
                            <div className="text-xs text-blue-700 mt-1">
                                {selectedChantier.client?.nom ? <span className="font-medium">{selectedChantier.client.nom} - </span> : ''}
                                {selectedChantier.ville}
                            </div>

                            {/* Stats */}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/50 p-1.5 rounded">
                                    <div className="text-blue-500">Vendu</div>
                                    <div className="font-bold text-blue-900">{stats?.sold}h</div>
                                </div>
                                <div className="bg-white/50 p-1.5 rounded">
                                    <div className="text-blue-500">Planifié</div>
                                    <div className={`font-bold ${stats!.planned > stats!.sold ? 'text-red-600' : 'text-blue-900'}`}>
                                        {stats?.planned}h
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <select
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => {
                                const chantier = chantiers.find(c => c.id === e.target.value);
                                onSelectChantier(chantier || null);
                            }}
                            value=""
                        >
                            <option value="" disabled>Sélectionner un chantier...</option>
                            {chantiers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.client?.nom ? `${c.client.nom} - ` : ''}{c.description}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Collaborators List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Équipe</h3>
                    {filteredCollaboratorIds.length > 0 && (
                        <button
                            onClick={() => filteredCollaboratorIds.forEach(id => onToggleFilter(id))}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            Tout afficher
                        </button>
                    )}
                </div>
                <div className="space-y-3">
                    {collaborateurs.map((collab, index) => (
                        <DraggableCollaborator
                            key={collab.id}
                            collaborateur={collab}
                            index={index}
                            isFiltered={filteredCollaboratorIds.includes(collab.id)}
                            onToggleFilter={() => onToggleFilter(collab.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function DraggableCollaborator({
    collaborateur,
    index,
    isFiltered,
    onToggleFilter
}: {
    collaborateur: Collaborateur;
    index: number;
    isFiltered: boolean;
    onToggleFilter: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `collab-${collaborateur.id}`,
        data: {
            type: 'collaborator',
            collaborateur
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    // Generate a consistent color based on index
    const colors = [
        'bg-red-100 text-red-800 border-red-200',
        'bg-green-100 text-green-800 border-green-200',
        'bg-blue-100 text-blue-800 border-blue-200',
        'bg-yellow-100 text-yellow-800 border-yellow-200',
        'bg-purple-100 text-purple-800 border-purple-200',
        'bg-pink-100 text-pink-800 border-pink-200',
    ];
    const colorClass = colors[index % colors.length];

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onToggleFilter}
                className={`p-1 rounded hover:bg-slate-100 ${isFiltered ? 'text-blue-600' : 'text-slate-300'}`}
                title={isFiltered ? "Masquer" : "Filtrer"}
            >
                {isFiltered ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className={`flex-1 flex items-center gap-3 p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${colorClass}`}
            >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-white/50 shrink-0">
                    {collaborateur.photo_url ? (
                        <img src={collaborateur.photo_url} alt={collaborateur.prenom} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                            {collaborateur.prenom[0]}{collaborateur.nom[0]}
                        </div>
                    )}
                </div>
                <div>
                    <div className="font-semibold text-sm">{collaborateur.prenom} {collaborateur.nom}</div>
                    <div className="text-xs opacity-80">{collaborateur.poste}</div>
                </div>
            </div>
        </div>
    );
}
