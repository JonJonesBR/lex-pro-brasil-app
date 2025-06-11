Lex Pro Brasil: Assistente Jurídico Inteligente

Lex Pro Brasil é uma aplicação web moderna e integrada, projetada para otimizar a rotina de advogados e profissionais do direito. Unindo ferramentas de gestão, produtividade e inteligência artificial, a plataforma centraliza o controle de processos, clientes e finanças, permitindo uma advocacia mais eficiente e estratégica.

🎯 Sobre o Projeto

O objetivo do Lex Pro Brasil é ser o braço direito digital do advogado brasileiro. Em um cenário jurídico cada vez mais competitivo, a eficiência na gestão e o acesso rápido à informação são cruciais. Nossa plataforma foi desenvolvida para solucionar esses desafios, oferecendo desde um CRM jurídico completo até ferramentas avançadas de análise de documentos com Inteligência Artificial, tudo em uma interface intuitiva e segura.

✨ Funcionalidades Principais

O Lex Pro Brasil está repleto de funcionalidades pensadas para o dia a dia da advocacia:

🏛️ Gestão de Processos e Casos:

Painel de Controle (Dashboard): Visão geral com processos ativos, próximos prazos e resumo financeiro.

Cadastro Inteligente de Processos: Adicione processos manualmente ou utilize a IA do Google Gemini para extrair dados automaticamente de textos e preencher o formulário.

Agenda e Prazos: Controle total sobre audiências, prazos processuais e reuniões.

🧠 Pesquisa e Inteligência Jurídica:

Jurisprudência Unificada: Pesquise em um banco de dados local ou diretamente na API pública do Datajud (CNJ) para o TJSP.

Análise de Petições com IA: Cole o texto de suas petições e receba uma análise detalhada sobre pontos fortes, frágeis e sugestões de melhoria.

Legislação Compilada: Acesso rápido aos principais códigos e leis do Brasil, com links para fontes oficiais.

🛠️ Ferramentas e Produtividade:

Calculadoras Jurídicas: Realize cálculos de atualização monetária e contagem de prazos processuais (dias úteis e corridos).

Gerador de Documentos: Crie procurações e contratos de honorários personalizados a partir de templates, preenchidos com os dados dos seus clientes e do seu perfil.

Controle Financeiro: Gerencie honorários e despesas do escritório de forma simples e organizada.

👥 Gestão de Clientes (CRM):

Cadastro completo de clientes com busca e edição fáceis.

Integração com outros módulos para uma visão 360º do cliente.

⚙️ Configurações e Perfil:

Perfil do Usuário: Salve suas informações profissionais (Nome, OAB, etc.) para uso em todo o sistema.

Configuração de API: Insira sua própria chave da API do Google Gemini para habilitar as funcionalidades de IA.

🚀 Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

Frontend: React

Linguagem: TypeScript

Build Tool: Vite

Estilização: Material-UI (MUI)

Inteligência Artificial: Google Gemini API

Notificações: React Toastify

🏁 Começando

Para executar uma cópia local do projeto, siga estes passos simples.

Pré-requisitos

Você precisará ter o Node.js e o npm (ou yarn) instalados em sua máquina.

npm

npm install npm@latest -g

Instalação

Obtenha uma Chave de API gratuita do Google Gemini em https://ai.google.dev/

Clone o repositório

git clone [https://github.com/USUARIO/lex-pro-brasil.git](https://github.com/USUARIO/lex-pro-brasil.git)

Navegue até o diretório do projeto

cd lex-pro-brasil

Instale as dependências do NPM

npm install

Crie um arquivo .env na raiz do projeto e adicione sua Chave de API:

GEMINI_API_KEY='SUA_CHAVE_DE_API_AQUI'

Obs: O nome desta variável pode precisar ser ajustado conforme a configuração do seu vite.config.ts.

Execução

Após a instalação, inicie o servidor de desenvolvimento:

npm run dev

Abra http://localhost:5173 (ou a porta indicada no seu terminal) no seu navegador para ver a aplicação em funcionamento.

roadmap Roteiro de Desenvolvimento

Veja os issues abertos para uma lista completa das funcionalidades propostas (e problemas conhecidos).

[ ] Fase 1: MVP (Produto Mínimo Viável) - Concluído

[x] Módulos de Gestão (Processos, Clientes, Agenda) com armazenamento local.

[x] Ferramentas essenciais (Calculadoras, Gerador de Documentos).

[x] Integração básica com API do Gemini via chave do usuário.

[ ] Fase 2: Expansão de Funcionalidades

[ ] Implementação de um backend para armazenamento persistente e seguro.

[ ] Sistema de autenticação de usuários.

[ ] Calculadoras jurídicas adicionais (Trabalhista, Custas).

[ ] Fase 3: Inteligência e Integrações

[ ] Integração real com APIs de tribunais para busca de movimentações.

[ ] Aprimoramento dos modelos de IA para análises mais profundas.

📜 Licença

Distribuído sob a Licença MIT. Veja LICENSE.txt para mais informações.
