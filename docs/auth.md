# Autenticação

A página `/auth` usa `services/auth.ts` para chamar o NestJS diretamente com `fetch` e `credentials: "include"`. Não há rotas de API do Next.js.

## Configuração local

No front-end, copie `.env.example` para `.env.local` e configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

No back-end, configure o `.env` (além de `MONGODB_URI` e `JWT_SECRET`):

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

Execute `bun run start:dev` no back-end e `bun run dev` no front-end. Reinicie os servidores após alterar as variáveis. Use `localhost` em ambos, sem misturar com `127.0.0.1`.

`NEXT_PUBLIC_API_URL` é pública e incorporada ao build do front-end. Em Docker, passe `--build-arg NEXT_PUBLIC_API_URL=https://api.seu-dominio`; no deploy pelo GitHub, configure a variável `NEXT_PUBLIC_API_URL` no environment correspondente. `FRONTEND_URL` aceita origens separadas por vírgula. Em produção, use HTTPS e hospede ambos no mesmo site (por exemplo, `ierri.example.com` e `api.example.com`), pois o cookie usa `SameSite=Lax`. Domínios de sites diferentes exigem outra configuração de cookies e proteção CSRF.

## Fluxo

1. Ao abrir `/auth`, `GET /auth/me` restaura a sessão. Ausência de sessão ou token expirado mostra o formulário; falhas de conexão permitem tentar novamente.
2. `POST /auth/check-email` retorna o perfil resumido para login. Somente `USER_NOT_FOUND` direciona para cadastro.
3. `POST /auth/login` e `POST /auth/register` autenticam o usuário. O cadastro envia nome, e-mail e senha; a confirmação fica no formulário.
4. O NestJS grava o JWT em cookie HttpOnly com duração de 15 minutos e `Secure` em produção. O serviço não armazena tokens ou senhas no localStorage ou sessionStorage. O contrato Bearer existente continua disponível para outros clientes.
5. Após o cadastro, o usuário é redirecionado à página inicial (`/`) com `router.replace`, mantendo a sessão criada pelo NestJS. Após o login, `/auth` mostra o usuário conectado e a opção de sair.
6. `POST /auth/logout` remove o cookie. Não há refresh token nem revogação de JWTs já emitidos; a sessão termina após o prazo e requer novo login.

O NestJS permite CORS com credenciais somente para as origens configuradas e rejeita mutações com origem externa ou `Sec-Fetch-Site: cross-site`.

## Organização e validação

- `components/auth/auth-form.tsx`: etapas do formulário, restauração da sessão e logout.
- `components/auth/email-form.tsx`: consulta do e-mail.
- `components/auth/credentials-form.tsx`: login, cadastro e erros por campo.
- `services/api.ts`: cliente HTTP compartilhado, URL base, credenciais, timeout, validação do envelope e erros da API.
- `services/auth.ts`: endpoints de autenticação, schemas das respostas e tradução do contrato da API.
- `services/auth.types.ts`: tipos do usuário e interface do serviço.
- `lib/validations/auth.ts`: validações do formulário, incluindo o limite de 72 bytes da senha usado pelo bcrypt.

Respostas de sucesso seguem `{ success: true, message, data }`; falhas seguem `{ success: false, error: { code, message, details } }`. Mensagens da API são exibidas no formulário; erros de campo direcionam o foco ao primeiro campo inválido. Envios desabilitam os controles enquanto estão em andamento e possuem tempo limite de dez segundos.

Os provedores sociais permanecem desativados. O layout, os componentes shadcn/ui, os tokens de tema e os recursos oficiais da marca foram preservados.
