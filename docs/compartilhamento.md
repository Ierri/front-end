# Compartilhamento de links

O layout usa `lib/metadata.ts` para definir título, descrição, URL canônica e cartões Open Graph e Twitter. A imagem oficial é `public/brand/ierri/social/open-graph-1200x630.png`, um PNG de 1200 × 630 com a identidade do Ierri.

A página inicial usa a chamada “Ierri - Boas interfaces merecem ser compartilhadas”. `/auth` usa “Entre na comunidade | Ierri”, com sua própria descrição e URL. Ambas disponibilizam os metadados no HTML, sem depender do JavaScript do navegador nem da API de autenticação. A página de autenticação continua com `noindex`.

Para novas páginas, use `pageMetadata({ path, title, description })` nos metadados da página. Isso inclui novamente as imagens ao substituir Open Graph, pois o Next.js não mescla seus campos internos entre segmentos.

## Publicação

Configure `SITE_URL` com a origem pública real do front-end (por exemplo, o domínio HTTPS configurado na hospedagem). A configuração transforma as URLs de imagem e página em endereços absolutos. No GitHub Actions, preencha `SITE_URL` no environment de deploy; o Dockerfile já recebe esse argumento durante o build. É necessário gerar um novo build após mudar o domínio.

O endereço local `http://localhost:3000` permite desenvolver, mas não é acessível aos robôs de compartilhamento. Para conferir o cartão no WhatsApp, o site e a imagem precisam estar publicados e acessíveis sem login. Envie o link público da página inicial ou de `/auth`. A apresentação final e o cache da prévia dependem do aplicativo.

## Verificação local

Após `bun run build` e `bun run start`, confira o HTML de `/` e `/auth` com o user-agent `WhatsApp`:

```bash
curl -A 'WhatsApp' http://localhost:3000/auth
```

Procure `og:title`, `og:description`, `og:url`, `og:image` e `twitter:card`. A URL de `og:image` deve retornar `200` e `Content-Type: image/png`.
