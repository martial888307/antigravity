export interface Client {
    id: string;
    entreprise_id: string;
    nom: string;
    prenom: string;
    adresse: string;
    codePostal: string;
    ville: string;
    created_at?: string;
}

export interface Chantier {
    id: string;
    entreprise_id: string;
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
    entreprise_id: string;
    nom: string;
    prenom: string;
    poste: string;
    photo_url?: string;
    created_at?: string;
}

export interface Intervention {
    id: string;
    entreprise_id: string;
    chantier_id: string;
    collaborateur_id: string;
    date_debut: string;
    date_fin: string;
    commentaire?: string;
    creneau?: 'AM' | 'PM';
    created_at?: string;
    // Joins
    chantier?: Chantier;
    collaborateur?: Collaborateur;
}

export interface Entreprise {
    id: string;
    nom: string;
    email?: string;
    siret?: string;
    stripe_customer_id?: string;
    subscription_status: 'trial' | 'active' | 'past_due' | 'canceled';
    trial_ends_at?: string;
    created_at?: string;
}

export interface Profile {
    id: string;
    entreprise_id: string;
    role: 'admin' | 'user';
    nom?: string;
    prenom?: string;
    telephone?: string;
    is_super_admin?: boolean;
    override_entreprise_id?: string | null;
    created_at?: string;
}
