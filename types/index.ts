export interface Client {
    id: string;
    nom: string;
    prenom: string;
    adresse: string;
    codePostal: string;
    ville: string;
    created_at?: string;
}

export interface Chantier {
    id: string;
    client_id: string;
    description: string;
    adresse: string;
    codePostal: string;
    ville: string;
    date_debut: string;
    created_at?: string;
    // Optional: joined client data for display
    client?: Client;
}
