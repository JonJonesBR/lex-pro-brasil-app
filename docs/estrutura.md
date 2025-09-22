# Documentação da Estrutura do Projeto

## Visão Geral

O Lex Pro Brasil segue uma arquitetura modular para facilitar a manutenção e escalabilidade. A aplicação é dividida em duas partes principais: a aplicação web e a aplicação mobile.

## Estrutura de Diretórios

```
lex-pro-brasil/
├── src/                    # Código-fonte da aplicação web
│   ├── components/         # Componentes React organizados por funcionalidade
│   ├── services/           # Serviços para lógica de negócios e integrações
│   ├── hooks/              # Hooks personalizados
│   ├── utils/              # Funções utilitárias
│   ├── types/              # Definições de tipos TypeScript
│   └── context/            # Contextos React para gerenciamento de estado
├── LexProMobile/           # Código-fonte da aplicação mobile
│   ├── app/                # Telas e serviços da aplicação mobile
│   └── App.tsx             # Componente principal da aplicação mobile
├── public/                 # Arquivos públicos
└── docs/                   # Documentação do projeto
```

## Componentes Web

### Dashboard
- Localização: `src/components/dashboard/`
- Responsável por exibir métricas e informações resumidas

### Processos
- Localização: `src/components/processos/`
- Gerencia o cadastro e visualização de processos judiciais

### Clientes
- Localização: `src/components/clientes/`
- Gerencia o cadastro e visualização de clientes

### Agenda
- Localização: `src/components/agenda/`
- Gerencia eventos, prazos e compromissos

### Jurisprudência
- Localização: `src/components/jurisprudencia/`
- Integração com API Datajud para pesquisa de jurisprudência

### Legislação
- Localização: `src/components/legislacao/`
- Base de dados de legislação brasileira

### Calculadoras
- Localização: `src/components/calculadoras/`
- Calculadoras jurídicas (monetária, prazos, etc.)

### Documentos
- Localização: `src/components/documentos/`
- Gerador de documentos jurídicos

### Financeiro
- Localização: `src/components/financeiro/`
- Controle de honorários e despesas

### Configurações
- Localização: `src/components/configuracoes/`
- Configurações do usuário e do sistema

## Serviços

### ApiKeyService
- Localização: `src/services/apiKeyService.ts`
- Gerencia chaves de API de forma segura

### DataService
- Localização: `src/services/dataService.ts`
- Manipula operações com localStorage

### NotificationService
- Localização: `src/services/notificationService.ts`
- Gerencia notificações da aplicação

## Utilitários

### Formatters
- Localização: `src/utils/formatters.ts`
- Funções para formatação de dados (moeda, datas, etc.)

### Validators
- Localização: `src/utils/validators.ts`
- Funções para validação de dados (CPF, CNPJ, email, etc.)

## Mobile

A aplicação mobile segue uma estrutura semelhante, mas adaptada para React Native:

- `LexProMobile/app/screens/` - Telas da aplicação
- `LexProMobile/app/services/` - Serviços específicos da aplicação mobile

## Padrões de Codificação

1. **Componentização**: Cada funcionalidade é implementada como um componente React independente
2. **Tipagem**: Uso extensivo de TypeScript para garantir tipagem estática
3. **Separação de Responsabilidades**: Lógica de negócios separada dos componentes de UI
4. **Reutilização**: Componentes e funções utilitárias são projetados para serem reutilizáveis
5. **Testabilidade**: Código escrito com testes unitários em mente

## Fluxo de Dados

1. **Entrada**: Dados inseridos pelo usuário através dos componentes
2. **Validação**: Dados validados por funções utilitárias
3. **Processamento**: Lógica de negócios executada nos serviços
4. **Armazenamento**: Dados persistidos usando serviços de armazenamento
5. **Exibição**: Dados exibidos através dos componentes React