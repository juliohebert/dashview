<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f563652d-6f0d-4d61-8887-59b1bf4ac944

<!-- Deploy timestamp: 2026-02-20 - Forced deployment with ShareModal fixes and video duration detection -->

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
## Testar Links Compartilhados Localmente

Para testar a funcionalidade de links compartilhados em desenvolvimento, você precisa usar o Vercel CLI:

```bash
# Instalar Vercel CLI globalmente (uma vez)
npm i -g vercel

# Rodar com Vercel Dev (simula ambiente de produção)
vercel dev
```

**Diferença:**
- `npm run dev` - Apenas frontend (links compartilhados NÃO funcionam)
- `vercel dev` - Frontend + API serverless (links compartilhados funcionam)