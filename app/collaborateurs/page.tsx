'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Collaborateur } from '@/types';
import Layout from '@/components/Layout';
import CollaborateurList from '@/components/CollaborateurList';
import CollaborateurModal from '@/components/CollaborateurModal';
import { Plus } from 'lucide-react';

export default function CollaborateursPage() {
    const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollaborateur, setEditingCollaborateur] = useState<Collaborateur | null>(null);

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

    const handleSave = async (collabData: Omit<Collaborateur, 'id' | 'created_at'>) => {
        if (editingCollaborateur) {
            // Update
            const { error } = await supabase
                .from('test-collaborateur')
                .update(collabData)
                .eq('id', editingCollaborateur.id);

            if (error) {
                console.error('Error updating collaborator:', error);
                throw error;
            }
        } else {
            // Create
            const { error } = await supabase.from('test-collaborateur').insert([collabData]);

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
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md shadow-blue-200 transition-all font-medium active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Nouveau Collaborateur</span>
                    </button>
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
