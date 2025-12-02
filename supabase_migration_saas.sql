-- 1. Create 'entreprises' table
CREATE TABLE public.entreprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    email TEXT,
    siret TEXT,
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'canceled'
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '60 days'),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create 'profiles' table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    entreprise_id UUID REFERENCES public.entreprises(id),
    role TEXT DEFAULT 'admin', -- 'admin', 'user'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add 'entreprise_id' to existing tables
ALTER TABLE "test-client" ADD COLUMN entreprise_id UUID REFERENCES public.entreprises(id);
ALTER TABLE "test-chantier" ADD COLUMN entreprise_id UUID REFERENCES public.entreprises(id);
ALTER TABLE "test-collaborateur" ADD COLUMN entreprise_id UUID REFERENCES public.entreprises(id);
ALTER TABLE "test-intervention" ADD COLUMN entreprise_id UUID REFERENCES public.entreprises(id);

-- 4. Create Demo Enterprise and Migrate Data
-- This part is tricky in SQL only because we need the ID of the new row.
-- We use a DO block.
DO $$
DECLARE
    demo_entreprise_id UUID;
BEGIN
    -- Create Demo Enterprise
    INSERT INTO public.entreprises (nom, email, subscription_status)
    VALUES ('Entreprise Démo', 'demo@eurekia.app', 'active')
    RETURNING id INTO demo_entreprise_id;

    -- Update all existing data to belong to this enterprise
    UPDATE "test-client" SET entreprise_id = demo_entreprise_id WHERE entreprise_id IS NULL;
    UPDATE "test-chantier" SET entreprise_id = demo_entreprise_id WHERE entreprise_id IS NULL;
    UPDATE "test-collaborateur" SET entreprise_id = demo_entreprise_id WHERE entreprise_id IS NULL;
    UPDATE "test-intervention" SET entreprise_id = demo_entreprise_id WHERE entreprise_id IS NULL;
    
    -- Note: We cannot automatically link existing auth users to profiles here 
    -- because we don't know which user belongs to this enterprise.
    -- You will need to manually insert into 'profiles' for your current user.
END $$;

-- 5. Enable RLS
ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE "test-client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "test-chantier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "test-collaborateur" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "test-intervention" ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Helper function to get current user's entreprise_id
CREATE OR REPLACE FUNCTION get_my_entreprise_id()
RETURNS UUID AS $$
    SELECT entreprise_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for 'entreprises'
CREATE POLICY "Users can view their own enterprise" ON public.entreprises
    FOR SELECT USING (id = get_my_entreprise_id());

-- Policies for 'profiles'
CREATE POLICY "Users can view profiles in their enterprise" ON public.profiles
    FOR SELECT USING (entreprise_id = get_my_entreprise_id());

-- Policies for Data Tables (Client, Chantier, Collaborateur, Intervention)
-- We use a common pattern: check if the row's entreprise_id matches the user's entreprise_id

-- Clients
CREATE POLICY "View clients from my enterprise" ON "test-client"
    FOR SELECT USING (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Insert clients for my enterprise" ON "test-client"
    FOR INSERT WITH CHECK (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Update clients from my enterprise" ON "test-client"
    FOR UPDATE USING (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Delete clients from my enterprise" ON "test-client"
    FOR DELETE USING (entreprise_id = get_my_entreprise_id());

-- Chantiers
CREATE POLICY "View chantiers from my enterprise" ON "test-chantier"
    FOR SELECT USING (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Insert chantiers for my enterprise" ON "test-chantier"
    FOR INSERT WITH CHECK (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Update chantiers from my enterprise" ON "test-chantier"
    FOR UPDATE USING (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Delete chantiers from my enterprise" ON "test-chantier"
    FOR DELETE USING (entreprise_id = get_my_entreprise_id());

-- Collaborateurs
CREATE POLICY "View collaborateurs from my enterprise" ON "test-collaborateur"
    FOR SELECT USING (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Insert collaborateurs for my enterprise" ON "test-collaborateur"
    FOR INSERT WITH CHECK (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Update collaborateurs from my enterprise" ON "test-collaborateur"
    FOR UPDATE USING (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Delete collaborateurs from my enterprise" ON "test-collaborateur"
    FOR DELETE USING (entreprise_id = get_my_entreprise_id());

-- Interventions
CREATE POLICY "View interventions from my enterprise" ON "test-intervention"
    FOR SELECT USING (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Insert interventions for my enterprise" ON "test-intervention"
    FOR INSERT WITH CHECK (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Update interventions from my enterprise" ON "test-intervention"
    FOR UPDATE USING (entreprise_id = get_my_entreprise_id());
CREATE POLICY "Delete interventions from my enterprise" ON "test-intervention"
    FOR DELETE USING (entreprise_id = get_my_entreprise_id());
