'use client';

import { useState, useMemo } from 'react';
import { Chantier, Collaborateur, Intervention } from '@/types';
import { ChevronLeft, ChevronRight, Filter, Mic, Calendar as CalendarIcon, MapPin, User, Clock } from 'lucide-react';
import VoiceRecorder from '../VoiceRecorder';
import InterventionModal from './InterventionModal';

interface MobilePlanningViewProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    chantiers: Chantier[];
    collaborateurs: Collaborateur[];
    interventions: Intervention[];
    onRefresh: () => Promise<void>;
    onDeleteIntervention: (id: string) => Promise<void>;
}

export default function MobilePlanningView({
    currentDate,
    onDateChange,
    chantiers,
    collaborateurs,
    interventions,
    onRefresh,
    onDeleteIntervention
}: MobilePlanningViewProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedChantierId, setSelectedChantierId] = useState<string>('all');
    const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>([]);
    const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter interventions for current date and filters
    const dailyInterventions = useMemo(() => {
        return interventions.filter(intervention => {
            const intDate = new Date(intervention.date_debut);
            const isSameDay =
                intDate.getDate() === currentDate.getDate() &&
                intDate.getMonth() === currentDate.getMonth() &&
                intDate.getFullYear() === currentDate.getFullYear();

            if (!isSameDay) return false;

            if (selectedChantierId !== 'all' && intervention.chantier_id !== selectedChantierId) return false;
            if (selectedCollaboratorIds.length > 0 && !selectedCollaboratorIds.includes(intervention.collaborateur_id)) return false;

            return true;
        }).sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime());
    }, [interventions, currentDate, selectedChantierId, selectedCollaboratorIds]);

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        onDateChange(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        onDateChange(newDate);
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    const toggleCollaborator = (id: string) => {
        setSelectedCollaboratorIds(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-slate-800">Planning</h1>
                    <div className="flex items-center gap-2">
                        <VoiceRecorder
                            onRefresh={onRefresh}
                            chantiers={chantiers}
                            collaborateurs={collaborateurs}
                        />
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className={`p-2 rounded-full ${selectedChantierId !== 'all' || selectedCollaboratorIds.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-1">
                    <button onClick={handlePrevDay} className="p-2 hover:bg-white rounded-md transition-colors">
                        <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                    <div className="flex items-center gap-2" onClick={handleToday}>
                        <CalendarIcon size={18} className="text-slate-500" />
                        <span className="font-semibold text-slate-700 capitalize">
                            {currentDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                    <button onClick={handleNextDay} className="p-2 hover:bg-white rounded-md transition-colors">
                        <ChevronRight size={20} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Agenda List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {dailyInterventions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>Aucune intervention prévue</p>
                    </div>
                ) : (
                    dailyInterventions.map(intervention => {
                        const date = new Date(intervention.date_debut);
                        const isAM = date.getHours() < 12;
                        const period = isAM ? 'Matin' : 'Après-midi';
                        const timeRange = isAM ? '9h - 12h' : '14h - 17h';

                        return (
                            <div
                                key={intervention.id}
                                onClick={() => {
                                    setSelectedIntervention(intervention);
                                    setIsModalOpen(true);
                                }}
                                className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                        {intervention.collaborateur?.photo_url ? (
                                            <img
                                                src={intervention.collaborateur.photo_url}
                                                alt={intervention.collaborateur.prenom}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                                                {intervention.collaborateur?.prenom?.[0]}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-slate-800 truncate">
                                                {intervention.collaborateur?.prenom} {intervention.collaborateur?.nom}
                                            </h3>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isAM ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {timeRange}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1">
                                            <MapPin size={14} className="shrink-0" />
                                            <span className="truncate font-medium">{intervention.chantier?.description}</span>
                                        </div>

                                        <div className="text-xs text-slate-500 truncate pl-5">
                                            {intervention.chantier?.ville}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Filter Drawer/Modal */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h2 className="text-lg font-bold">Filtres</h2>
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="text-blue-600 font-medium"
                        >
                            Terminé
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Chantier Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Chantier</label>
                            <select
                                value={selectedChantierId}
                                onChange={(e) => setSelectedChantierId(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">Tous les chantiers</option>
                                {chantiers.map(chantier => (
                                    <option key={chantier.id} value={chantier.id}>
                                        {chantier.client?.nom ? `${chantier.client.nom} - ` : ''}{chantier.description} ({chantier.ville})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Collaborator Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Collaborateurs</label>
                            <div className="grid grid-cols-2 gap-2">
                                {collaborateurs.map(collab => {
                                    const isSelected = selectedCollaboratorIds.includes(collab.id);
                                    return (
                                        <button
                                            key={collab.id}
                                            onClick={() => toggleCollaborator(collab.id)}
                                            className={`p-3 rounded-lg border text-left transition-all ${isSelected
                                                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="font-medium text-sm text-slate-900">
                                                {collab.prenom} {collab.nom}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {collab.poste}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setSelectedChantierId('all');
                                setSelectedCollaboratorIds([]);
                            }}
                            className="w-full py-3 text-red-600 font-medium bg-red-50 rounded-lg"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                </div>
            )}

            {/* Intervention Detail Modal */}
            <InterventionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDelete={async (id) => {
                    await onDeleteIntervention(id);
                    setIsModalOpen(false);
                }}
                intervention={selectedIntervention}
            />
        </div>
    );
}
