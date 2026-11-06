# CI/CD - GitHub Actions, GHCR e Coolify

O GitHub valida o projeto, constrói e testa o container, publica no GHCR e solicita o deploy ao Coolify. A configuração das aplicações no Coolify é manual, no team **Lucas**.

## Fluxos

| Evento | Verificações | Publicação |
| --- | --- | --- |
| Pull request | Instalação com lockfile, ESLint, tipos de rotas, TypeScript e build | Nenhuma |
| Push em branches de desenvolvimento | Mesmas verificações | Nenhuma |
| Push em `staging` | CI, build Docker e teste HTTP do container | GHCR com tag `staging`; webhook de homologação quando habilitado |
| Push em `main` | CI, build Docker e teste HTTP do container | GHCR com tag `production`; webhook de produção quando habilitado |

Produção está preparada, mas não precisa existir agora. O workflow só publica a partir de `main`. Execuções manuais dos workflows de deploy também respeitam a branch de cada ambiente. Os deploys são serializados por ambiente; as verificações de PR cancelam execuções anteriores do mesmo PR.

### Arquivos

- `.github/workflows/ci.yml`: verificações reutilizadas por ambos os deploys.
- `.github/workflows/staging.yml`: entrada de homologação.
- `.github/workflows/production.yml`: entrada de produção.
- `.github/workflows/deploy.yml`: construção, teste, publicação e chamada ao Coolify.
- `Dockerfile`: build com Bun e servidor Next.js standalone em Node.js 22, executado sem root na porta 3000.
- `.dockerignore`: exclui dependências locais, builds, Git e arquivos de ambiente do contexto Docker.
- `.node-version`: versão principal do Node.js usada pelo CI.

A versão de Bun é 1.4.4, como no ambiente local. As actions estão fixadas por SHA. Nenhum teste de aplicação foi presumido: os scripts existentes não incluem uma suíte automatizada.

## 1. Configurar o GitHub

Em **Settings → Environments**, crie `staging` e, quando necessário, `production`.

Em **Settings → Secrets and variables → Actions**, adicione o secret:

| Secret | Valor |
| --- | --- |
| `COOLIFY_TOKEN` | Token do Coolify vinculado ao team Lucas com permissão de deploy |

O workflow usa automaticamente `GITHUB_TOKEN` com `packages: write` para publicar no GHCR. Não crie um PAT para o pipeline. Se usar tokens diferentes para homologação e produção, crie `COOLIFY_TOKEN` nos respectivos environments em vez de compartilhar um secret do repositório.

Configure estas **variables em cada environment**:

| Variável | Valor |
| --- | --- |
| `SITE_URL` | Origem pública real do ambiente, incluindo `https://` |
| `NEXT_PUBLIC_API_URL` | URL pública do NestJS, incluindo `https://`; incorporada ao build |
| `COOLIFY_DEPLOY_WEBHOOK` | URL “Deploy Webhook (auth required)” da aplicação correspondente |
| `COOLIFY_DEPLOY_ENABLED` | `true` apenas depois que a aplicação estiver pronta no Coolify |

Sem `COOLIFY_DEPLOY_ENABLED=true`, o workflow valida e publica a imagem, mas não chama o Coolify. Isso permite gerar a primeira imagem antes de criar a aplicação e manter produção preparada sem ativá-la.

`SITE_URL` é público e entra no build porque os metadados de páginas estáticas são gerados nessa etapa. Configure-o no GitHub antes de publicar um ambiente real; alterar apenas a variável de runtime no Coolify não atualiza os metadados já construídos.

A organização do GitHub deve permitir que o repositório publique packages. Se um package com esse nome já existir, confira o acesso do repositório nas configurações do package.

## 2. Imagens no GHCR

Para este repositório, o nome é **`ghcr.io/ierri/front-end`**. O workflow deriva o nome de `github.repository` em minúsculas.

Tags publicadas:

- Homologação: `staging` e `staging-<SHA completo do commit>`.
- Produção: `production` e `production-<SHA completo do commit>`.

O container é testado antes da publicação: `/auth`, `/favicon.ico` e o SVG oficial devem responder com sucesso. As tags versionadas permitem selecionar um build anterior para rollback. Nenhuma tag `latest` é compartilhada entre os ambientes.

O package nasce privado por padrão. Para permitir pull sem credencial, altere a visibilidade do package para público nas configurações do GitHub. Se mantiver privado, configure uma credencial de registry no Coolify com permissão `read:packages`; essa credencial fica no Coolify, não precisa ser outro secret do workflow.

## 3. Configurar o Coolify manualmente

No team **Lucas**:

1. Crie o projeto Ierri e um ambiente de homologação.
2. Crie uma aplicação do tipo **Docker Image**, não uma aplicação que recompila o repositório Git.
3. Configure a imagem `ghcr.io/ierri/front-end`, tag `staging`.
4. Configure a porta interna `3000` e o domínio público do ambiente.
5. Use `/auth` na porta 3000 para o healthcheck, caso configure o check no painel. A imagem também declara um Docker healthcheck.
6. Copie o **Deploy Webhook (auth required)** para a variável `COOLIFY_DEPLOY_WEBHOOK` do environment `staging` no GitHub.
7. Crie no team Lucas um token com permissão `deploy` e salve como `COOLIFY_TOKEN` no GitHub. A API do Coolify deve estar habilitada e acessível pelo runner.
8. Defina `COOLIFY_DEPLOY_ENABLED=true` no environment `staging`.

Não habilite um segundo fluxo de auto-deploy por push no Coolify para esta aplicação: o GitHub Actions é quem decide quando chamar o deploy, após validar e publicar a imagem.

Ao criar produção, repita para uma aplicação separada, com tag `production`, domínio próprio e variáveis no environment `production`. A branch usada pelo GitHub será `main`.

## 4. Acompanhar e reverter

O Actions informa a imagem e a tag versionada no resumo. HTTP 2xx no webhook confirma apenas que o pedido foi aceito: acompanhe a conclusão e o estado saudável em **Deployments** no Coolify.

Para rollback manual, selecione a tag versionada anterior na aplicação e faça o deploy pelo painel. Depois, retorne a tag da aplicação para `staging` ou `production` quando quiser voltar a acompanhar as próximas publicações automáticas.

As tags de ambiente apontam para o último build publicado. O webhook usa a tag configurada na aplicação e o pull acontece no Coolify; não é um mecanismo de fixação da aplicação a um SHA específico. Para um fluxo de promoção estritamente por digest, será necessário ajustar o contrato de deploy no futuro.

## Validação local

```bash
bun install --frozen-lockfile
bun run next typegen
bun run lint
bun run typecheck
bun run build
docker build -t ierri-local .
docker run --rm -p 3000:3000 ierri-local
```

O runtime recebe apenas o output standalone, assets estáticos e arquivos públicos. Credenciais não são passadas como build arguments. O `GITHUB_TOKEN` é usado apenas na etapa de login do registry, e o `COOLIFY_TOKEN` apenas na chamada do webhook.

## Referências

- [Publicação e acesso ao GHCR](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Cache Docker no GitHub Actions](https://docs.docker.com/build/ci/github-actions/cache/)
- [Webhooks de deploy do Coolify](https://coolify.io/docs/core/automation/deploy-webhooks)
