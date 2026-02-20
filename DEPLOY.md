# 🚀 Deploy no Vercel com Neon Database

## Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Conta no [Neon](https://neon.tech) (PostgreSQL)
- Node.js 18+ instalado

## 📝 Passo a Passo

### 1. Configurar Banco de Dados Neon

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Sua string de conexão está configurada em: `.env.local`
3. Execute a migração localmente:

```bash
npm run db:migrate
```

Isso irá:
- ✅ Criar todas as tabelas em português
- ✅ Inserir dados de exemplo
- ✅ Validar a conexão

### 2. Deploy no Vercel

#### Opção A: Via GitHub (Recomendado)

1. Faça push do código para o GitHub:
```bash
git add .
git commit -m "feat: Configuração completa com Neon DB"
git push origin main
```

2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe o repositório do GitHub
5. Configure a variável de ambiente:
   - Nome: `DATABASE_URL`
   - Valor: Sua connection string do Neon

6. Clique em "Deploy"

#### Opção B: Via CLI do Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variável de ambiente
vercel env add DATABASE_URL
# Cole sua connection string quando solicitado

# Deploy em produção
vercel --prod
```

### 3. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - `DATABASE_URL`: Sua connection string do Neon
3. Aplique para **Production**, **Preview** e **Development**

### 4. Testar o Deploy

Acesse `https://seu-projeto.vercel.app` e verifique:
- ✅ Aplicação carrega corretamente
- ✅ Mídias são exibidas (/api/midias)
- ✅ Links curtos funcionam
- ✅ Analytics está visível

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento local
npm run dev

# Migração do banco de dados
npm run db:migrate

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📊 Estrutura do Banco de Dados

### Tabelas

- **midias** - Armazena mídias (vídeos, imagens, widgets)
- **agendamentos** - Configurações de dayparting
- **horarios_exibicao** - Horários específicos de exibição
- **links_compartilhamento** - Links curtos gerados
- **estatisticas_reproducao** - Dados para analytics

Todas as tabelas estão em **português** conforme solicitado.

## 🐛 Troubleshooting

### Erro: "relation does not exist"
Execute a migração:
```bash
npm run db:migrate
```

### Erro: "DATABASE_URL not defined"
Verifique se a variável está configurada no Vercel:
```bash
vercel env ls
```

### APIs não funcionam no Vercel
Verifique:
1. Pasta `api/` está na raiz do projeto
2. `vercel.json` está configurado
3. DATABASE_URL está nas environment variables

## 📱 Funcionalidades

- ✅ **Analytics Dashboard** - Gráficos e estatísticas
- ✅ **Agendamento Avançado** - Dayparting por dia/horário
- ✅ **Links Curtos** - IDs de 6 caracteres para TVs
- ✅ **Banco de Dados PostgreSQL** - Persistência em produção
- ✅ **API Serverless** - Escalável e performático

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Neon](https://neon.tech/docs)
- [API Routes no Vercel](https://vercel.com/docs/functions/serverless-functions)

---

**Desenvolvido com ❤️ para Digital Signage**
