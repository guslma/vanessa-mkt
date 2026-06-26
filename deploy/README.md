# Deploy oficial (ZimaOS / CasaOS)

Este `docker-compose.yml` usa uma imagem publicada no Docker Hub (build via
`scripts/build-and-push.sh`, ver passo abaixo) em vez de buildar localmente —
é o formato que o CasaOS/ZimaOS espera para instalar como app (ícone, nome e
descrição na interface vêm do bloco `x-casaos`).

## Antes do primeiro `docker compose up -d` (importante)

Os dados ficam em bind mounts em `/DATA/AppData/marketing-tracker/`, seguindo
o mesmo padrão de outros apps do ZimaOS. Crie as pastas e ajuste a permissão
da pasta do Postgres **antes** de subir a stack pela primeira vez:

```bash
mkdir -p /DATA/AppData/marketing-tracker/db
mkdir -p /DATA/AppData/marketing-tracker/uploads
chown -R 999:999 /DATA/AppData/marketing-tracker/db
```

O uid/gid 999 é o usuário `postgres` dentro da imagem `postgis/postgis:16-3.4`
(confirmado com `docker run --rm postgis/postgis:16-3.4 id postgres` — é
Debian-based, diferente do 70 usado em imagens `postgres:*-alpine`). Sem esse
`chown`, o container do banco entra em crash loop por falta de permissão na
pasta de dados.

## Publicar a imagem (rodar uma vez, de qualquer máquina com Docker)

Na raiz do repositório:

```bash
export DOCKERHUB_USER=seu-usuario
./scripts/build-and-push.sh        # publica <usuario>/marketing-tracker:latest
```

## Configurar o `.env`

```bash
cd deploy
cp .env.example .env
```

Preencha `DOCKERHUB_USER` (o mesmo do passo acima), `DB_PASSWORD` e
`JWT_SECRET` (gere com `openssl rand -hex 16` / `openssl rand -hex 32`), e
`ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` — a conta dela, criada
automaticamente no primeiro start.

## Instalar no ZimaOS

Via interface: App Store → "Instalar app personalizado" → cole o conteúdo de
`deploy/docker-compose.yml` (as variáveis `${...}` precisam estar definidas
nas variáveis de ambiente do app na própria interface do CasaOS, já que ela
não lê o `.env` local).

Via terminal (SSH no servidor, lendo o `.env` desta pasta):

```bash
casaos-cli app-management install -f deploy/docker-compose.yml
```

## Instalar em qualquer Docker (sem CasaOS)

```bash
cd deploy
docker compose up -d
```

Acesse em `http://<ip-do-servidor>:8088`. No primeiro start, o container
`app` aplica as migrations do banco e cria o usuário administrador
automaticamente (via `ADMIN_EMAIL`/`ADMIN_PASSWORD`).

## Dados

| Caminho no host | Conteúdo |
|---|---|
| `/DATA/AppData/marketing-tracker/db` | Banco Postgres + PostGIS |
| `/DATA/AppData/marketing-tracker/uploads` | Arquivos anexados às tarefas |

Ambos são bind mounts — sobrevivem a `docker compose down` e a atualizações
de imagem, e ficam visíveis/gerenciáveis direto pelo gerenciador de arquivos
do ZimaOS. Apagar essas pastas apaga os dados permanentemente. Veja
[`docs/deployment.md`](../docs/deployment.md) para backup do banco (`pg_dump`).

## Ícone no painel do CasaOS

O bloco `x-casaos` ainda não define um `icon:` — sem ele, o CasaOS mostra um
ícone genérico, o que não impede o app de funcionar. Quando o projeto tiver
um repositório público no GitHub, o mesmo truque do jsDelivr pode ser usado
para hospedar o ícone sem precisar de um servidor próprio:

```
https://cdn.jsdelivr.net/gh/<usuario>/<repo>@<tag>/frontend/public/icons/icon-512.png
```

Fixe sempre numa tag (`git tag v1.0.0 && git push origin v1.0.0`) em vez de
`main`/`master` — assim o link não quebra quando o ícone for atualizado numa
versão futura, e quem instalou uma versão antiga continua vendo o ícone
correspondente.

## Acesso remoto (fora da rede local)

O container expõe a porta 8088 sem TLS próprio — embora o app já exija login
(JWT), instalar como PWA fora de `localhost` exige HTTPS válido, então não
basta abrir a porta no roteador. Duas opções:

- **VPN** — [Tailscale](https://tailscale.com) (ex.: `tailscale serve 8088`
  no host, que dá HTTPS automático dentro da sua rede privada). Mais simples,
  mas exige instalar o Tailscale em cada dispositivo dela.
- **Domínio público + reverse proxy** — DuckDNS (já usado neste projeto) +
  Nginx Proxy Manager/Caddy emitindo certificado Let's Encrypt. Passo a passo
  completo em [`docs/deployment.md`](../docs/deployment.md).

## Atualizando para uma nova versão da imagem

```bash
./scripts/build-and-push.sh v1.1   # na máquina de build
# no ZimaOS, dentro desta pasta:
docker compose pull
docker compose up -d
```

Se usar sempre a tag `latest`, basta `docker compose pull && docker compose up -d`
no ZimaOS sem precisar editar o `.env`.
