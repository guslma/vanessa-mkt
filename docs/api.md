# Referência da API

Base URL: `/api`. Todas as rotas (exceto `/auth/login` e `/health`) exigem header `Authorization: Bearer <token>`.

## Autenticação

### `POST /auth/login`
Body: `{ "email": "...", "password": "..." }`
Resposta 200: `{ "token": "...", "user": { "id", "name", "email", "role" } }`
Erros: `401` credenciais inválidas.

### `GET /auth/me`
Resposta 200: `{ "user": { "id", "name", "email", "role" } }`

## Usuários (apenas `role = admin`)

| Método | Rota | Body | Descrição |
|---|---|---|---|
| GET | `/users` | — | Lista todos os usuários |
| POST | `/users` | `{ email, name, password, role }` | Cria usuário (equipe/agência) |
| PUT | `/users/:id` | `{ name?, role?, active?, password? }` | Atualiza dados/papel/senha/ativação |
| DELETE | `/users/:id` | — | Remove o usuário |

## Empreendimentos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/empreendimentos?tipo=&fase=&search=` | Lista com filtros opcionais |
| GET | `/empreendimentos/:id` | Detalhe |
| POST | `/empreendimentos` | Cria |
| PUT | `/empreendimentos/:id` | Atualiza |
| DELETE | `/empreendimentos/:id` | Remove (admin) — também exclui as tarefas vinculadas (cascade) |

Body de criação/atualização:
```json
{
  "nome": "Residencial Vista Verde",
  "tipo": "residencial",
  "fase_atual": "em_obras",
  "data_lancamento": "2025-03-15",
  "responsavel_comercial": "Carlos Souza",
  "link_materiais": "https://drive.google.com/...",
  "observacoes": "...",
  "endereco": null
}
```

## Tarefas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/tarefas?empreendimento_id=&categoria=&status=&prioridade=&atrasado=true&search=&sort=prazo:asc` | Lista com filtros |
| GET | `/tarefas/kanban` | Quadro agrupado por status (ver abaixo) |
| GET | `/tarefas/:id` | Detalhe |
| POST | `/tarefas` | Cria |
| PUT | `/tarefas/:id` | Atualiza todos os campos |
| PATCH | `/tarefas/:id/status` | `{ "status": "em_andamento" }` — usado pelo seletor de status do Kanban |
| DELETE | `/tarefas/:id` | Remove |

Body de criação/atualização:
```json
{
  "empreendimento_id": "uuid",
  "categoria": "redes_sociais",
  "titulo": "Criar cronograma de posts do mês",
  "responsavel": "Equipe Social Media",
  "prioridade": "alta",
  "status": "em_andamento",
  "data_inicio": "2026-07-01",
  "prazo": "2026-07-10",
  "data_conclusao": null,
  "observacoes": "Foco em vídeos de obra"
}
```

### `GET /tarefas/kanban` — resposta
```json
{
  "a_fazer":      { "count": 4, "items": [ { "id", "empreendimento_nome", "categoria", "titulo", "prazo", "responsavel", "status" } ] },
  "em_andamento": { "count": 2, "items": [...] },
  "concluido":    { "count": 1, "items": [...] },
  "atrasado":     { "count": 1, "items": [...] }
}
```
O bucket `atrasado` é virtual: contém qualquer tarefa não concluída/cancelada cujo `prazo` já passou, podendo aparecer simultaneamente em `a_fazer`/`em_andamento` e em `atrasado`.

## Dashboard

### `GET /dashboard/summary`
```json
{
  "total_tarefas": 5,
  "em_andamento": 1,
  "concluidas": 1,
  "atrasadas": 1,
  "alta_prioridade_em_aberto": 2
}
```

## Saúde

### `GET /health`
`{ "ok": true }` — sem autenticação, usado pelo healthcheck do Docker/CasaOS.

## Erros

Formato padrão: `{ "error": "mensagem" }` (e `details` com a validação Zod quando o erro é `400`). Códigos usados: `400` (dados inválidos), `401` (sem token/credenciais inválidas), `403` (sem permissão de admin), `404` (não encontrado), `409` (conflito, ex. e-mail duplicado).
