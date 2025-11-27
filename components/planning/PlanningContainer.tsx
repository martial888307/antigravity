'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { supabase } from '@/lib/supabaseClient';
import { Chantier, Collaborateur, Intervention } from '@/types';
import PlanningSidebar from './PlanningSidebar';
import CalendarGrid from './CalendarGrid';
import InterventionModal from './InterventionModal';

function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function PlanningContainer() {
    const [chantiers, setChantiers] = useState<Chantier[]>([]);
    const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [selectedChantier, setSelectedChantier] = useState<Chantier | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeCollaborateur, setActiveCollaborateur] = useState<Collaborateur | null>(null);
    const [filteredCollaboratorIds, setFilteredCollaboratorIds] = useState<string[]>([]);
    const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [showAllInterventions, setShowAllInterventions] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [chantiersRes, collabRes, interventionsRes] = await Promise.all([
            supabase.from('test-chantier').select('*, client:test-client(*)'),
            supabase.from('test-collaborateur').select('*'),
            supabase.from('test-intervention').select('*, chantier:test-chantier(*, client:test-client(*)), collaborateur:test-collaborateur(*)')
        ]);

        if (chantiersRes.data) setChantiers(chantiersRes.data as any);
        if (collabRes.data) setCollaborateurs(collabRes.data);
        if (interventionsRes.data) setInterventions((interventionsRes.data as any) || []);
    };

    const toggleCollaboratorFilter = (id: string) => {
        setFilteredCollaboratorIds(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleDragStart = (event: any) => {
        const { active } = event;
        setActiveId(active.id);

        if (active.data.current?.type === 'collaborator') {
            setActiveCollaborateur(active.data.current?.collaborateur);
        } else if (active.data.current?.type === 'intervention') {
            // For intervention drag, we can reuse activeCollaborateur for the preview if we want, 
            // or just rely on the fact that we have the data.
            // Let's set activeCollaborateur so the DragOverlay works with the existing code
            setActiveCollaborateur(active.data.current?.collaborateur);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveId(null);
        setActiveCollaborateur(null);

        if (!over) return;

        const { date, period } = over.data.current as { date: Date; period: 'AM' | 'PM' };
        if (!date) return;

        // Calculate start and end times for the target slot
        const startHour = period === 'AM' ? 9 : 14;
        const endHour = period === 'AM' ? 12 : 17;

        const dateDebut = new Date(date);
        dateDebut.setHours(startHour, 0, 0, 0);

        const dateFin = new Date(date);
        dateFin.setHours(endHour, 0, 0, 0);

        const type = active.data.current?.type;

        // CASE 1: Creating a new intervention (Drag from Sidebar)
        if (type === 'collaborator') {
            if (!selectedChantier) {
                alert("Veuillez d'abord sélectionner un chantier dans la colonne de gauche.");
                return;
            }

            const collaborateur = active.data.current?.collaborateur as Collaborateur;
            if (!collaborateur) {
                console.error("Collaborateur missing in drag data");
                return;
            }

            console.log("Creating intervention for:", collaborateur.prenom, "on", selectedChantier.description);

            // Optimistic UI update
            const tempId = generateUUID();

            const newIntervention: Intervention = {
                id: tempId,
                chantier_id: selectedChantier.id,
                collaborateur_id: collaborateur.id,
                date_debut: dateDebut.toISOString(),
                date_fin: dateFin.toISOString(),
                chantier: selectedChantier,
                collaborateur: collaborateur,
            };

            setInterventions([...interventions, newIntervention]);

            // Persist to DB
            const { data, error } = await supabase.from('test-intervention').insert([{
                id: tempId,
                chantier_id: selectedChantier.id,
                collaborateur_id: collaborateur.id,
                date_debut: dateDebut.toISOString(),
                date_fin: dateFin.toISOString(),
            }]).select().single();

            if (error) {
                console.error('Error creating intervention:', error);
                setInterventions(prev => prev.filter(i => i.id !== tempId));
                alert(`Erreur lors de la création: ${error.message}`);
            }
        }
        // CASE 2: Moving an existing intervention (Drag from Grid)
        else if (type === 'intervention') {
            const intervention = active.data.current?.intervention as Intervention;
            if (!intervention) return;

            // Don't do anything if dropped on the same slot
            const currentStart = new Date(intervention.date_debut);
            if (currentStart.getTime() === dateDebut.getTime()) return;

            // Optimistic Update
            const updatedIntervention = {
                ...intervention,
                date_debut: dateDebut.toISOString(),
                date_fin: dateFin.toISOString(),
            };

            setInterventions(prev => prev.map(i => i.id === intervention.id ? updatedIntervention : i));

            // Persist to DB
            const { data, error } = await supabase.from('test-intervention').update({
                date_debut: dateDebut.toISOString(),
                date_fin: dateFin.toISOString(),
            }).eq('id', intervention.id).select('*'); // Added .select('*') to get data back

            if (error) {
                console.error('Error fetching interventions:', error);
                // Revert
                setInterventions(prev => prev.map(i => i.id === intervention.id ? intervention : i));
                alert(`Erreur lors du déplacement: ${error.message}`);
            } else {
                // If successful, refetch all interventions to ensure state is consistent
                // Or, if data contains the updated list, use it directly.
                // Assuming data here is the updated list of interventions from the select('*')
                // This might be a full refetch or just the updated record depending on the select() usage.
                // Given the instruction, we'll assume it's meant to be the full list or a way to trigger a full refresh.
                // For simplicity and to match the instruction, we'll call fetchData() to ensure consistency.
                // If the intent was to use `data` from the update, it would typically be `data.single()`
                // and then update the specific intervention in state.
                // However, the instruction specifically uses `(data as any) || []` which implies a list.
                // The most robust way to ensure the state is correct after an update is to refetch all.
                await fetchData();
            }
        }
    };

    const handleDeleteIntervention = async (id: string) => {
        console.log('Attempting to delete intervention:', id);

        // Perform delete and check count
        const { error, count } = await supabase
            .from('test-intervention')
            .delete({ count: 'exact' })
            .eq('id', id);

        if (error) {
            console.error('Error deleting intervention:', error);
            alert(`Erreur lors de la suppression: ${error.message} (ID: ${id})`);
        } else {
            if (count === 0) {
                console.warn('No rows deleted for ID:', id);
                alert("Attention: L'intervention semble avoir déjà été supprimée.");
            }
            // Update UI only after success
            setInterventions(prev => prev.filter(i => i.id !== id));
            setSelectedIntervention(null); // Close modal
        }
    };

    // Filter interventions
    const filteredInterventions = interventions.filter(i => {
        // 1. Filter by Chantier (unless "Show All" is checked)
        if (selectedChantier && !showAllInterventions && i.chantier_id !== selectedChantier.id) {
            return false;
        }
        // 2. Filter by Collaborator (if any selected)
        if (filteredCollaboratorIds.length > 0 && !filteredCollaboratorIds.includes(i.collaborateur_id)) {
            return false;
        }
        return true;
    });

    return (
        <div className={`flex ${isExpanded ? 'h-auto min-h-[85vh]' : 'h-[85vh]'} overflow-hidden transition-all duration-300`}>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <PlanningSidebar
                    chantiers={chantiers}
                    collaborateurs={collaborateurs}
                    selectedChantier={selectedChantier}
                    onSelectChantier={setSelectedChantier}
                    interventions={interventions}
                    filteredCollaboratorIds={filteredCollaboratorIds}
                    onToggleFilter={toggleCollaboratorFilter}
                >
                    {/* Toggle Switch for Chantier Filter */}
                    {selectedChantier && (
                        <div className="mt-4 px-4">
                            <label className="flex items-center cursor-pointer gap-2">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={showAllInterventions}
                                        onChange={(e) => setShowAllInterventions(e.target.checked)}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${showAllInterventions ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showAllInterventions ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <span className="text-xs font-medium text-slate-600">
                                    {showAllInterventions ? 'Tout voir' : 'Chantier en cours'}
                                </span>
                            </label>
                        </div>
                    )}
                </PlanningSidebar>

                <CalendarGrid
                    currentDate={currentDate}
                    interventions={filteredInterventions}
                    collaborateurs={collaborateurs}
                    onInterventionClick={setSelectedIntervention}
                    onDateChange={setCurrentDate}
                    onTodayClick={() => setCurrentDate(new Date())}
                    isExpanded={isExpanded}
                    onToggleExpand={() => setIsExpanded(!isExpanded)}
                />

                <DragOverlay>
                    {activeCollaborateur ? (
                        <div className="flex items-center gap-3 p-2 rounded-lg border bg-white shadow-xl opacity-90 w-64 cursor-grabbing">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shrink-0">
                                {activeCollaborateur.photo_url ? (
                                    <img src={activeCollaborateur.photo_url} alt={activeCollaborateur.prenom} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                                        {activeCollaborateur.prenom[0]}{activeCollaborateur.nom[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-semibold text-sm">{activeCollaborateur.prenom} {activeCollaborateur.nom}</div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>

                <InterventionModal
                    isOpen={!!selectedIntervention}
                    onClose={() => setSelectedIntervention(null)}
                    onDelete={handleDeleteIntervention}
                    intervention={selectedIntervention}
                />
            </DndContext>
        </div>
    );
}
