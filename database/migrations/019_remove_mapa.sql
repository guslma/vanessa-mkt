DROP INDEX IF EXISTS idx_empreendimentos_location;
ALTER TABLE empreendimentos DROP COLUMN IF EXISTS location;
DROP EXTENSION IF EXISTS postgis;
