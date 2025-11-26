'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/types';
import ClientList from '@/components/ClientList';
import ClientModal from '@/components/ClientModal';
import { Plus, Users } from 'lucide-react';

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

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
      alert('Erreur lors de la suppression');
    } else {
      fetchClients();
    }
  };

  const handleSave = async (clientData: Omit<Client, 'id' | 'created_at'>) => {
    if (editingClient) {
      // Update
      const { error } = await supabase
        .from('test-client')
        .update(clientData)
        .eq('id', editingClient.id);

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }
    } else {
      // Create
      const { error } = await supabase.from('test-client').insert([clientData]);

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }
    }
    fetchClients();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
              <Users size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              Mon CRM
            </h1>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-200 transition-all font-medium active:scale-95"
          >
            <Plus size={20} />
            <span>Nouveau Client</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>

      {/* Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingClient}
      />
    </main>
  );
}
