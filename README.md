# Ierri

Interface Review - **Share. Review. Inspire.**

Rede social pública de interfaces e design, construída com Next.js e shadcn/ui.

## Documentação do produto

Consulte a [Identidade Visual e Diretrizes de Desenvolvimento](docs/identidade-visual.md) para a referência permanente de marca, paleta, tipografia, componentes, experiência, acessibilidade e desenvolvimento.

As instruções para agentes ficam em [AGENTS.md](AGENTS.md). A visão documentada orienta futuras implementações; funcionalidades devem ser desenvolvidas apenas dentro do escopo solicitado.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
