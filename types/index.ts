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
    temps_vendu?: number;
    created_at?: string;
    // Optional: joined client data for display
    client?: Client;
}

export interface Collaborateur {
    id: string;
    nom: string;
    prenom: string;
    poste: string;
    photo_url?: string;
    created_at?: string;
}

export interface Intervention {
    id: string;
    chantier_id: string;
    collaborateur_id: string;
    date_debut: string;
    date_fin: string;
    commentaire?: string;
    created_at?: string;
    // Joins
    chantier?: Chantier;
    collaborateur?: Collaborateur;
}
