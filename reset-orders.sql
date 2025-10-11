-- Script pour reset complet des tables Order
-- Supprimer les tables dans l'ordre (foreign keys d'abord)
DROP TABLE IF EXISTS "order_item" CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;