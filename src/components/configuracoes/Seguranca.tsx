import React from 'react';

const Seguranca: React.FC = () => {
  return (
    <div className="card">
      <h2>Segurança</h2>
      <p>Sua tranquilidade e a proteção dos seus dados são nossa prioridade.</p>
      <h4>Medidas de Segurança:</h4>
      <ul>
        <li><strong>Armazenamento Local:</strong> Todos os seus dados (processos, clientes, finanças, perfil, configurações) são armazenados exclusivamente no seu navegador (localStorage). Eles não são enviados ou armazenados em nossos servidores.</li>
        <li><strong>Controle do Usuário:</strong> Você tem controle total sobre seus dados. Limpar o cache do navegador removerá todos os dados armazenados pelo Lex Pro Brasil.</li>
        <li>
          <strong>Chave de API (Gemini):</strong> Você pode fornecer sua chave API do Google Gemini através da seção "Configurar Chaves de IA" ou, como alternativa, via variável de ambiente (`GEMINI_API_KEY` no arquivo `.env.local`).
          A chave é usada para comunicação direta entre o seu navegador e o provedor da API e é armazenada no `localStorage` do seu navegador se configurada pela interface. Ela não é armazenada em nossos servidores.
        </li>
        <li><strong>Conformidade com a LGPD (Conceitual):</strong> O design prioriza a privacidade e o controle do usuário sobre seus dados, alinhando-se com os princípios da LGPD.</li>
        <li>Autenticação de Dois Fatores (2FA) - <em>(Planejado para futura implementação caso haja funcionalidades online)</em></li>
      </ul>
      <p><em>(Recursos como 2FA são relevantes para arquiteturas cliente-servidor e estão listados como conceitos para futuras evoluções que envolvam tal arquitetura.)</em></p>
    </div>
  );
};

export default Seguranca;