# Instruções de Deploy - PayGateway

## Status do Projeto
✅ **Aplicação funcionando corretamente**
- Backend rodando na porta 5000
- API REST totalmente funcional
- Frontend servindo corretamente
- Build de produção gerando arquivos corretos

## Scripts Disponíveis

### Desenvolvimento
```bash
npx tsx server/index.ts
```

### Produção
```bash
npm run build
node dist/index.js
```

### Script Universal (recomendado)
```bash
node start.js
```

## Para Deploy no Replit

1. **Build da aplicação:**
   ```bash
   npm run build
   ```

2. **Teste local:**
   ```bash
   NODE_ENV=production node dist/index.js
   ```

3. **Deploy:**
   - Use o comando `node start.js` como entrada principal
   - O script detecta automaticamente se deve usar modo produção ou desenvolvimento
   - Porta configurada via variável PORT (default: 5000)

## Verificação de Funcionamento

✅ **Testes realizados:**
- Criação de usuários via API: ✅
- Criação de merchants: ✅
- Processamento de pagamentos: ✅
- Frontend acessível: ✅
- Build de produção: ✅

## URLs de Teste
- Frontend: http://localhost:5000/
- API Base: http://localhost:5000/api/
- Transações: http://localhost:5000/api/transactions
- Merchants: http://localhost:5000/api/merchants

## Configuração de Deploy
O projeto está configurado para funcionar em qualquer ambiente que suporte Node.js 20+.

### Variáveis de Ambiente
- `PORT`: Porta do servidor (default: 5000)
- `NODE_ENV`: production | development