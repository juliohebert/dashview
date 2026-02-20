# 🏗️ Arquitetura DashView

## 📦 Versão Atual (Desenvolvimento Local)

### Storage: **localStorage**

Por enquanto, o sistema usa `localStorage` do browser como camada de persistência:

- ✅ **Vantagens:**
  - Funciona 100% offline
  - Sem necessidade de backend
  - Desenvolvimento rápido e simples
  - Não expõe credenciais do banco

- ⚠️ **Limitações:**
  - Dados salvos apenas no navegador local
  - Limite de ~10MB por domínio
  - Não compartilha dados entre dispositivos

### Estrutura de Arquivos

```
lib/
  api.ts          ← Camada de serviços (usa localStorage)
  db.ts           ← Configuração Neon (não usado por enquanto)

database/
  schema.sql      ← Schema PostgreSQL (para deploy futuro)

scripts/
  migrate.ts      ← Script de migração (para deploy futuro)
```

---

## 🚀 Próximos Passos: Deploy Vercel + Neon

Quando você fizer deploy na Vercel, vamos migrar para Neon PostgreSQL.

### Opções de Arquitetura:

#### **Opção 1: Vercel Edge Functions + Neon** (Recomendada)

Criar rotas serverless em `/api` que acessam o banco:

```
api/
  midias/
    index.ts        ← GET /api/midias (buscar todas)
    create.ts       ← POST /api/midias (criar nova)
    [id].ts         ← PUT/DELETE /api/midias/[id]
  
  links/
    index.ts        ← POST /api/links (criar link)
    [codigo].ts     ← GET /api/links/[codigo]
```

**Vantagens:**
- ✅ Credenciais do banco seguras no servidor
- ✅ Funciona em qualquer dispositivo
- ✅ Dados persistentes e compartilhados

#### **Opção 2: Neon com HTTP API**

Usar a API HTTP do Neon diretamente do frontend:

**Vantagens:**
- ✅ Mais simples (sem backend)
- ✅ Menor latência

**Desvantagens:**
- ⚠️ Precisa configurar CORS no Neon
- ⚠️ Expõe URL de conexão no código cliente

---

## 📝 Checklist para Deploy

### 1. Preparar Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 2. Configurar Variáveis de Ambiente

No dashboard da Vercel, adicionar:

```env
VITE_DATABASE_URL=postgresql://neondb_owner:npg_4rh7RekGmynf@ep-little-sky-acqqwrj7-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Criar Edge Functions (se escolher Opção 1)

Mover lógica de `lib/api.ts` para rotas `/api/*.ts`

### 4. Executar Migração

```bash
npm run migrate
```

Isso criará as tabelas no Neon com os 3 exemplos.

### 5. Atualizar `lib/api.ts`

Trocar localStorage por chamadas `fetch()` para as rotas `/api/*`

---

## 🔄 Migração de Dados

### Exportar dados do localStorage para Neon:

```javascript
// No console do browser
const midias = JSON.parse(localStorage.getItem('dashview_midias') || '[]');
console.log(JSON.stringify(midias, null, 2));
```

Copiar JSON e importar via script ou interface do Neon.

---

## 📊 Comparação de Opções

| Aspecto | localStorage (Atual) | Vercel Edge + Neon | Direct Neon HTTP |
|---------|---------------------|--------------------|--------------------|
| **Persistência** | ❌ Apenas local | ✅ Global | ✅ Global |
| **Segurança** | ✅ Sem exposição | ✅ Backdoor seguro | ⚠️ URL exposta |
| **Complexidade** | ✅ Simples | ⚠️ Requer backend | ✅ Simples |
| **Latência** | ✅ Instantânea | ⚠️ +50-200ms | ⚠️ +100-300ms |
| **Offline** | ✅ Funciona | ❌ Requer internet | ❌ Requer internet |

---

## 🎯 Recomendação Final

1. **Agora**: Continue usando localStorage para desenvolvimento local
2. **Deploy**: Migre para Vercel Edge Functions + Neon
3. **Futuro**: Considere adicionar cache com React Query para melhor UX

Quer que eu prepare as Edge Functions para o deploy? 🚀
