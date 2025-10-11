-- Migration pour diviser customerAddress en champs séparés
-- Étape 1: Ajouter les nouveaux champs
ALTER TABLE "order" ADD COLUMN "customerStreet" TEXT;
ALTER TABLE "order" ADD COLUMN "customerPostalCode" TEXT;
ALTER TABLE "order" ADD COLUMN "customerCity" TEXT;
ALTER TABLE "order" ADD COLUMN "customerCountry" TEXT;

-- Étape 2: Migrer les données existantes (si il y en a)
-- Pour les données existantes, on peut les mettre dans customerStreet temporairement
UPDATE "order" SET "customerStreet" = "customerAddress" WHERE "customerAddress" IS NOT NULL;

-- Étape 3: Supprimer l'ancien champ
ALTER TABLE "order" DROP COLUMN "customerAddress";