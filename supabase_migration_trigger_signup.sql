-- Trigger function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_entreprise_id UUID;
    meta_nom TEXT;
    meta_prenom TEXT;
    meta_telephone TEXT;
    meta_company_name TEXT;
BEGIN
    -- Extract metadata from the new user record
    meta_nom := new.raw_user_meta_data->>'nom';
    meta_prenom := new.raw_user_meta_data->>'prenom';
    meta_telephone := new.raw_user_meta_data->>'telephone';
    meta_company_name := new.raw_user_meta_data->>'company_name';

    -- Only proceed if company_name is provided
    IF meta_company_name IS NOT NULL THEN
        -- 1. Create Enterprise
        INSERT INTO public.entreprises (nom, email, subscription_status)
        VALUES (meta_company_name, new.email, 'trial')
        RETURNING id INTO new_entreprise_id;

        -- 2. Create Profile linked to the new Enterprise
        INSERT INTO public.profiles (id, entreprise_id, role, nom, prenom, telephone)
        VALUES (new.id, new_entreprise_id, 'admin', meta_nom, meta_prenom, meta_telephone);
    ELSE
        -- Fallback: Create profile without enterprise if no company name provided
        -- This ensures the user always has a profile row
        INSERT INTO public.profiles (id, nom, prenom, telephone)
        VALUES (new.id, meta_nom, meta_prenom, meta_telephone);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
