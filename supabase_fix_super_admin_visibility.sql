-- FIX: Empêcher le menu Super Admin de disparaître
-- Problème : Quand on change d'entreprise, on perd l'accès à son propre profil à cause des règles RLS strictes.
-- Solution : On ajoute une règle qui garantit l'accès à son propre profil en toutes circonstances.

CREATE POLICY "Users can always view their own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());
