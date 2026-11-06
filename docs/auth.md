# Autenticação

Acesse `/auth`. A composição visual se inspira no [Auth 11 da Efferd](https://efferd.com/blocks/auth#auth-11), com shadcn/ui, Tailwind e a identidade oficial do Ierri.

## Organização

| Arquivo | Responsabilidade |
| --- | --- |
| `app/auth/page.tsx` | Layout, marca, textos editoriais e metadados |
| `components/auth/auth-form.tsx` | Coordenação das etapas de e-mail, login e cadastro |
| `components/auth/email-form.tsx` | Validação do e-mail e consulta da próxima etapa |
| `components/auth/credentials-form.tsx` | Campos, validação e envio de login ou cadastro |
| `lib/validations/auth.ts` | Schemas Zod para e-mail, login e cadastro |
| `lib/validations/form-errors.ts` | Mensagens por campo e foco no primeiro erro |
| `lib/auth/types.ts` | Tipos derivados dos schemas e interface do serviço de autenticação |
| `lib/auth/service.ts` | Ponto de integração com o backend; operações indisponíveis enquanto a API não existe |

## Fluxo atual

1. O formulário valida e normaliza o e-mail com Zod.
2. `authService.checkEmail({ email })` retorna a etapa de login com o perfil resumido ou a etapa de cadastro.
3. O formulário de credenciais valida os campos e chama `authService.login` ou `authService.register`.
4. O estado de envio desabilita as ações enquanto a operação está em andamento. Falhas exibem mensagem acessível e mantêm os valores para nova tentativa.

O backend ainda não existe. As operações do serviço rejeitam a tentativa e os formulários exibem uma mensagem de indisponibilidade. Nenhum e-mail é tratado como conta existente por uma regra local, e o fluxo não avança sem resposta do serviço. Não há usuários fictícios, resultados simulados, requisições, sessões ou persistência de credenciais.

O cadastro pede nome, senha com pelo menos oito caracteres e confirmação. Cada campo de senha tem controle de visibilidade independente. A confirmação é validada no formulário e excluída do payload do serviço. O login exige senha preenchida sem impor as regras de criação de senha.

## Integração com o backend

Os formulários já aguardam funções assíncronas do serviço. Ainda não há endpoints HTTP configurados: faltam os contratos reais de consulta de e-mail, login, cadastro e sessão.

A interface `AuthService` é um contrato interno do frontend, não uma afirmação sobre o formato da API:

- `checkEmail({ email })`: retorna `{ nextStep: "login", user: { name, initials } }` ou `{ nextStep: "register" }`.
- `login({ email, password })`: retorna `{ message }` após concluir a operação.
- `register({ name, email, password })`: retorna `{ message }` após concluir a operação.

Quando a API for definida:

1. Implemente um adaptador HTTP compatível com `AuthService`, traduzindo os contratos reais para os tipos internos. Verifique status e formato das respostas; falhas devem rejeitar a operação.
2. Implemente as operações de `lib/auth/service.ts` com o adaptador real.
3. Integre o mecanismo real de sessão e o destino após autenticação conforme o contrato aprovado. Não simule sessão nem persista senhas no navegador.
4. Ajuste as regras Zod às regras reais do backend e defina o tratamento das mensagens de erro retornadas pela API.

Os provedores sociais continuam desativados até serem integrados. Nenhum endpoint, token ou formato de sessão foi presumido nesta organização.

## Semântica e tema

Os formulários têm nomes acessíveis; campos usam labels, mensagens relacionadas por `aria-describedby` e `aria-invalid`. O formulário de credenciais agrupa seus campos com `fieldset` e `legend`. Falhas de requisição usam `role="alert"`; resultados usam `role="status"`; envios usam `aria-busy`.

A página segue o tema global e o atalho `d`. O monograma alterna entre as variantes oficiais. Use Tailwind para os estilos, preservando o CSS global para o tema e regras globais necessárias; não criar CSS Modules.
