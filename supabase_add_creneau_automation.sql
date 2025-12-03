-- 1. Ajouter la colonne 'creneau' si elle n'existe pas
ALTER TABLE "test-intervention" 
ADD COLUMN IF NOT EXISTS creneau TEXT;

-- 2. Créer la fonction qui calcule automatiquement AM ou PM
CREATE OR REPLACE FUNCTION calculate_creneau_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- On extrait l'heure de fin. 
    -- Comme l'app stocke les heures en "Fake UTC" (09:00 stocké comme 09:00Z), 
    -- l'extraction directe de l'heure fonctionne parfaitement.
    -- Fin AM = 12:00 (< 13h) -> AM
    -- Fin PM = 17:00 (> 13h) -> PM
    
    IF EXTRACT(HOUR FROM NEW.date_fin) < 13 THEN
        NEW.creneau := 'AM';
    ELSE
        NEW.creneau := 'PM';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer le déclencheur (Trigger) qui s'active avant chaque insertion ou mise à jour
DROP TRIGGER IF EXISTS set_creneau_on_intervention ON "test-intervention";

CREATE TRIGGER set_creneau_on_intervention
BEFORE INSERT OR UPDATE ON "test-intervention"
FOR EACH ROW
EXECUTE FUNCTION calculate_creneau_trigger();

-- 4. Mettre à jour toutes les anciennes interventions pour remplir la colonne
-- Une simple mise à jour "à vide" va déclencher le trigger pour chaque ligne
UPDATE "test-intervention" SET id = id;
