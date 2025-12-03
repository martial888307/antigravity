-- 1. Add Super Admin columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS override_entreprise_id UUID REFERENCES public.entreprises(id);

-- 2. Update the helper function to respect the override
CREATE OR REPLACE FUNCTION get_my_entreprise_id()
RETURNS UUID AS $$
DECLARE
    user_profile RECORD;
BEGIN
    SELECT entreprise_id, override_entreprise_id INTO user_profile 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- If override is set, return it
    IF user_profile.override_entreprise_id IS NOT NULL THEN
        RETURN user_profile.override_entreprise_id;
    END IF;
    
    -- Otherwise return the normal entreprise_id
    RETURN user_profile.entreprise_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Allow Super Admins to view ALL enterprises (for the switcher dropdown)
-- We need to drop the existing simple policy and create a more complex one
DROP POLICY IF EXISTS "Users can view their own enterprise" ON public.entreprises;

CREATE POLICY "Users can view their own or all if super admin" ON public.entreprises
    FOR SELECT USING (
        id = get_my_entreprise_id() 
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
    );

-- 4. Allow users to update their own profile (to set the override)
-- We might already have a policy, but let's ensure we can update these specific fields
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- 5. Set your user as Super Admin (Replace with your specific email or handle it manually)
-- For now, I will create a query that sets the user with email 'martial@eurekia.io' as super admin if it exists
UPDATE public.profiles
SET is_super_admin = true
WHERE id IN (SELECT id FROM auth.users WHERE email = 'martial@eurekia.io');
