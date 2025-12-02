-- Function to handle new enterprise registration
-- This function should be called after the user has signed up via Supabase Auth
CREATE OR REPLACE FUNCTION register_new_enterprise(company_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (admin), bypassing RLS
AS $$
DECLARE
    new_entreprise_id UUID;
BEGIN
    -- 1. Create Enterprise
    -- We use the user's email as the enterprise contact email by default
    INSERT INTO public.entreprises (nom, email, subscription_status)
    VALUES (company_name, auth.email(), 'trial')
    RETURNING id INTO new_entreprise_id;

    -- 2. Create or Update Profile
    -- We link the current user (auth.uid()) to this new enterprise as admin
    INSERT INTO public.profiles (id, entreprise_id, role)
    VALUES (auth.uid(), new_entreprise_id, 'admin')
    ON CONFLICT (id) DO UPDATE
    SET entreprise_id = new_entreprise_id, role = 'admin';

    RETURN new_entreprise_id;
END;
$$;
