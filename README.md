# Lex Pro Brasil

## Descrição

Lex Pro Brasil é uma aplicação jurídica abrangente desenvolvida para auxiliar advogados e profissionais do direito no gerenciamento de processos, clientes, finanças e pesquisa jurídica. A aplicação oferece funcionalidades integradas com Inteligência Artificial e APIs públicas para proporcionar uma experiência eficiente e produtiva.

## Estrutura do Projeto

```
lex-pro-brasil/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── processos/
│   │   ├── clientes/
│   │   ├── agenda/
│   │   ├── jurisprudencia/
│   │   ├── legislacao/
│   │   ├── calculadoras/
│   │   ├── documentos/
│   │   ├── financeiro/
│   │   └── configuracoes/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── context/
├── LexProMobile/
│   ├── app/
│   │   ├── screens/
│   │   └── services/
│   └── App.tsx
├── public/
└── docs/
```

## Funcionalidades

### Web Application

1. **Gestão de Processos e Casos**
   - Painel de controle com métricas importantes
   - Cadastro de processos com funcionalidade de IA
   - Agenda e prazos processuais
   - Gestão de clientes (CRM)

2. **Pesquisa e Inteligência Jurídica**
   - Jurisprudência unificada (integração com API Datajud CNJ)
   - Análise de petições com IA
   - Legislação compilada (links para fontes oficiais)

3. **Ferramentas e Produtividade**
   - Calculadoras jurídicas (monetária e prazos)
   - Gerador de documentos (procurações, contratos)
   - Controle financeiro (honorários e despesas)

4. **Configurações e Segurança**
   - Perfil do usuário
   - Configuração de chaves de IA
   - Notificações
   - Segurança de dados
   - Planos de assinatura

### Mobile Application

1. **Gestão de Clientes**
   - Cadastro e gerenciamento de clientes
   - Armazenamento local com AsyncStorage

2. **Gestão de Processos**
   - Cadastro de processos
   - Visualização de detalhes

3. **Agenda e Prazos**
   - Cadastro de eventos e prazos
   - Categorização por tipo

4. **Configurações**
   - Gerenciamento de chaves de API

## Tecnologias Utilizadas

### Frontend Web
- React
- TypeScript
- Material-UI
- Vite (build tool)

### Frontend Mobile
- React Native
- React Navigation
- AsyncStorage

### Inteligência Artificial
- Google Gemini API

### APIs Externas
- Datajud (CNJ) para jurisprudência

### Armazenamento
- LocalStorage (web)
- AsyncStorage (mobile)

## Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos de Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/lex-pro-brasil.git
cd lex-pro-brasil
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na raiz do projeto
echo "GEMINI_API_KEY=sua_chave_api_aqui" > .env
```

4. Inicie a aplicação web:
```bash
npm run dev
```

5. Para a aplicação mobile, navegue até o diretório:
```bash
cd LexProMobile
npm install
npm start
```

## Uso

### Web Application
Acesse `http://localhost:3000` no seu navegador após iniciar a aplicação.

### Mobile Application
Use o Expo Go app no seu dispositivo móvel para escanear o QR code gerado após o comando `npm start`.

## Estrutura de Componentes

### Componentes Web
- `src/App.tsx` - Componente principal da aplicação
- `src/components/dashboard/Dashboard.tsx` - Painel de controle
- `src/components/processos/Processos.tsx` - Gestão de processos
- `src/components/clientes/Clientes.tsx` - Gestão de clientes
- `src/components/agenda/Agenda.tsx` - Agenda e prazos
- `src/components/jurisprudencia/Jurisprudencia.tsx` - Pesquisa de jurisprudência
- `src/components/legislacao/Legislacao.tsx` - Base de legislação
- `src/components/calculadoras/Calculadoras.tsx` - Calculadoras jurídicas
- `src/components/documentos/Documentos.tsx` - Gerador de documentos
- `src/components/financeiro/Financeiro.tsx` - Controle financeiro
- `src/components/configuracoes/` - Componentes de configuração

### Serviços
- `src/services/apiKeyService.ts` - Gerenciamento de chaves de API
- `src/services/dataService.ts` - Operações com localStorage
- `src/services/notificationService.ts` - Serviço de notificações

### Utilitários
- `src/utils/formatters.ts` - Funções de formatação
- `src/utils/validators.ts` - Funções de validação

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## Contato

Seu Nome - seu.email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/lex-pro-brasil](https://github.com/seu-usuario/lex-pro-brasil)