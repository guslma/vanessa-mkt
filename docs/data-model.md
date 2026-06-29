# Modelo de dados

## Diagrama (ER simplificado)

```
users                    empreendimentos                  tarefas
-----                    ---------------                  -------
id (uuid, PK)            id (uuid, PK)                    id (uuid, PK)
username (unique)        nome                              empreendimento_id (FK -> empreendimentos.id)
email (unique)           tipo (enum)                       categoria (enum)
password_hash            fase_atual (enum)                 titulo
name                      data_lancamento                   responsavel (texto livre)
role (admin|member)       responsavel_comercial             prioridade (enum)
active                    link_materiais                    status (enum)
created_at/updated_at     observacoes                       data_inicio / prazo / data_conclusao
                          endereco                           observacoes
                          created_at/updated_at             created_at/updated_at

                                                              + view "tarefas_view" = tarefas + atrasado (bool, calculado)
```

`empreendimentos 1 — N tarefas` (`ON DELETE CASCADE`: remover um empreendimento remove suas tarefas). `users` é uma tabela independente, sem FK com as demais — apenas controla quem pode logar.

## Dicionário de campos

### `empreendimentos`
| Campo | Tipo | Observação |
|---|---|---|
| nome | text | |
| tipo | enum `empreendimento_tipo` | residencial, comercial, loteamento, misto |
| fase_atual | enum `empreendimento_fase` | pre_lancamento, lancamento, em_obras, pronto_para_morar, entregue |
| data_lancamento | date | nullable |
| responsavel_comercial | text | nullable |
| link_materiais | text | URL para pasta/Drive de materiais |
| observacoes | text | nullable |
| endereco | text | nullable — armazenado apenas para referência/exibição |

### `tarefas`
| Campo | Tipo | Observação |
|---|---|---|
| empreendimento_id | uuid (FK) | cascade on delete |
| categoria | enum `tarefa_categoria` | redes_sociais, material_grafico, lancamento, midia_paga, evento, stand_de_vendas, site, email_marketing, fotos_e_videos, outros |
| titulo | text | "Tarefa / Atividade" na planilha |
| responsavel | text | nullable, texto livre (nomes de papéis/equipes) |
| prioridade | enum `tarefa_prioridade` | alta, media, baixa |
| status | enum `tarefa_status` | a_fazer, em_andamento, concluido, cancelado — **sem "atrasado"** |
| data_inicio / prazo / data_conclusao | date | nullable |
| observacoes | text | nullable |

### View `tarefas_view`
Todas as colunas de `tarefas` + `atrasado boolean` = `status NOT IN ('concluido','cancelado') AND prazo < CURRENT_DATE`. Todos os endpoints de leitura usam esta view.

## Mapeamento enum → rótulo (PT-BR)

Ver `backend/src/constants/enums.ts` e `frontend/src/constants/enums.ts` (mantidos em paralelo, mesmos valores). Os valores do banco são `snake_case` ASCII; os rótulos exibidos na interface preservam acentuação/maiúsculas exatamente como na planilha original (ex.: `pre_lancamento` → "Pré-lançamento").

## Colunas removidas da planilha

As colunas `rank_afazer`, `rank_andamento`, `rank_concluido`, `rank_atrasado` da aba "Tarefas" eram um truque de fórmula Excel (`INDEX`/`MATCH`) para alimentar o quadro Kanban da aba "Quadro". No banco, o agrupamento por status é uma query normal (`GROUP BY status`/filtro), então essas colunas não existem na tabela `tarefas`.

## Convenção de migrations

Arquivos numerados em `database/migrations/`, aplicados em ordem por `scripts/migrate.ts`, com controle em `schema_migrations(filename, applied_at)`. Sempre forward-only — para corrigir algo já aplicado, criar uma nova migration numerada, nunca editar uma already-aplicada.
