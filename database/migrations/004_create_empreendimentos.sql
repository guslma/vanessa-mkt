CREATE TABLE empreendimentos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                  text NOT NULL,
  tipo                  empreendimento_tipo NOT NULL,
  fase_atual            empreendimento_fase NOT NULL DEFAULT 'pre_lancamento',
  data_lancamento       date,
  responsavel_comercial text,
  link_materiais        text,
  observacoes           text,
  endereco              text,
  location              geography(Point, 4326),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_empreendimentos_location ON empreendimentos USING GIST (location);
CREATE INDEX idx_empreendimentos_fase ON empreendimentos (fase_atual);
