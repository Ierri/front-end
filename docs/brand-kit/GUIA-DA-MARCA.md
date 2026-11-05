# Ierri - Guia de identidade visual

**Marca:** Ierri  
**Significado:** Interface Review  
**Slogan:** Share. Review. Inspire.  
**Produto:** rede social pública para compartilhar, explorar e avaliar interfaces.

## Conceito

Identidade criativa, divertida, moderna, minimalista e social. Inspirada na qualidade de exploração visual do Behance, sem copiar sua marca ou layouts. O conteúdo publicado pelos usuários deve ser o protagonista. Evitar estética genérica de IA, excesso de ornamentos, gradientes, glassmorphism ou visual de dashboard administrativo.

## Paleta oficial

| Cor | Hex | Função |
|---|---|---|
| Coral Ierri | `#FF4D3D` | Cor de marca, destaques, ações importantes |
| Grafite | `#171717` | Textos, títulos, monograma |
| Branco | `#FFFFFF` | Fundo principal |
| Off-white | `#FAF9F6` | Fundo alternativo |
| Coral suave | `#FFF0ED` | Destaques discretos |
| Coral escuro | `#C72C20` | Links/textos contrastantes |
| Cinza claro | `#F3F3F3` | Superfícies suaves |
| Cinza borda | `#E5E5E5` | Bordas/divisórias |
| Cinza secundário | `#6B6B6B` | Descrições/metadados |

**Aplicação:** interface predominantemente branca; coral em pontos de ação e identidade; grafite para tipografia. Verificar contraste de todos os estados. O coral `#FF4D3D` não deve receber automaticamente texto branco pequeno sem checar WCAG; prefira combinações acessíveis.

## Tipografia

- **Space Grotesk** - títulos, headings, chamadas, identidade editorial. Pesos recomendados: 500 / 600 / 700. https://fonts.google.com/specimen/Space+Grotesk
- **Inter** - UI, navegação, botões, formulários, textos, comentários e metadados. Pesos recomendados: 400 / 500 / 600. https://fonts.google.com/specimen/Inter

Tamanhos referenciais: display 48–64px, H1 36–40px, H2 28–32px, H3 20–24px; corpo 16px, secundário 14px, legenda 12px. Ajustar à escala do projeto. **Não há arquivos de fonte no ZIP:** as famílias podem ser carregadas pelo projeto conforme sua estratégia de dependências.

## Marca principal

O monograma **iR** é o logotipo principal, sempre sem texto. O ponto coral é um elemento distintivo. A marca é desenhada em formas vetoriais, sem depender de fonte. Preservar proporções, área de respiro e contrastes.

| Contexto | Ativo recomendado |
|---|---|
| Header claro / navbar | `logos/svg/ierri-symbol-primary.svg` |
| Fundo escuro | `logos/svg/ierri-symbol-inverse.svg` |
| Fundo coral | `logos/svg/ierri-symbol-white.svg` |
| Impressão preta | `logos/svg/ierri-symbol-dark.svg` |
| App / favicon | `icons/favicon.svg` e `icons/favicon.ico` |
| GitHub organization | `social/github-avatar-512.png` |
| Compartilhamento de link | `social/open-graph-1200x630.png` |

Arquivos `logos/svg/` possuem versão vetorial; arquivos `logos/png/` têm rasterização fiel em resolução indicada. SVGs do símbolo, sem fundo, são transparentes. Os nomes `on-*` possuem fundo incorporado e são adequados quando esse fundo for desejado.

## Linguagem de UI

- **Feed:** galeria pública com cards visuais ricos, capas generosas e informações secundárias discretas.
- **Postagem:** imagens/vídeos grandes, descrição, votos e comentários.
- **Perfil:** portfólio público com avatar, bio, stacks e galeria.
- **Criação:** formulário simples, preview do upload e estados de carregamento claros.
- **Tipografia:** Space Grotesk para título, Inter no conteúdo funcional.
- **Ícones:** Lucide, traços coerentes; evitar misturar estilos.
- **Interações:** hover simples, feedback visível, skeletons, respeito a `prefers-reduced-motion`.
- **Layout:** claro, responsivo, com espaçamentos consistentes; conteúdo em primeiro lugar.

## Compatibilidade com shadcn/ui

Utilizar o **shadcn/ui** já instalado. Adaptar a paleta e a tipografia à configuração e aos tokens semânticos existentes no repositório. **Este guia não exige novas variáveis CSS, nem impõe nomes de classes, nem reestrutura o tema do projeto.** Reutilizar componentes existentes antes de criar outros. Garantir acessibilidade e não mudar comportamento de negócio para apenas alterar estética.

## Conteúdos visuais

Para preencher exemplos de projetos, utilizar capturas autorizadas, protótipos próprios e mockups de interfaces. Evitar imagens genéricas de fotografia como conteúdo principal do feed. Não inserir conteúdos de terceiros sem licença ou autorização.

## Tom de voz

Criativo, direto, acolhedor e informal. Exemplos: “Boas interfaces merecem ser compartilhadas.” e “Descubra o que a comunidade está criando.”

## Observações de produção

O monograma SVG desta entrega foi redesenhado vetorialmente a partir da direção visual aprovada. Se houver um arquivo mestre vetorial anterior, compare e mantenha uma única referência de marca. O arquivo de origem que inspirou o vetor está disponível em `previews/logo-referencia-aprovada.png`. O SVG é o recomendado para implementação web por sua nitidez e facilidade de dimensionamento.
