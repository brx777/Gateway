# Gateway de Pagamento - PayGateway

## Visão Geral
Um gateway de pagamento completo e responsivo construído com Node.js, Express, React e TypeScript. O sistema permite processar pagamentos com cartão de crédito, débito, PIX e boleto, gerenciar usuários, métodos de pagamento, transações e merchants com integração via API.

## Arquitetura do Projeto

### Backend
- **Express.js** com TypeScript para API REST
- **Storage em memória** para persistência de dados
- **Validação** com Zod e Drizzle-ORM schemas
- **Processamento simulado** de pagamentos com taxas de sucesso variáveis

### Frontend
- **React** com TypeScript
- **Wouter** para roteamento
- **TanStack Query** para gerenciamento de estado
- **Shadcn/UI** com Tailwind CSS para interface responsiva
- **React Hook Form** com validação Zod

### Estrutura de Dados
- **Usuários**: ID, username, email, senha, nome completo
- **Métodos de Pagamento**: Cartões (mascarados por segurança), PIX, boleto
- **Transações**: Valores, status, referências, respostas do gateway
- **Merchants**: Chaves API, webhooks, informações de contato

## Funcionalidades Principais

### ✓ Dashboard Analítico
- Métricas de receita, transações e taxa de sucesso
- Gráficos e estatísticas em tempo real
- Visão geral de transações recentes

### ✓ Gerenciamento de Pagamentos
- Criação de usuários e métodos de pagamento
- Processamento de transações
- Histórico completo de pagamentos
- Status em tempo real (pending, processing, completed, failed)

### ✓ Sistema de Merchants
- Criação e gerenciamento de merchants
- Geração automática de API keys
- Configuração de webhooks
- Documentação da API integrada

### ✓ Interface Responsiva
- Design moderno com modo escuro/claro
- Totalmente responsivo para todos os dispositivos
- Componentes acessíveis e bem estruturados

### ✓ API Gateway Externa
- Endpoint `/api/gateway/process-payment` para integração
- Autenticação via API keys
- Simulação realista de processamento
- Respostas padronizadas

## Rotas Principais

### Frontend
- `/` - Página inicial com recursos e apresentação
- `/dashboard` - Dashboard principal com métricas
- `/payments` - Gerenciamento de transações e métodos
- `/merchants` - Gerenciamento de merchants e API keys

### Backend API
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Obter usuário
- `POST /api/payment-methods` - Adicionar método de pagamento
- `GET /api/users/:userId/payment-methods` - Listar métodos do usuário
- `POST /api/transactions` - Criar transação
- `GET /api/transactions` - Listar transações
- `POST /api/merchants` - Criar merchant
- `GET /api/merchants` - Listar merchants
- `POST /api/gateway/process-payment` - API externa para pagamentos

## Mudanças Recentes (21/01/2025)

### ✓ Sistema de Autenticação Implementado
- Integração completa com Replit Auth (OpenID Connect)
- Banco de dados PostgreSQL configurado e funcionando
- Sistema de sessões persistentes com pgStore
- Páginas de landing e home diferenciadas por estado de login
- Middleware de autenticação protegendo todas as rotas

### ✓ Arquitetura Atualizada
- Migração de storage em memória para banco PostgreSQL
- Schemas atualizados para suportar autenticação Replit
- Sistema de usuários baseado em claims OpenID
- Interface IStorage atualizada para operações de banco

### ✓ Frontend com Autenticação
- Hook useAuth para gerenciar estado de login
- Página Landing para usuários não autenticados
- Página Home personalizada para usuários logados
- Botões de login/logout integrados com Replit Auth
- Tratamento de erros de autorização (401/403)

### ✓ Segurança Implementada
- Proteção de rotas com middleware isAuthenticated
- Validação de propriedade de recursos (user data isolation)
- Sistema de refresh tokens automático
- Mascaramento de números de cartão mantido

### ✓ Deploy Resolvido
- Build de produção funcionando corretamente
- Script universal de inicialização (start.js)
- Servidor rodando estável na porta 5000
- Banco PostgreSQL configurado via DATABASE_URL
- Frontend servindo páginas corretas baseadas em autenticação

## Próximos Passos Sugeridos
1. **Autenticação**: Implementar sistema de login/logout
2. **Webhooks**: Sistema de notificações automáticas
3. **Relatórios**: Exportação de dados e relatórios detalhados
4. **Integração Real**: Conectar com processadores reais (Stripe, PagSeguro)
5. **Banco de Dados**: Migrar para PostgreSQL para produção

## Configuração e Execução

### Desenvolvimento
```bash
npm install
npx tsx server/index.ts
```

### Produção
```bash
npm install
npm run build
node dist/index.js
```

### Script Universal (Recomendado)
```bash
npm install
node start.js
```

### Acesso
- Aplicação: http://localhost:5000
- API: http://localhost:5000/api/

## Status de Deploy
✅ **RESOLVIDO** - Aplicação funcionando corretamente:
- API REST 100% operacional
- Frontend responsivo carregando
- Build de produção gerando arquivos corretos
- Servidor estável rodando na porta 5000

## Tecnologias Utilizadas
- **Runtime**: Node.js com TypeScript
- **Backend**: Express.js, Drizzle-ORM, Zod
- **Frontend**: React, Wouter, TanStack Query
- **UI**: Shadcn/UI, Tailwind CSS, Lucide Icons
- **Formulários**: React Hook Form
- **Validação**: Zod
- **Build**: Vite

## Estrutura de Arquivos
```
├── server/           # Backend Express
├── client/src/       # Frontend React
├── shared/           # Schemas compartilhados
├── components.json   # Configuração Shadcn
└── package.json      # Dependências
```

O gateway está totalmente funcional e pronto para demonstração ou desenvolvimento adicional.