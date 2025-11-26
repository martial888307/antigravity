export interface Client {
    id: string;
    nom: string;
    prenom: string;
    adresse: string;
    codePostal: string;
    ville: string;
    created_at?: string;
}
