# Aplicação Mobile

## Visão Geral

A aplicação mobile do Lex Pro Brasil foi desenvolvida com React Native para fornecer funcionalidades essenciais em dispositivos móveis. A aplicação permite gerenciar clientes, processos e agenda diretamente do smartphone ou tablet.

## Estrutura

```
LexProMobile/
├── app/
│   ├── screens/           # Telas da aplicação
│   │   ├── ClientesScreen.tsx
│   │   ├── ProcessosScreen.tsx
│   │   ├── AgendaScreen.tsx
│   │   └── ConfigScreen.tsx
│   └── services/          # Serviços específicos da aplicação mobile
│       └── GeminiService.ts
├── App.tsx                # Componente principal
└── app.json              # Configurações da aplicação
```

## Telas

### ClientesScreen
- Gerenciamento completo de clientes
- Cadastro, edição e exclusão
- Armazenamento local com AsyncStorage

### ProcessosScreen
- Cadastro de processos judiciais
- Visualização de detalhes dos processos
- Armazenamento local com AsyncStorage

### AgendaScreen
- Gestão de eventos e prazos
- Categorização por tipo (prazo, audiência, reunião, etc.)
- Armazenamento local com AsyncStorage

### ConfigScreen
- Configuração de chaves de API
- Gerenciamento de integrações com IA

## Tecnologias

### React Native
- Framework principal para desenvolvimento mobile
- Componentes nativos para melhor experiência do usuário

### React Navigation
- Navegação entre telas
- Bottom tab navigator para navegação principal

### AsyncStorage
- Armazenamento local de dados
- Persistência de informações entre sessões

### Expo
- Plataforma para desenvolvimento e testes
- Facilita a distribuição e testes em dispositivos reais

## Funcionalidades

### Offline First
- Todas as funcionalidades funcionam sem conexão à internet
- Dados sincronizados automaticamente quando há conexão

### Armazenamento Local
- Dados armazenados localmente no dispositivo
- Nenhuma informação é enviada para servidores externos

### Interface Intuitiva
- Design otimizado para dispositivos móveis
- Navegação simples e direta

## Integração com IA

### Google Gemini
- Configuração de chave de API através da tela de configurações
- Funcionalidades de IA disponíveis quando chave é configurada

## Desenvolvimento

### Pré-requisitos
- Node.js
- Expo CLI
- Dispositivo móvel ou emulador

### Instalação
```bash
cd LexProMobile
npm install
```

### Execução
```bash
npm start
```

### Teste em Dispositivo
1. Instale o aplicativo Expo Go no seu dispositivo móvel
2. Escaneie o QR code gerado pelo comando `npm start`

## Publicação

### App Store (iOS)
- Siga as diretrizes da Apple para publicação
- Certifique-se de que todos os requisitos estão atendidos

### Google Play (Android)
- Siga as diretrizes do Google Play para publicação
- Prepare os recursos necessários (ícones, screenshots, etc.)

## Limitações Conhecidas

1. **Funcionalidades Limitadas**: A versão mobile possui funcionalidades mais limitadas comparada à versão web
2. **Sem Sincronização**: Não há sincronização automática entre versão web e mobile
3. **Armazenamento Local**: Todos os dados são armazenados localmente no dispositivo

## Próximos Passos

1. **Sincronização**: Implementar sincronização entre versão web e mobile
2. **Mais Funcionalidades**: Adicionar mais telas e funcionalidades
3. **Melhorias de UI/UX**: Aprimorar a interface e experiência do usuário
4. **Notificações**: Implementar notificações push para eventos importantes