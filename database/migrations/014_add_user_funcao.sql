CREATE TYPE user_funcao AS ENUM (
  'gerente_marketing', 'social_media', 'designer', 'trafego_pago', 'copywriter',
  'video_fotografia', 'atendimento', 'comercial', 'agencia', 'outro'
);

ALTER TABLE users ADD COLUMN funcao user_funcao;
