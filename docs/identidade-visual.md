# Ierri - Identidade Visual e Diretrizes de Desenvolvimento

Este documento é a referência permanente de identidade visual, experiência e desenvolvimento do Ierri. Consulte-o antes de implementar alterações e aplique as diretrizes dentro do escopo solicitado. A documentação não autoriza, por si só, criar páginas, funcionalidades ou integrações.

## 1. Visão geral

- **Nome:** Ierri
- **Significado:** Interface Review
- **Slogan:** Share. Review. Inspire.
- **Categoria:** Rede social de interfaces e design
- **Principal referência:** Behance
- **Biblioteca de componentes:** shadcn/ui

O Ierri é uma rede social pública voltada para designers, desenvolvedores e criadores digitais compartilharem interfaces, descobrirem projetos, receberem avaliações e interagirem com outros usuários.

A plataforma permitirá publicar projetos com imagens e vídeos, comentar, votar e manter perfis públicos contendo informações pessoais, stacks e postagens.

A experiência deve lembrar uma rede social criativa, com forte valorização do conteúdo visual. O Ierri não deve parecer um dashboard administrativo, uma plataforma corporativa ou um produto genérico de inteligência artificial.

### Personalidade

Criativa, divertida, moderna, social, expressiva, minimalista e acessível.

## 2. Identidade visual

A identidade combina minimalismo com personalidade. O design da plataforma deve complementar os projetos publicados sem competir com eles.

### Direção estética

- Interface predominantemente clara.
- Cores sólidas e contrastantes.
- Tipografia moderna, geométrica e expressiva.
- Composições limpas e bem organizadas.
- Espaçamentos generosos.
- Elementos visuais simples.
- Cantos suavemente arredondados.
- Navegação intuitiva.
- Microinterações sutis.
- Conteúdo visual como protagonista.

### Evitar

- Gradientes decorativos.
- Glassmorphism.
- Sombras exageradas.
- Elementos tridimensionais desnecessários.
- Excesso de bordas.
- Interfaces com aparência de dashboards.
- Templates genéricos de SaaS.
- Estética artificial associada a produtos de IA.
- Uso excessivo da cor principal.

A identidade deve ser expressiva sem parecer visualmente carregada.

## 3. Paleta de cores

### Cores principais

| Cor | Hexadecimal | Aplicação |
| --- | --- | --- |
| Coral Ierri | `#FF4D3D` | Identidade, botões, destaques e elementos interativos |
| Grafite | `#171717` | Títulos, textos principais e elementos de contraste |
| Branco | `#FFFFFF` | Fundo principal e superfícies |
| Off-white | `#FAF9F6` | Fundos alternativos e áreas de destaque |

### Cores complementares

| Cor | Hexadecimal | Aplicação |
| --- | --- | --- |
| Coral suave | `#FFF0ED` | Estados selecionados e destaques sutis |
| Coral escuro | `#C72C20` | Textos, links e elementos que exigem maior contraste |
| Cinza claro | `#F3F3F3` | Superfícies secundárias |
| Cinza borda | `#E5E5E5` | Separadores e bordas discretas |
| Cinza texto | `#6B6B6B` | Descrições e informações secundárias |

### Aplicação

O coral é a principal assinatura cromática, mas não deve dominar a interface inteira. O branco deve predominar para valorizar as imagens e os projetos publicados. O grafite estabelece a hierarquia e garante boa legibilidade.

Utilizar as cores complementares conforme a necessidade dos componentes. Não criar novas cores sem uma justificativa visual ou funcional. Ajustar contrastes quando necessário para garantir acessibilidade.

As cores são referências de identidade, não uma imposição de nomes de variáveis ou tokens CSS.

## 4. Tipografia

### Fonte principal: Space Grotesk

[Google Fonts - Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)

Fonte geométrica, moderna e expressiva, responsável pela personalidade visual da marca.

**Aplicações:** títulos principais, headings, chamadas de destaque, textos promocionais, landing page e identidade editorial da plataforma.

**Pesos recomendados:** Bold (700), SemiBold (600) e Medium (500).

### Fonte secundária: Inter

[Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

Fonte dos elementos funcionais, oferecendo legibilidade e consistência.

**Aplicações:** textos comuns, navegação, formulários, botões, comentários, informações de postagens, descrições e informações dos perfis.

**Pesos recomendados:** Regular (400), Medium (500) e SemiBold (600).

### Hierarquia tipográfica

| Elemento | Fonte | Tamanho de referência |
| --- | --- | --- |
| Display | Space Grotesk Bold | 48–64px |
| H1 | Space Grotesk Bold | 36–40px |
| H2 | Space Grotesk SemiBold | 28–32px |
| H3 | Space Grotesk SemiBold | 20–24px |
| Texto principal | Inter Regular | 16px |
| Texto secundário | Inter Regular | 14px |
| Legendas | Inter Regular | 12px |
| Botões | Inter Medium/SemiBold | 14px |

Os tamanhos são referências visuais, não valores obrigatórios. Utilizar a escala existente no projeto, adaptando-a conforme necessário. Evitar configurações redundantes se o sistema atual já oferecer soluções adequadas.

## 5. Logotipo

O logotipo é um símbolo minimalista inspirado na combinação das letras **i** e **R**, representando Interface Review.

### Características

- Monograma único.
- Geometria simples.
- Formas robustas.
- Cantos arredondados.
- Identidade reconhecível em tamanhos pequenos.
- Aparência moderna e minimalista.
- Sem gradientes, sombras ou efeitos decorativos.

### Aplicações

- **Principal:** símbolo grafite com detalhe coral sobre fundo claro.
- **Alternativa:** símbolo branco sobre fundo coral.
- **Monocromática:** símbolo inteiramente preto ou branco.

O símbolo deve funcionar independentemente do nome da plataforma. Utilizar o logotipo oficial fornecido pelo projeto. Não recriar ou substituir a marca por um símbolo genérico.

## 6. Referências visuais

### Behance

Principal referência de experiência: exploração de projetos, organização das galerias, apresentação de trabalhos, páginas de projetos, perfis de criadores, destaque dado às imagens, navegação e descoberta de conteúdos.

### Dribbble

Referência complementar: cards de projetos, composições visuais, apresentação de thumbnails, microinterações e organização de informações.

### Princípio

As referências devem orientar a qualidade visual e a experiência, sem serem copiadas diretamente. O Ierri precisa construir uma identidade própria.

## 7. Componentes e shadcn/ui

Manter shadcn/ui como base dos componentes e trabalhar sobre a estrutura existente.

### Diretrizes

- Reutilizar os componentes já disponíveis.
- Personalizá-los conforme a identidade do Ierri.
- Preservar acessibilidade e comportamento.
- Evitar reconstruir componentes que já existem.
- Não instalar bibliotecas redundantes sem necessidade.
- Respeitar a arquitetura e os padrões do projeto.
- Manter consistência visual entre as páginas.
- Utilizar ícones Lucide quando necessário.

A implementação visual deve aproveitar o sistema de temas existente. Não criar antecipadamente variáveis CSS, tokens, componentes ou configurações específicas sem avaliar a estrutura atual.

### Botões

Devem ser expressivos, claros e consistentes. O coral identifica ações importantes, como publicar, criar conta e confirmar operações relevantes. Ações secundárias recebem tratamentos mais discretos.

### Cards

Priorizar imagens e vídeos, que devem ocupar a maior parte da composição. Organizar título, autor, votos e comentários sem competir com a imagem.

### Formulários

Layout limpo, campos bem identificados, estados de foco evidentes, mensagens de erro objetivas, validações compreensíveis e espaçamento confortável.

### Ícones

Estilo consistente, preferencialmente outline. Evitar misturar bibliotecas ou estilos diferentes na mesma interface.

## 8. Experiência da rede social

O Ierri é público. Usuários não autenticados podem explorar postagens e visualizar perfis. Autenticação é necessária para publicar, comentar, votar e gerenciar o próprio perfil.

### Página inicial / Explorar

Transmitir imediatamente a proposta da plataforma. Priorizar navegação simples, identidade reconhecível, busca por projetos, galeria visual de postagens, categorias e filtros quando disponíveis, destaques de projetos, identificação dos criadores e indicadores de interação.

A exploração deve ser agradável mesmo sem autenticação.

### Página de postagem

Foco na apresentação do projeto: imagens e vídeos em destaque, título, descrição, informações do autor, comentários, Upvote e Downvote e navegação clara entre conteúdos.

Favorecer tanto a apresentação visual quanto a troca de feedbacks.

### Perfil

Funcionar como um portfólio social. Priorizar avatar, nome, username, biografia, stacks, postagens publicadas e identidade consistente. Destacar a galeria de projetos.

### Autenticação

Login e registro simples, modernos e acolhedores. Evitar formulários excessivamente complexos. Preservar a identidade sem prejudicar a clareza.

### Publicação

Criação intuitiva, priorizando upload de imagens e vídeos, pré-visualização, título, descrição, feedback claro sobre o envio e ações bem identificadas.

## 9. Imagens e conteúdos visuais

Imagens e vídeos são fundamentais em uma rede social baseada em projetos visuais.

### Liberdade de utilização

Utilizar recursos externos quando necessário, respeitando licenças e permissões. SVGs, mockups, composições CSS e imagens demonstrativas também são permitidos.

### Referências de conteúdo

Priorizar landing pages, aplicativos, dashboards, interfaces mobile, plataformas web, e-commerces, design systems e experimentos de UI/UX.

Evitar o uso excessivo de fotografias genéricas que não representem interfaces digitais.

### Dados demonstrativos

Enquanto as integrações reais não estiverem disponíveis, utilizar dados fictícios para demonstrar a experiência, com exemplos variados e realistas. Não apresentar dados fictícios como publicações reais de usuários. Evitar placeholders vazios, imagens quebradas e repetição excessiva de conteúdos.

## 10. Layout e responsividade

Oferecer experiência consistente em desktop, tablet e mobile.

### Desktop

Navegação horizontal, galerias com múltiplas colunas, imagens grandes, espaçamento generoso e boa utilização da largura disponível.

### Tablet

Reorganizar elementos, reduzir colunas, adaptar navegação e preservar a hierarquia visual.

### Mobile

Navegação simplificada, conteúdo visual em destaque, interações acessíveis ao toque, layout fluido e boa legibilidade.

Não estabelecer larguras ou breakpoints arbitrários se o projeto já possuir padrões definidos. Adaptar a composição aos componentes e à estrutura existentes.

## 11. Microinterações

Animações e transições podem tornar a experiência mais agradável.

**Exemplos:** hover em cards, feedback visual nos votos, transições de botões, animações discretas em menus, estados de carregamento, skeletons, feedback de publicação e mudanças suaves de estados.

Utilizar animações discretas, evitar movimentos desnecessários, preservar desempenho, respeitar preferências de movimento reduzido e não prejudicar a experiência em dispositivos móveis.

As animações complementam a experiência, sem competir com o conteúdo.

## 12. Tom de voz

Comunicação descontraída, criativa e direta. Linguagem acessível a iniciantes e profissionais experientes. Evitar linguagem excessivamente corporativa ou técnica nos textos voltados aos usuários.

### Exemplos de comunicação

| Contexto | Sugestão |
| --- | --- |
| Página inicial | Boas interfaces merecem ser compartilhadas. |
| Explorar | Descubra o que a comunidade está criando. |
| Publicação | Seu próximo projeto merece ser visto. |
| Comentários | Compartilhe sua opinião e ajude essa ideia a evoluir. |
| Perfil vazio | Toda grande ideia começa com um primeiro projeto. |
| Cadastro | Entre para uma comunidade que cria, compartilha e evolui. |

Os textos são sugestões e podem ser adaptados conforme a experiência da página.

## 13. Princípios de UX

- **Conteúdo em primeiro lugar:** interfaces publicadas são o elemento mais importante da experiência.
- **Descoberta:** incentivar a conhecer novos projetos e criadores.
- **Interação:** comentários e votos acessíveis e intuitivos.
- **Simplicidade:** evitar menus complexos, excesso de informações e fluxos desnecessários.
- **Consistência:** manter padrões visuais e de interação entre todas as páginas.
- **Acessibilidade:** garantir legibilidade, contraste adequado, navegação por teclado, indicadores de foco e suporte a tecnologias assistivas.

## 14. Orientações finais para o Codex

Antes de implementar qualquer alteração visual, analisar a estrutura atual. Aplicar a identidade do Ierri sem comprometer a arquitetura existente.

### Regras de execução

1. Utilizar shadcn/ui como base dos componentes.
2. Preservar as configurações existentes sempre que possível.
3. Adaptar as cores da identidade ao sistema de temas atual.
4. Utilizar Space Grotesk e Inter conforme suas funções.
5. Não criar variáveis ou tokens CSS específicos sem necessidade.
6. Não substituir bibliotecas ou estruturas existentes injustificadamente.
7. Não adicionar funcionalidades fora do escopo solicitado.
8. Priorizar componentes reutilizáveis.
9. Utilizar imagens e recursos externos quando contribuírem para a qualidade visual e houver permissão de uso.
10. Manter a experiência responsiva e acessível.
11. Evitar interfaces genéricas ou com estética de dashboard.
12. Preservar a identidade visual em todas as páginas.
13. Não alterar regras de negócio ou contratos da API apenas por decisões estéticas.
14. Respeitar a organização atual do repositório.

### Liberdade criativa

As diretrizes representam a identidade e o posicionamento, sem determinar cada detalhe da implementação. Propor melhorias na composição, hierarquia, espaçamento, interações e apresentação dos conteúdos para melhorar a qualidade do produto sem descaracterizar a marca.

## 15. Resumo da identidade

| Elemento | Definição |
| --- | --- |
| Marca | Ierri |
| Significado | Interface Review |
| Slogan | Share. Review. Inspire. |
| Estilo | Minimalista, moderno e expressivo |
| Personalidade | Criativa, divertida e social |
| Cor principal | `#FF4D3D` |
| Cor de contraste | `#171717` |
| Fundo principal | `#FFFFFF` |
| Fundo alternativo | `#FAF9F6` |
| Fonte de títulos | Space Grotesk |
| Fonte de interface | Inter |
| Biblioteca UI | shadcn/ui |
| Ícones | Lucide |
| Referência principal | Behance |
| Referência complementar | Dribbble |
| Público | Designers, desenvolvedores e criadores digitais |

**Resultado esperado:** uma rede social pública de interfaces, com personalidade visual própria, experiência moderna e conteúdo criativo em destaque. O Ierri deve parecer uma plataforma real, cuidadosamente desenhada para uma comunidade de criadores, e não um template genérico ou uma demonstração de dashboard.


## 16. Configuração aplicada no projeto

O tema do Ierri está definido nos tokens semânticos existentes em `app/globals.css`. O `baseColor: "neutral"` de `components.json` é a base do gerador shadcn/ui; as cores efetivas da aplicação são os tokens personalizados do Ierri. Preserve esses tokens ao adicionar componentes.

| Uso | Classe / token | Tema claro |
| --- | --- | --- |
| Ação principal | `bg-primary` | Coral Ierri `#FF4D3D` |
| Texto sobre ação principal | `text-primary-foreground` | Grafite `#171717` |
| Fundo | `bg-background` | Branco `#FFFFFF` |
| Texto principal | `text-foreground` | Grafite `#171717` |
| Cards e popovers | `bg-card`, `bg-popover` | Branco `#FFFFFF` |
| Superfície alternativa | `bg-secondary` | Off-white `#FAF9F6` |
| Superfície discreta | `bg-muted` | Cinza `#F3F3F3` |
| Texto secundário | `text-muted-foreground` | Cinza `#6B6B6B` |
| Destaque suave | `bg-accent` | Coral suave `#FFF0ED` |
| Texto de destaque e links | `text-accent-foreground` | Coral escuro `#C72C20` |
| Erro ou ação destrutiva | `text-destructive` | Coral escuro `#C72C20` |
| Separadores | `border-border` | Cinza borda `#E5E5E5` |
| Contorno de campos | `border-input` | Cinza `#6B6B6B` |
| Indicador de foco | `ring-ring` | Coral escuro `#C72C20` |

O coral principal com texto branco não oferece contraste suficiente para texto pequeno. Botões principais usam grafite sobre coral; links usam coral escuro. Os contornos de campos são mais contrastantes que separadores decorativos.

O modo claro é o padrão para novos visitantes. A preferência de tema salva continua sendo respeitada, e o modo escuro permanece disponível pelo provedor existente. No escuro, superfícies e bordas usam tons neutros escuros, texto secundário usa cinza claro e o destaque suave usa coral escurecido; essas adaptações preservam contraste e a assinatura coral.

As fontes variáveis são carregadas por `next/font/google`: Inter é `font-sans`, aplicada globalmente; Space Grotesk é `font-heading`, aplicada por padrão a `h1`–`h6`. Títulos usam peso 600 e `h1` usa 700. A escala de tamanhos, espaçamentos e raios existente foi preservada. Geist Mono permanece para `font-mono`.

Use as classes semânticas em novos componentes para herdar automaticamente as cores do tema. Para texto de destaque pequeno, prefira `text-accent-foreground` a `text-primary`. Há uma regra global para respeitar movimento reduzido. Nenhuma página ou fluxo de produto foi criado nesta configuração.


## 17. Kit oficial integrado

Os arquivos oficiais do kit estão em `public/brand/ierri/`, preservados sem redesenhar o símbolo. Os guias originais estão em [brand-kit/GUIA-DA-MARCA.md](brand-kit/GUIA-DA-MARCA.md) e [brand-kit/INSTRUCOES-PARA-CODEX.md](brand-kit/INSTRUCOES-PARA-CODEX.md). O README original do kit foi arquivado junto aos guias; seus caminhos descrevem a organização original.

| Aplicação | URL pública |
| --- | --- |
| Símbolo em fundo claro | `/brand/ierri/logos/svg/ierri-symbol-primary.svg` |
| Símbolo em fundo escuro | `/brand/ierri/logos/svg/ierri-symbol-inverse.svg` |
| Símbolo em fundo coral | `/brand/ierri/logos/svg/ierri-symbol-white.svg` |
| Símbolo monocromático | `/brand/ierri/logos/svg/ierri-symbol-dark.svg` |
| Favicon SVG | `/brand/ierri/icons/favicon.svg` |
| Apple touch icon | `/brand/ierri/icons/apple-touch-icon.png` |
| Manifesto | `/brand/ierri/icons/site.webmanifest` |
| Compartilhamento social | `/brand/ierri/social/open-graph-1200x630.png` |
| Avatar para GitHub | `/brand/ierri/social/github-avatar-512.png` |

As demais variantes SVG/PNG, ícones e avatares também estão disponíveis nas respectivas pastas. Preserve proporções, respiro e contraste do símbolo. Nenhum símbolo foi inserido na página inicial nesta etapa de configuração.

O favicon padrão do Next.js em `app/favicon.ico` foi substituído pelo oficial. O layout configura título, descrição, ícones, manifesto, Open Graph, Twitter Card e cor coral da interface do navegador. O manifesto aponta para os ícones locais e define início e escopo na raiz; ele não implementa cache offline nem service worker.

### URL de publicação

Configure `SITE_URL` com a origem pública real do site em produção (incluindo `https://`). Essa variável define a base das URLs absolutas de compartilhamento. Em Vercel, `VERCEL_PROJECT_PRODUCTION_URL` é usado como alternativa; no ambiente local, a base é `http://localhost:3000`. Não inventar um domínio oficial para a marca.

A paleta e as fontes já configuradas correspondem ao guia do kit. Manter o par `bg-primary text-primary-foreground` e a escolha de contraste documentada acima.
