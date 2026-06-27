# Deploy oficial (ZimaOS / CasaOS)

Este `docker-compose.yml` usa a imagem já publicada em
[`guslma/marketing-tracker`](https://hub.docker.com/r/guslma/marketing-tracker)
(amd64 e arm64) em vez de buildar localmente — é o formato que o CasaOS/ZimaOS
espera para instalar como app oficial (ícone, nome e descrição na interface).

## Antes do primeiro `docker compose up -d` (importante)

Os dados ficam em bind mounts em `/DATA/AppData/marketing-tracker/`, seguindo
o mesmo padrão de outros apps do ZimaOS (ex.: `ownfoil`). Crie as pastas e
ajuste a permissão da pasta do Postgres **antes** de subir a stack pela
primeira vez:

```bash
mkdir -p /DATA/AppData/marketing-tracker/postgres
mkdir -p /DATA/AppData/marketing-tracker/uploads
chown -R 999:999 /DATA/AppData/marketing-tracker/postgres
```

O uid/gid 999 é o usuário `postgres` dentro da imagem `postgis/postgis:16-3.4`
(confirmado com `docker run --rm postgis/postgis:16-3.4 id postgres` — é
Debian-based, diferente do 70 usado em imagens `postgres:*-alpine`). Sem esse
`chown`, o container do Postgres entra em crash loop por falta de permissão
na pasta de dados.

## Antes de instalar: edite os segredos no `docker-compose.yml`

Este arquivo não usa `.env` — os valores ficam direto no `docker-compose.yml`,
porque é assim que o CasaOS/ZimaOS espera (tanto colando na interface quanto
via `casaos-cli`, que não carrega `.env` da mesma pasta). Antes de instalar,
troque os placeholders `CHANGE_ME_...` por valores reais:

- `CHANGE_ME_DB_PASSWORD` — aparece duas vezes (no `DATABASE_URL` do serviço
  `marketing-tracker` e no `POSTGRES_PASSWORD` do `postgres`) — **têm que ser
  iguais**. Gere com `openssl rand -hex 16`.
- `CHANGE_ME_JWT_SECRET_BEM_LONGO_E_ALEATORIO` — gere com `openssl rand -hex 32`.
- `ADMIN_EMAIL` / `CHANGE_ME_ADMIN_PASSWORD` — a conta dela, criada
  automaticamente no primeiro start.

Como o arquivo passa a ter segredos em texto puro, trave a permissão depois de editar:
```bash
chmod 600 docker-compose.yml
```

## Instalar no ZimaOS

Via interface: App Store → "Instalar app personalizado" → cole o conteúdo de
`deploy/docker-compose.yml` (já com os segredos trocados).

Via terminal (SSH no servidor):

```bash
casaos-cli app-management install -f deploy/docker-compose.yml
```

## Instalar em qualquer Docker (sem CasaOS)

```bash
cd deploy
docker compose up -d
```

Acesse em `http://<ip-do-servidor>:8088`. No primeiro start, o container
`marketing-tracker` aplica as migrations do banco e cria o usuário
administrador automaticamente.

## Dados

| Caminho no host | Conteúdo |
|---|---|
| `/DATA/AppData/marketing-tracker/postgres` | Banco Postgres + PostGIS |
| `/DATA/AppData/marketing-tracker/uploads` | Arquivos anexados às tarefas |

Ambos são bind mounts — sobrevivem a `docker compose down` e a atualizações
de imagem, e ficam visíveis/gerenciáveis direto pelo gerenciador de arquivos
do ZimaOS. Apagar essas pastas apaga os dados permanentemente. Veja
[`docs/deployment.md`](../docs/deployment.md) para backup automático
(`deploy/backup-db.sh` + cron).

## Ícone no painel do CasaOS

O label `icon:` aponta para o ícone hospedado via jsDelivr direto do
repositório público, fixado na tag `v1.0.0`:

```
https://cdn.jsdelivr.net/gh/guslma/vanessa-mkt@v1.0.0/frontend/public/icons/icon-512.png
```

Resolve de qualquer dispositivo da rede, não só do próprio ZimaOS.

Ao lançar uma nova versão com ícone diferente, crie uma tag nova (`git tag
vX.Y.Z && git push origin vX.Y.Z`) e atualize a versão na URL — tags antigas
continuam servindo o ícone antigo, então o link não quebra para quem ainda não
atualizou.

## Acesso remoto (fora da rede local)

O container expõe a porta 8088 sem TLS próprio — embora o app já exija login
(JWT), instalar como PWA fora de `localhost` exige HTTPS válido, então não
basta abrir a porta no roteador. Para acesso remoto seguro, use uma VPN como
[Tailscale](https://tailscale.com) (ex.: `tailscale serve 8088` no host, que
dá HTTPS automático dentro da sua rede privada) ou um reverse proxy com TLS
(Nginx Proxy Manager/Caddy + Let's Encrypt) se preferir um domínio público —
passo a passo completo em [`docs/deployment.md`](../docs/deployment.md).

Lembre de preencher `CORS_ORIGINS` no `docker-compose.yml` com o domínio
público real — sem isso, a API aceita requisições de qualquer origem.

## Atualizando para uma nova versão da imagem

```bash
docker compose pull
docker compose up -d
```
