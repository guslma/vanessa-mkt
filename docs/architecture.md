# Arquitetura

## Visão geral

```
[Navegador / PWA instalado]
        |  HTTPS (DuckDNS + proxy reverso)
        v
[Container "app" — Express serve API (/api/*) + build estático do React]
        |  pg (TCP 5432)
        v
[Container "db" — PostgreSQL 16 + PostGIS]
```

Em desenvolvimento local, frontend (Vite dev server) e backend (Express) rodam em containers separados, com o Vite fazendo proxy de `/api` para o backend. Em produção, uma única imagem Docker contém o backend já servindo o build do frontend (`express.static`), simplificando a instalação no ZimaOS/CasaOS para "um app, uma porta".

## Fluxo de autenticação

1. Usuária faz login em `/api/auth/login` com e-mail/senha.
2. Backend verifica hash bcrypt, assina um JWT (`{ sub: userId, role }`) com `JWT_SECRET`, expiração configurável (padrão 7 dias).
3. Frontend guarda o token em `localStorage` e o envia em `Authorization: Bearer <token>` em toda chamada `/api/*`.
4. Middleware `requireAuth` valida o token em todas as rotas exceto `/api/auth/login` e `/api/health`. `requireAdmin` bloqueia rotas administrativas (gestão de usuários, exclusão de empreendimentos) para quem não tem `role = admin`.
5. Não há cadastro público — contas são criadas pela tela de Usuários (admin) ou pelo bootstrap automático (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) na primeira subida do container.

## Por que "Atrasado" é calculado, não armazenado

Na planilha original, "Atrasado" era um valor de status que a usuária precisava lembrar de marcar manualmente — fonte de erro e trabalho manual. No app, `tarefas.status` só guarda os estados de ciclo de vida reais (`a_fazer`, `em_andamento`, `concluido`, `cancelado`). A view `tarefas_view` adiciona uma coluna calculada `atrasado` (`status not in (concluido, cancelado) AND prazo < hoje`), usada por todos os endpoints de leitura (lista, kanban, dashboard). Isso garante que o status de atraso esteja sempre correto, sem depender de atualização manual.

## Deploy: dev vs produção

- **Dev** (`docker-compose.yml`): `db` (postgis), `backend` (hot reload via tsx), `frontend` (Vite dev server com proxy `/api` → backend).
- **Produção/ZimaOS** (`deploy/docker-compose.yml`): `app` (imagem única publicada no Docker Hub, backend + build do frontend) e `db` (postgis), com metadata `x-casaos` para aparecer no app store do CasaOS. Veja `deploy/README.md` para instalar e `docs/deployment.md` para o passo a passo completo, incluindo exposição externa via DuckDNS + proxy reverso HTTPS.

## Escolhas técnicas

- **PostgreSQL + PostGIS**: hoje sem requisito real de geolocalização (a planilha não tem endereço), mas a coluna `location geography(Point,4326)` em `empreendimentos` já existe, nullable, para permitir um futuro mapa dos empreendimentos sem precisar de migração.
- **Enums nativos do Postgres** em vez de tabelas de lookup: os valores (Tipo, Fase, Categoria, Prioridade, Status) são fixos e pequenos, espelhando exatamente as listas de validação da planilha original.
- **`responsavel` como texto livre** em `tarefas`: a planilha usa nomes de papéis/equipes ("Designer", "Agência"), não uma lista fixa de pessoas — formalizar isso em uma tabela de usuários/responsáveis fica como melhoria futura, quando o padrão de uso real for conhecido.
