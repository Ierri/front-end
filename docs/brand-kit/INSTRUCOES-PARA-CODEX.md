# Instruções para o Codex - aplicação da identidade do Ierri

Aplique a identidade visual do kit aos componentes existentes. O produto é uma rede social **pública** de interfaces com referências de experiência no Behance, e não um painel administrativo.

1. Examine primeiro a estrutura e o tema atuais, especialmente a implementação de `shadcn/ui`.
2. Use `logos/svg/ierri-symbol-primary.svg` como símbolo oficial em superfícies claras; escolha versão inversa/monocromática conforme contraste.
3. Use `icons/` para favicons, ícones PWA e app; atualize os links do layout e os caminhos em `site.webmanifest` de acordo com a estrutura de publicação do projeto.
4. Use `social/open-graph-1200x630.png` nos metadados Open Graph e compartilhamento social.
5. Adote as cores HEX do arquivo `GUIA-DA-MARCA.md` mapeando-as para o tema existente. **Não crie tokens CSS específicos nem uma camada paralela de variáveis desnecessária.**
6. Use Space Grotesk para títulos e Inter para a interface. Carregue as fontes via mecanismo do projeto (não incluídas no kit).
7. Evite gradientes e efeitos 3D; evite visual de dashboard empresarial. O feed deve privilegiar a apresentação de projetos.
8. Não substitua bibliotecas, dependências, rotas ou estruturas sem necessidade. Priorize integração visual, responsividade e acessibilidade.
9. Dados de demonstração podem existir no frontend durante o desenvolvimento, sempre identificados como fictícios; use imagens permitidas e pertinentes a interfaces.
10. Preserve o comportamento de autenticação, postagens, perfis, comentários e votos; o kit só define a apresentação.

**Nota sobre SVG:** os SVGs incluem apenas formas geométricas e têm fundo transparente, exceto arquivos explicitamente indicados como `on-*` e os ícones de aplicação.
