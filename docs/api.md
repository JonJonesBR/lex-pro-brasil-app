# Integração com APIs

## Visão Geral

O Lex Pro Brasil integra-se com diversas APIs externas para fornecer funcionalidades avançadas, como pesquisa de jurisprudência e inteligência artificial.

## APIs Integradas

### Google Gemini API

#### Descrição
A Google Gemini API é utilizada para fornecer funcionalidades de inteligência artificial, como análise de documentos, resumo de ementas e preenchimento automático de formulários.

#### Configuração
1. Obtenha uma chave de API no [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Configure a chave em `Configurações > Configurar Chaves de IA`
3. A chave é armazenada localmente no navegador do usuário

#### Endpoints Utilizados
- `generateContent`: Para geração e análise de conteúdo
- `models`: Para interação com modelos específicos

#### Modelos Utilizados
- `gemini-2.5-flash-preview-04-17`: Modelo utilizado para análise rápida

### Datajud API (CNJ)

#### Descrição
A API pública do Datajud, mantida pelo Conselho Nacional de Justiça (CNJ), é utilizada para pesquisa de jurisprudência de tribunais brasileiros.

#### Configuração
A API é acessada através de um proxy configurado no Vite para evitar problemas de CORS.

#### Endpoints Utilizados
- `/_search`: Endpoint para pesquisa de documentos

#### Tribunais Suportados
- Tribunais Superiores (STJ, STF, TST, STM)
- Justiça Federal (TRFs)
- Justiça Estadual (TJs)
- Justiça do Trabalho (TRTs)
- Justiça Eleitoral (TREs)
- Justiça Militar (TJMs)

## Segurança

### Armazenamento de Chaves
- Chaves de API são armazenadas localmente no navegador do usuário
- Nenhuma chave é enviada ou armazenada em servidores do Lex Pro Brasil
- O usuário tem controle total sobre suas chaves

### Comunicação
- Comunicação direta entre o navegador do usuário e os serviços de API
- Uso de HTTPS para todas as comunicações

## Tratamento de Erros

### Erros de API
- Erros de comunicação são tratados e exibidos ao usuário
- Fallback para dados locais quando APIs estão indisponíveis
- Logs de erro enviados ao console do navegador para depuração

### Limites de Uso
- Respeito aos limites de uso das APIs
- Implementação de mecanismos de retry quando apropriado
- Notificação ao usuário sobre limites de uso

## Exemplos de Uso

### Google Gemini API
```typescript
// Exemplo de chamada à API do Gemini
const response = await aiClient.models.generateContent({
  model: 'gemini-2.5-flash-preview-04-17',
  contents: prompt,
  config: { responseMimeType: "application/json" }
});
```

### Datajud API
```typescript
// Exemplo de chamada à API do Datajud
const response = await fetch('/api_publica_tjsp/_search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'APIKey sua-chave-aqui',
  },
  body: JSON.stringify(queryBody),
});
```

## Boas Práticas

1. **Tratamento de Erros**: Sempre tratar erros de API de forma apropriada
2. **Fallback**: Implementar fallback para dados locais quando APIs falham
3. **Performance**: Otimizar chamadas para minimizar o uso de recursos
4. **Privacidade**: Nunca armazenar dados sensíveis do usuário
5. **Transparência**: Informar claramente ao usuário quando APIs externas são utilizadas