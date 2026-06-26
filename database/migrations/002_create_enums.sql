CREATE TYPE empreendimento_tipo AS ENUM ('residencial', 'comercial', 'loteamento', 'misto');
CREATE TYPE empreendimento_fase AS ENUM ('pre_lancamento', 'lancamento', 'em_obras', 'pronto_para_morar', 'entregue');
CREATE TYPE tarefa_categoria AS ENUM ('redes_sociais', 'material_grafico', 'lancamento', 'midia_paga', 'evento', 'stand_de_vendas', 'site', 'email_marketing', 'fotos_e_videos', 'outros');
CREATE TYPE tarefa_prioridade AS ENUM ('alta', 'media', 'baixa');
CREATE TYPE tarefa_status AS ENUM ('a_fazer', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE user_role AS ENUM ('admin', 'member');
