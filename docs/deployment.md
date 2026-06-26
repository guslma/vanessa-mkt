# Deploy no ZimaOS (CasaOS)

## Visão geral do caminho até "ela acessa de qualquer lugar"

```
Celular/PC da esposa (fora de casa)
   -> https://seu-nome.duckdns.org
   -> roteador de casa (porta 443 redirecionada)
   -> ZimaOS: proxy reverso (Nginx Proxy Manager ou Caddy) com certificado Let's Encrypt
   -> container "marketing-tracker" (porta 8088 interna)
```

PWA só instala fora de `localhost` se servido por HTTPS válido — por isso o proxy reverso com certificado é pré-requisito, não opcional.

## 1. DuckDNS

Você já tem o DuckDNS instalado. Confirme que o domínio (`algumacoisa.duckdns.org`) está atualizando para o IP público de casa (o próprio container/app do DuckDNS no ZimaOS faz isso periodicamente). Anote o domínio escolhido — vai ser usado no proxy reverso.

## 2. Port forward no roteador

No roteador de casa, redirecione a porta **443** (e opcionalmente 80, para o desafio HTTP do Let's Encrypt) para o IP interno do ZimaOS na rede local.

## 3. Proxy reverso com HTTPS

Instale um destes (via app store do CasaOS ou compose manual):
- **Nginx Proxy Manager** — interface web simples para apontar `algumacoisa.duckdns.org` → `http://localhost:8088` e emitir certificado Let's Encrypt com um clique.
- **Caddy** — `Caddyfile` minimalista:
  ```
  algumacoisa.duckdns.org {
    reverse_proxy localhost:8088
  }
  ```
  Caddy emite e renova o certificado automaticamente.

## 4. Publicar a imagem do app

Em uma máquina com Docker (pode ser seu próprio computador):
```sh
export DOCKERHUB_USER=seu-usuario
./scripts/build-and-push.sh        # builda e publica <usuario>/marketing-tracker:latest
```

## 5. Instalar no ZimaOS

A pasta `deploy/` é autocontida e tem seu próprio passo a passo — veja [`deploy/README.md`](../deploy/README.md). Resumo:

1. Copie `deploy/docker-compose.yml` e `deploy/.env.example` para uma pasta no ZimaOS.
2. Copie `.env.example` para `.env` e preencha `DOCKERHUB_USER`, `DB_PASSWORD`, `JWT_SECRET` (gere algo aleatório longo, ex. `openssl rand -hex 32`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (a senha inicial dela).
3. Suba: `docker compose up -d`.
4. O container `app` roda as migrations e cria o usuário admin automaticamente no primeiro start (via `ADMIN_EMAIL`/`ADMIN_PASSWORD`). Depois disso esses dados ficam só no banco — pode remover as variáveis do `.env` se preferir, ou trocar a senha pela própria tela de Usuários.
5. Confirme local: `http://<ip-do-zimaos>:8088/api/health` deve responder `{"ok":true}`.
6. Confirme externo: `https://algumacoisa.duckdns.org/api/health` pelo proxy reverso.

## 6. Instalar o PWA no celular/PC dela

Acessando `https://algumacoisa.duckdns.org` pelo Chrome/Safari:
- **Android/Chrome**: menu → "Instalar app" / "Adicionar à tela inicial".
- **iPhone/Safari**: botão compartilhar → "Adicionar à Tela de Início".
- **Desktop/Chrome/Edge**: ícone de instalação na barra de endereço.

## Backup e restauração do banco

Volume persistido em `/DATA/AppData/marketing-tracker/db` (Postgres). Para backup manual:
```sh
docker exec marketing-tracker-db pg_dump -U marketing marketing > backup_$(date +%Y%m%d).sql
```
Para restaurar em um banco novo:
```sh
cat backup_20260101.sql | docker exec -i marketing-tracker-db psql -U marketing marketing
```
Recomenda-se agendar esse `pg_dump` periodicamente (ex. via cron do próprio ZimaOS) para uma pasta com backup externo (outro disco/cloud), já que o volume local não protege contra falha de disco.

## Anexos de tarefas

Os arquivos enviados pela tela de tarefas ficam em `/DATA/AppData/marketing-tracker/uploads` (volume do container `app`), separado do volume do banco — inclua essa pasta no seu backup também.

## Importar os dados reais da planilha

Depois do primeiro deploy, para trazer as tarefas/empreendimentos que ela já tiver na planilha além dos 5 de exemplo:
```sh
docker exec -it marketing-tracker npm run import -- --file=/caminho/dentro/do/container/planilha.xlsx --dry-run
```
Veja `database/migrations` e o script `backend/src/scripts/import-xlsx.ts` para detalhes do parsing e do modo `--dry-run`.

## Atualizações futuras

Para enviar uma nova versão: rode `./scripts/build-and-push.sh <nova-tag>`, atualize a tag no `.env` (ou use `latest` e apenas `docker compose pull && docker compose up -d` no ZimaOS). Veja também `deploy/README.md`.
