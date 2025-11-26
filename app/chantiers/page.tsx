'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Chantier, Client } from '@/types';
import Layout from '@/components/Layout';
import ChantierList from '@/components/ChantierList';
import ChantierModal from '@/components/ChantierModal';
import ClientSelector from '@/components/ClientSelector';
import { Plus } from 'lucide-react';

export default function ChantiersPage() {
    const [chantiers, setChantiers] = useState<Chantier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [editingChantier, setEditingChantier] = useState<Chantier | null>(null);

    const fetchChantiers = async () => {
        setLoading(true);
        // Fetch chantiers with client data
        const { data, error } = await supabase
            .from('test-chantier')
            .select('*, client:test-client(*)')
            .order('date_debut', { ascending: false });

        if (error) {
            console.error('Error fetching chantiers:', error);
        } else {
            setChantiers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchChantiers();
    }, []);

    const handleCreateClick = () => {
        setEditingChantier(null);
        setSelectedClient(null);
        setIsClientSelectorOpen(true);
    };

    const handleClientSelect = (client: Client) => {
        setSelectedClient(client);
        setIsClientSelectorOpen(false);
        setIsModalOpen(true);
    };

    const handleEdit = (chantier: Chantier) => {
        setEditingChantier(chantier);
        // If editing, we might need to fetch the client if not present, 
        // but our select query includes it.
        if (chantier.client) {
            setSelectedClient(chantier.client);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce chantier ?')) return;

        const { error } = await supabase.from('test-chantier').delete().eq('id', id);

        if (error) {
            console.error('Error deleting chantier:', error);
            alert('Erreur lors de la suppression');
        } else {
            fetchChantiers();
        }
    };

    const handleSave = async (chantierData: Omit<Chantier, 'id' | 'created_at' | 'client'>) => {
        if (editingChantier) {
            // Update
            const { error } = await supabase
                .from('test-chantier')
                .update(chantierData)
                .eq('id', editingChantier.id);

            if (error) {
                console.error('Error updating chantier:', error);
                throw error;
            }
        } else {
            // Create
            const { error } = await supabase.from('test-chantier').insert([chantierData]);

            if (error) {
                console.error('Error creating chantier:', error);
                throw error;
            }
        }
        fetchChantiers();
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Chantiers</h1>
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md shadow-blue-200 transition-all font-medium active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Nouveau Chantier</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <ChantierList
                        chantiers={chantiers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

                {/* Step 1: Select Client */}
                <ClientSelector
                    isOpen={isClientSelectorOpen}
                    onClose={() => setIsClientSelectorOpen(false)}
                    onSelect={handleClientSelect}
                />

                {/* Step 2: Create/Edit Chantier */}
                <ChantierModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingChantier}
                    selectedClient={selectedClient}
                />
            </div>
        </Layout>
    );
}
