-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nom TEXT,
ADD COLUMN IF NOT EXISTS prenom TEXT,
ADD COLUMN IF NOT EXISTS telephone TEXT;

-- Update the registration RPC to handle these new fields
CREATE OR REPLACE FUNCTION register_new_enterprise(
    company_name TEXT,
    user_nom TEXT,
    user_prenom TEXT,
    user_telephone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_entreprise_id UUID;
BEGIN
    -- 1. Create Enterprise
    INSERT INTO public.entreprises (nom, email, subscription_status)
    VALUES (company_name, auth.email(), 'trial')
    RETURNING id INTO new_entreprise_id;

    -- 2. Create or Update Profile with new fields
    INSERT INTO public.profiles (id, entreprise_id, role, nom, prenom, telephone)
    VALUES (auth.uid(), new_entreprise_id, 'admin', user_nom, user_prenom, user_telephone)
    ON CONFLICT (id) DO UPDATE
    SET 
        entreprise_id = new_entreprise_id, 
        role = 'admin',
        nom = EXCLUDED.nom,
        prenom = EXCLUDED.prenom,
        telephone = EXCLUDED.telephone;

    RETURN new_entreprise_id;
END;
$$;
