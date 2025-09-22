import React from 'react';

const PlanoAssinatura: React.FC = () => {
  return (
    <div className="card">
      <h2>Plano de Assinatura</h2>
      <p>Desbloqueie todo o potencial do Lex Pro Brasil com nosso plano profissional.</p>
      <h4>Plano Lex Pro Essencial (Gratuito com sua API Key)</h4>
      <ul>
        <li>Cadastro de Clientes (ilimitado)</li>
        <li>Cadastro de Processos (ilimitado, com upload de arquivos por sessão)</li>
        <li>Agenda e Prazos (Básica)</li>
        <li>Calculadora de Atualização Monetária</li>
        <li>Calculadora de Prazos Processuais</li>
        <li>Gerador de Documentos (com templates básicos)</li>
        <li>Controle Financeiro Básico</li>
        <li>Perfil do Usuário</li>
        <li>Funcionalidades de IA (requer sua chave API do Google Gemini configurada na seção "Configurar Chaves de IA" ou via variável de ambiente)
          <ul>
            <li>Pesquisa de Jurisprudência Unificada com Resumo por IA <span className="badge badge-ia">IA</span></li>
            <li>Análise de Petições com IA <span className="badge badge-ia">IA</span></li>
            <li>Análise de Processos com IA (para preenchimento automático) <span className="badge badge-ia">IA</span></li>
          </ul>
        </li>
      </ul>
      <h4>Plano Lex Pro Avançado <span className="badge badge-pro">PRO</span> <em>(Modelo Futuro)</em></h4>
      <ul>
        <li><strong>Todos os recursos do Essencial, mais:</strong></li>
        <li>Acesso a funcionalidades de IA sem necessidade de API Key própria (uso justo aplicado) <em>(Futuro)</em></li>
        <li>Agenda e Prazos com Cálculo Automático e Alertas Avançados <em>(Futuro)</em></li>
        <li>Integração (simulada) com Tribunais para Movimentações <em>(Futuro)</em></li>
        <li>Calculadoras Jurídicas Adicionais (Trabalhista, Custas) <em>(Futuro)</em></li>
        <li>Templates de Documentos Avançados e Personalizáveis <em>(Futuro)</em></li>
        <li>Relatórios Financeiros Detalhados <em>(Futuro)</em></li>
        <li>Configurações de Notificações Avançadas <em>(Futuro)</em></li>
        <li>Suporte Prioritário</li>
      </ul>
      <p><em>(Esta seção ainda é descritiva e serve como uma visão do modelo de negócios.)</em></p>
    </div>
  );
};

export default PlanoAssinatura;