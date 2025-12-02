-- Add ON DELETE CASCADE to foreign keys to allow deletion of parent records

-- 1. Chantier -> Client
-- When a Client is deleted, delete all their Chantiers
ALTER TABLE "test-chantier"
DROP CONSTRAINT IF EXISTS "test-chantier_client_id_fkey";

ALTER TABLE "test-chantier"
ADD CONSTRAINT "test-chantier_client_id_fkey"
    FOREIGN KEY (client_id)
    REFERENCES "test-client"(id)
    ON DELETE CASCADE;

-- 2. Intervention -> Chantier
-- When a Chantier is deleted, delete all its Interventions
ALTER TABLE "test-intervention"
DROP CONSTRAINT IF EXISTS "test-intervention_chantier_id_fkey";

ALTER TABLE "test-intervention"
ADD CONSTRAINT "test-intervention_chantier_id_fkey"
    FOREIGN KEY (chantier_id)
    REFERENCES "test-chantier"(id)
    ON DELETE CASCADE;

-- 3. Intervention -> Collaborateur
-- When a Collaborateur is deleted, delete all their Interventions
ALTER TABLE "test-intervention"
DROP CONSTRAINT IF EXISTS "test-intervention_collaborateur_id_fkey";

ALTER TABLE "test-intervention"
ADD CONSTRAINT "test-intervention_collaborateur_id_fkey"
    FOREIGN KEY (collaborateur_id)
    REFERENCES "test-collaborateur"(id)
    ON DELETE CASCADE;
