'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/types';
import ClientList from '@/components/ClientList';
import ClientModal from '@/components/ClientModal';
import Layout from '@/components/Layout';
import { generateDemoClients } from '@/lib/demoData';
import { Plus, Wand2 } from 'lucide-react';

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingDemo, setGeneratingDemo] = useState(false);
    const { entreprise } = useAuth();

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('test-client')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching clients:', error);
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreate = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

        const { error } = await supabase.from('test-client').delete().eq('id', id);

        if (error) {
            console.error('Error deleting client:', error);
            alert(`Erreur lors de la suppression: ${error.message}`);
        } else {
            fetchClients();
        }
    };

    const handleGenerateDemo = async () => {
        if (!entreprise) return;
        setGeneratingDemo(true);
        const result = await generateDemoClients(supabase, entreprise.id);
        if (result.success) {
            fetchClients();
        } else {
            alert("Erreur lors de la génération des données de démo.");
        }
        setGeneratingDemo(false);
    };

    const handleSave = async (clientData: Omit<Client, 'id' | 'created_at' | 'entreprise_id'>) => {
        if (!entreprise) {
            console.error('No enterprise found');
            return;
        }

        const dataToSave = {
            ...clientData,
            entreprise_id: entreprise.id,
        };

        if (editingClient) {
            // Update
            const { error } = await supabase
                .from('test-client')
                .update(dataToSave)
                .eq('id', editingClient.id);

            if (error) {
                console.error('Error updating client:', error);
                throw error;
            }
        } else {
            // Create
            const { error } = await supabase.from('test-client').insert([dataToSave]);

            if (error) {
                console.error('Error creating client:', error);
                throw error;
            }
        }
        fetchClients();
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
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
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-md shadow-blue-200 transition-all font-medium active:scale-95"
                        >
                            <Plus size={20} />
                            <span>Nouveau Client</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <ClientList
                        clients={clients}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

                {/* Modal */}
                <ClientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={editingClient}
                />
            </div>
        </Layout>
    );
}
