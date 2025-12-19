import { SupabaseClient } from '@supabase/supabase-js';
import { Client, Collaborateur } from '@/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Chantier } from '@/types';

const FRENCH_ADDRESSES = [
    { adresse: "10 Rue de la Paix", codePostal: "75002", ville: "Paris" },
    { adresse: "25 Cours Mirabeau", codePostal: "13100", ville: "Aix-en-Provence" },
    { adresse: "1 Place du Capitole", codePostal: "31000", ville: "Toulouse" },
    { adresse: "5 Promenade des Anglais", codePostal: "06000", ville: "Nice" },
    { adresse: "30 Rue Sainte-Catherine", codePostal: "33000", ville: "Bordeaux" },
    { adresse: "15 Rue de la République", codePostal: "69002", ville: "Lyon" },
    { adresse: "8 Grand Place", codePostal: "59800", ville: "Lille" },
    { adresse: "12 Rue du Château", codePostal: "44000", ville: "Nantes" },
    { adresse: "20 Quai des Bateliers", codePostal: "67000", ville: "Strasbourg" },
    { adresse: "4 Rue de la Liberté", codePostal: "21000", ville: "Dijon" },
    { adresse: "14 Avenue des Champs-Élysées", codePostal: "75008", ville: "Paris" },
    { adresse: "3 Rue du Gros Horloge", codePostal: "76000", ville: "Rouen" },
    { adresse: "7 Place Stanislas", codePostal: "54000", ville: "Nancy" },
    { adresse: "22 Rue de Siam", codePostal: "29200", ville: "Brest" },
    { adresse: "9 Boulevard de la Croisette", codePostal: "06400", ville: "Cannes" }
];

const JOB_TITLES = [
    "Chef de chantier",
    "Maçon",
    "Électricien",
    "Plombier",
    "Peintre",
    "Menuisier",
    "Apprenti",
    "Conducteur de travaux"
];

export async function generateDemoClients(supabase: SupabaseClient, entrepriseId: string, count: number = 3) {
    try {
        // Fetch random users from randomuser.me
        const response = await fetch(`https://randomuser.me/api/?results=${count}&nat=fr`);
        const data = await response.json();
        const users = data.results;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clientsToInsert = users.map((user: any) => {
            // Pick a random real address from our list to ensure Google Maps works
            const address = FRENCH_ADDRESSES[Math.floor(Math.random() * FRENCH_ADDRESSES.length)];

            return {
                entreprise_id: entrepriseId,
                nom: user.name.last.toUpperCase(),
                prenom: user.name.first,
                adresse: address.adresse,
                codePostal: address.codePostal,
                ville: address.ville,
            };
        });

        const { error } = await supabase.from('test-client').insert(clientsToInsert);
        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error generating demo clients:', error);
        return { success: false, error };
    }
}

export async function generateDemoCollaborateurs(supabase: SupabaseClient, entrepriseId: string, count: number = 3) {
    try {
        // Fetch random users from randomuser.me
        const response = await fetch(`https://randomuser.me/api/?results=${count}&nat=fr`);
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const users: any[] = data.results;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const collaboratorsToInsert = users.map((user: any) => {
            return {
                entreprise_id: entrepriseId,
                nom: user.name.last.toUpperCase(),
                prenom: user.name.first,
                poste: JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)],
                photo_url: user.picture.large,
            };
        });

        const { error } = await supabase.from('test-collaborateur').insert(collaboratorsToInsert);
        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error generating demo collaborators:', error);
        return { success: false, error };
    }
}
