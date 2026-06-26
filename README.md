# Marketing Tracker

PWA para controle das tarefas de marketing dos empreendimentos, substituindo a planilha `Controle de Marketing - Empreendimentos.xlsx`. Veja `docs/` para arquitetura, API e modelo de dados, e `deploy/README.md` para instalar no ZimaOS/CasaOS.

## Desenvolvimento local

```sh
cp .env.example .env   # ajuste os valores se quiser
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend/API: http://localhost:3001/api
- Login inicial (seed do `docker-compose.yml`): `admin@marketing.local` / `admin123456`

Migrations e o usuário admin inicial são aplicados automaticamente ao subir o backend.

## Importar a planilha real

```sh
docker compose exec backend npm run import -- --file="/caminho/planilha.xlsx" --dry-run
```

## Estrutura

```
backend/      API REST em Express + TypeScript
frontend/     PWA em React + Vite + Tailwind
database/     Schema, seed (init.sql) e migrações incrementais (migrations/)
docs/         Documentação de arquitetura, API e modelo de dados
deploy/       Compose + README para instalar no ZimaOS/CasaOS
scripts/      Build/push da imagem, reset do banco
```
