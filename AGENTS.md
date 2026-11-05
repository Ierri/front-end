<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` - verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Diretrizes permanentes do Ierri

Leia [Identidade Visual e Diretrizes de Desenvolvimento](docs/identidade-visual.md) antes de planejar ou implementar alterações no Ierri. Esse documento é a referência de identidade, componentes, conteúdo, acessibilidade e experiência do produto para todos os trabalhos futuros neste repositório.

- Analise a estrutura existente antes de alterar código e preserve a arquitetura e o sistema de temas.
- Use shadcn/ui como base, Space Grotesk nos títulos, Inter na interface e Lucide nos ícones, conforme as diretrizes.
- Respeite o escopo solicitado. A documentação descreve a visão do produto; não autoriza criar páginas, funcionalidades, integrações ou alterar regras de negócio por iniciativa própria.
- Utilize somente o logotipo oficial fornecido pelo projeto; não invente um substituto.
- Identifique conteúdos demonstrativos como fictícios e respeite as exigências de autenticação descritas no documento.
- Em pedidos apenas de documentação ou configuração, não implemente telas nem altere a aparência da aplicação.

O kit oficial está integrado em `public/brand/ierri/`. Consulte também `docs/brand-kit/GUIA-DA-MARCA.md` e `docs/brand-kit/INSTRUCOES-PARA-CODEX.md` ao trabalhar com os recursos da marca. Os caminhos públicos e a configuração de compartilhamento estão na seção 17 de `docs/identidade-visual.md`.
