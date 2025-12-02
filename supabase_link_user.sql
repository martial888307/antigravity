-- Link specific user to 'Entreprise Démo'
DO $$
DECLARE
    target_email TEXT := 'martial888@gmail.com';
    user_id UUID;
    demo_entreprise_id UUID;
BEGIN
    -- 1. Get User ID
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users', target_email;
    END IF;

    -- 2. Get Demo Enterprise ID
    SELECT id INTO demo_entreprise_id FROM public.entreprises WHERE nom = 'Entreprise Démo' LIMIT 1;

    IF demo_entreprise_id IS NULL THEN
        RAISE EXCEPTION 'Entreprise Démo not found';
    END IF;

    -- 3. Create or Update Profile
    INSERT INTO public.profiles (id, entreprise_id, role)
    VALUES (user_id, demo_entreprise_id, 'admin')
    ON CONFLICT (id) DO UPDATE
    SET entreprise_id = demo_entreprise_id, role = 'admin';

    RAISE NOTICE 'User % linked to Entreprise Démo successfully.', target_email;
END $$;
