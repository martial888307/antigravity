'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Collaborateur } from '@/types';
import Layout from '@/components/Layout';
import CollaborateurList from '@/components/CollaborateurList';
import CollaborateurModal from '@/components/CollaborateurModal';
import { generateDemoCollaborateurs } from '@/lib/demoData';
import { Plus, Wand2 } from 'lucide-react';

export default function CollaborateursPage() {
    const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollaborateur, setEditingCollaborateur] = useState<Collaborateur | null>(null);
    const [generatingDemo, setGeneratingDemo] = useState(false);
    const { entreprise, profile } = useAuth();

    const fetchCollaborateurs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('test-collaborateur')
            .select('*')
            .order('nom', { ascending: true });

        if (error) {
            console.error('Error fetching collaborators:', error);
        } else {
            setCollaborateurs(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCollaborateurs();
    }, []);

    const handleCreateClick = () => {
        setEditingCollaborateur(null);
        setIsModalOpen(true);
    };

    const handleEdit = (collab: Collaborateur) => {
        setEditingCollaborateur(collab);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce collaborateur ?')) return;

        const { error } = await supabase.from('test-collaborateur').delete().eq('id', id);

        if (error) {
            console.error('Error deleting collaborator:', error);
            alert('Erreur lors de la suppression');
        } else {
            fetchCollaborateurs();
        }
    };

    const handleGenerateDemo = async () => {
        const targetEntrepriseId = profile?.override_entreprise_id || entreprise?.id;
        if (!targetEntrepriseId) return;

        setGeneratingDemo(true);
        const result = await generateDemoCollaborateurs(supabase, targetEntrepriseId);
        if (result.success) {
            fetchCollaborateurs();
        } else {
            alert("Erreur lors de la génération des données de démo.");
        }
        setGeneratingDemo(false);
    };

    const handleSave = async (collabData: Omit<Collaborateur, 'id' | 'created_at' | 'entreprise_id'>) => {
        const targetEntrepriseId = profile?.override_entreprise_id || entreprise?.id;

        if (!targetEntrepriseId) {
            console.error('No enterprise found');
            return;
        }

        const dataToSave = {
            ...collabData,
            entreprise_id: targetEntrepriseId,
        };

        if (editingCollaborateur) {
            // Update
            const { error } = await supabase
                .from('test-collaborateur')
                .update(dataToSave)
                .eq('id', editingCollaborateur.id);

            if (error) {
                console.error('Error updating collaborator:', error);
                throw error;
            }
        } else {
            // Create
            const { error } = await supabase.from('test-collaborateur').insert([dataToSave]);

            if (error) {
                console.error('Error creating collaborator:', error);
                throw error;
            }
        }
        fetchCollaborateurs();
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Collaborateurs</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateDemo}
                            disabled={generatingDemo}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm transition-all font-medium active:scale-95 disabled:opacity-50"
                        >
                            <Wand2 size={20} className={generatingDemo ? "animate-spin" : ""} />
                            <span>{generatingDemo ? 'Génération...' : 'Démo'}</span>
                        </button>
                        <button
                            onClick={handleCreateClick}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md shadow-blue-200 transition-all font-medium active:scale-95"
                        >
                            <Plus size={20} />
                            <span>Nouveau Collaborateur</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <CollaborateurList
                        collaborateurs={collaborateurs}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

                <CollaborateurModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingCollaborateur}
                />
            </div>
        </Layout>
    );
}
