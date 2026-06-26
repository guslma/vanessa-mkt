# Deploy oficial (ZimaOS / CasaOS)

Este `docker-compose.yml` usa uma imagem publicada no Docker Hub (build via
`scripts/build-and-push.sh`, ver passo abaixo) em vez de buildar localmente —
é o formato que o CasaOS/ZimaOS espera para instalar como app (ícone, nome e
descrição na interface vêm do bloco `x-casaos`).

**Existem dois jeitos de instalar, dependendo do que o seu ZimaOS tem disponível:**

- **Com `docker compose`** (se o plugin estiver instalado): usa `.env` +
  `docker-compose.yml` com `${VAR}` — o `docker compose` carrega o `.env`
  automaticamente. Caminho mais simples, recomendado se disponível.
- **Só com `casaos-cli`** (sem o plugin de compose — é o caso de muitos ZimaOS
  recentes, inclusive o que validamos): `casaos-cli app-management install/apply`
  não confirma carregar um `.env` da mesma pasta, então gravamos os valores
  reais direto num `docker-compose.yml` renderizado, sem placeholders, e
  travamos a permissão do arquivo em `600` (só o dono lê) por ter segredo em
  texto puro. **Esse foi o caminho usado na instalação real deste projeto.**

Confira qual tem disponível antes de começar:
```bash
docker compose version   # se der erro "compose is not a docker command", use o caminho casaos-cli
which casaos-cli
```

## Antes de instalar (importante)

Os dados ficam em bind mounts em `/DATA/AppData/marketing-tracker/`, seguindo
o mesmo padrão de outros apps do ZimaOS. Crie as pastas e ajuste a permissão
da pasta do Postgres **antes** de subir a stack pela primeira vez:

```bash
mkdir -p /DATA/AppData/marketing-tracker/{db,uploads}
# Se seu usuário não puder chown direto (comum em ZimaOS sem sudo liberado),
# use um container descartável como root pra isso:
docker run --rm -v /DATA/AppData/marketing-tracker/db:/data alpine chown -R 999:999 /data
```

O uid/gid 999 é o usuário `postgres` dentro da imagem `postgis/postgis:16-3.4`
(confirmado com `docker run --rm postgis/postgis:16-3.4 id postgres` — é
Debian-based, diferente do 70 usado em imagens `postgres:*-alpine`). Sem isso,
o container do banco entra em crash loop por falta de permissão na pasta de dados.

## Publicar a imagem (rodar uma vez, de qualquer máquina com Docker)

Na raiz do repositório:

```bash
export DOCKERHUB_USER=seu-usuario
./scripts/build-and-push.sh        # builda amd64+arm64 via buildx e publica <usuario>/marketing-tracker:latest
```

## Caminho A — com `docker compose`

```bash
cd deploy
cp .env.example .env
```

Preencha `DOCKERHUB_USER` (o mesmo do passo acima), `DB_PASSWORD` e
`JWT_SECRET` (gere com `openssl rand -hex 16` / `openssl rand -hex 32`),
`ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` (a conta criada automaticamente no
primeiro start) e `CORS_ORIGINS` (o domínio público real, ex.
`https://seusubdominio.duckdns.org`). Depois:

```bash
docker compose up -d
```

## Caminho B — só com `casaos-cli` (validado neste projeto)

1. Copie `deploy/docker-compose.yml` para o servidor (ex. `/DATA/AppData/marketing-tracker/docker-compose.yml`).
2. Edite esse arquivo no servidor substituindo cada `${VAR...}` pelo valor real
   (mesmas variáveis do `deploy/.env.example`) — sem deixar nenhum `${...}` sobrando.
3. Trave a permissão, já que o arquivo passa a ter segredos em texto puro:
   ```bash
   chmod 600 /DATA/AppData/marketing-tracker/docker-compose.yml
   ```
4. Instale:
   ```bash
   casaos-cli app-management install -f /DATA/AppData/marketing-tracker/docker-compose.yml
   ```

Em ambos os casos, acesse `http://<ip-do-servidor>:8088` — no primeiro start,
o container `app` aplica as migrations do banco e cria o usuário administrador
automaticamente.

## Dados

| Caminho no host | Conteúdo |
|---|---|
| `/DATA/AppData/marketing-tracker/db` | Banco Postgres + PostGIS |
| `/DATA/AppData/marketing-tracker/uploads` | Arquivos anexados às tarefas |

Ambos são bind mounts — sobrevivem a atualizações de imagem, e ficam
visíveis/gerenciáveis direto pelo gerenciador de arquivos do ZimaOS. Apagar
essas pastas apaga os dados permanentemente. Veja
[`docs/deployment.md`](../docs/deployment.md) para backup automático
(`deploy/backup-db.sh` + cron).

## Ícone no painel do CasaOS

O `x-casaos.icon` já aponta pro ícone do app hospedado via jsDelivr direto do
repositório público, fixado numa tag:

```
https://cdn.jsdelivr.net/gh/guslma/vanessa-mkt@v1.0.0/frontend/public/icons/icon-512.png
```

Ao lançar uma nova versão com ícone diferente, crie uma tag nova
(`git tag vX.Y.Z && git push origin vX.Y.Z`) e atualize a versão na URL —
tags antigas continuam servindo o ícone antigo, então o link não quebra para
quem ainda não atualizou.

## Acesso remoto (fora da rede local)

O container expõe a porta 8088 sem TLS próprio — embora o app já exija login
(JWT), instalar como PWA fora de `localhost` exige HTTPS válido, então não
basta abrir a porta no roteador. Duas opções:

- **VPN** — [Tailscale](https://tailscale.com) (ex.: `tailscale serve 8088`
  no host, que dá HTTPS automático dentro da sua rede privada). Mais simples,
  mas exige instalar o Tailscale em cada dispositivo dela.
- **Domínio público + reverse proxy** — DuckDNS + Nginx Proxy Manager
  emitindo certificado Let's Encrypt. Passo a passo completo (incluindo o que
  fazer se a operadora bloquear a porta 80, como aconteceu na instalação real
  deste projeto) em [`docs/deployment.md`](../docs/deployment.md).

Lembre de configurar `CORS_ORIGINS` com o domínio público real — sem isso, a
API aceita requisições de qualquer origem.

## Atualizando para uma nova versão da imagem

```bash
./scripts/build-and-push.sh v1.1   # na máquina de build
```

**Com `docker compose`:**
```bash
docker compose pull && docker compose up -d
```

**Com `casaos-cli`:**
```bash
docker pull seu-usuario/marketing-tracker:latest
casaos-cli app-management apply marketing-tracker -f /DATA/AppData/marketing-tracker/docker-compose.yml
```
