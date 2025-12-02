DO $$
DECLARE
    target_email TEXT := 'martial888@gmail.com';
    target_entreprise_id UUID := '9588acb6-751c-4339-99b5-e1ca02f27dd1';
    user_id UUID;
BEGIN
    -- 1. Get User ID
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', target_email;
    END IF;

    -- 2. Update Profile
    INSERT INTO public.profiles (id, entreprise_id, role)
    VALUES (user_id, target_entreprise_id, 'admin')
    ON CONFLICT (id) DO UPDATE
    SET entreprise_id = target_entreprise_id, role = 'admin';

    RAISE NOTICE 'User % linked to Enterprise % successfully.', target_email, target_entreprise_id;
END $$;
