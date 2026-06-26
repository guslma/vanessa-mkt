ALTER TABLE empreendimentos ADD COLUMN public_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE;
