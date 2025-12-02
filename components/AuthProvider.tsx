'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Profile, Entreprise } from '@/types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    entreprise: Entreprise | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    entreprise: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const setData = async (session: Session | null) => {
            try {
                if (session?.user) {
                    setUser(session.user);
                    setSession(session);

                    // Fetch profile
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileData) {
                        setProfile(profileData as Profile);

                        // Fetch entreprise
                        const { data: entrepriseData, error: entrepriseError } = await supabase
                            .from('entreprises')
                            .select('*')
                            .eq('id', profileData.entreprise_id)
                            .single();

                        if (entrepriseData) {
                            setEntreprise(entrepriseData as Entreprise);
                        }
                    }
                } else {
                    setUser(null);
                    setSession(null);
                    setProfile(null);
                    setEntreprise(null);
                }
            } catch (error) {
                console.error('Error fetching auth data:', error);
            } finally {
                setLoading(false);
            }
        };

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setData(session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setData(session);
            // Removed automatic redirect here to let signOut handle it explicitly
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const signOut = async () => {
        try {
            // Call server-side API to properly clear cookies
            await fetch('/api/auth/signout', { method: 'POST' });
        } catch (error) {
            console.error('Error signing out:', error);
        }

        // Clear local state
        setUser(null);
        setSession(null);
        setProfile(null);
        setEntreprise(null);

        // Redirect to home page
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, entreprise, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
