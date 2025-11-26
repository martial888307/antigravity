'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/types';
import { X, Search, User } from 'lucide-react';

interface ClientSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (client: Client) => void;
}

export default function ClientSelector({ isOpen, onClose, onSelect }: ClientSelectorProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchClients();
            setSearchTerm('');
        }
    }, [isOpen]);

    const fetchClients = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('test-client')
            .select('*')
            .order('nom', { ascending: true });
        setClients(data || []);
        setLoading(false);
    };

    const filteredClients = clients.filter((client) =>
        `${client.nom} ${client.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-blue-100 shrink-0">
                    <h2 className="text-xl font-semibold text-blue-950">
                        Sélectionner un client
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-200 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            Aucun client trouvé
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredClients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => onSelect(client)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900 group-hover:text-blue-800">
                                            {client.nom} {client.prenom}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {client.ville}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
