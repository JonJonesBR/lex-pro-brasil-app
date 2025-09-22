import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleGenAI } from "@google/genai";
import { 
  GavelIcon, 
  EventNoteIcon, 
  AccountBalanceWalletIcon, 
  SpeedIcon,
  AddCircleOutlineIcon
} from '@mui/icons-material';
import { Button } from '@mui/material';
import Dashboard from './components/dashboard/Dashboard';
import Processos from './components/processos/Processos';
import Agenda from './components/agenda/Agenda';
import Clientes from './components/clientes/Clientes';
import Jurisprudencia from './components/jurisprudencia/Jurisprudencia';
import Legislacao from './components/legislacao/Legislacao';
import AnalisePeticao from './components/jurisprudencia/AnalisePeticao';
import Calculadoras from './components/calculadoras/Calculadoras';
import Documentos from './components/documentos/Documentos';
import Financeiro from './components/financeiro/Financeiro';
import Perfil from './components/configuracoes/Perfil';
import ConfigApiKeys from './components/configuracoes/ConfigApiKeys';
import Notificacoes from './components/configuracoes/Notificacoes';
import Seguranca from './components/configuracoes/Seguranca';
import PlanoAssinatura from './components/configuracoes/PlanoAssinatura';
import { initializeGeminiClient } from './services/geminiService';

// Interfaces
interface Processo {
  id: string;
  numero: string;
  comarca: string;
  vara: string;
  natureza: string;
  partes: string;
  objeto: string;
  valorCausa: string;
  status: string;
  documentos?: File[];
}

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface JurisprudenciaItem {
  id: string;
  tribunal: string;
  processo: string;
  publicacao: string;
  relator: string;
  ementa: string;
}

interface Honorario {
  id: string;
  tipo: 'honorario';
  dataLancamento: string;
  clienteId: string;
  clienteNome: string;
  referenciaProcesso: string;
  valor: number;
  status: 'Aguardando Pagamento' | 'Pago';
}

interface Despesa {
  id: string;
  tipo: 'despesa';
  dataLancamento: string;
  descricao: string;
  categoria: 'Custas Processuais' | 'Diligências' | 'Transporte' | 'Material de Escritório' | 'Outras';
  valor: number;
}

type RegistroFinanceiro = Honorario | Despesa;

interface PerfilUsuario {
  nomeCompleto: string;
  oab: string;
  ufOab: string;
  email: string;
  enderecoEscritorio: string;
}

interface EventoAgenda {
  id: string;
  data: string;
  titulo: string;
  tipo: 'Prazo Processual' | 'Audiência' | 'Reunião' | 'Outro';
  descricao: string;
}

interface NotificacoesConfig {
  emailPrazos: boolean;
  pushAudiencias: boolean;
  resumoSemanal: boolean;
}

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  
  // API Keys
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
  const [inputGeminiApiKey, setInputGeminiApiKey] = useState<string>('');
  const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);

  // Processos
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [novoProcesso, setNovoProcesso] = useState<Omit<Processo, 'id' | 'documentos'>>({
    numero: '', comarca: '', vara: '', natureza: '', partes: '', objeto: '', valorCausa: '', status: 'Ativo'
  });
  const [arquivosNovoProcesso, setArquivosNovoProcesso] = useState<File[]>([]);

  // Clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [novoCliente, setNovoCliente] = useState<Omit<Cliente, 'id'>>({
    nome: '', cpfCnpj: '', email: '', telefone: '', endereco: ''
  });
  const [editingClienteId, setEditingClienteId] = useState<string | null>(null);
  const [termoBuscaCliente, setTermoBuscaCliente] = useState<string>('');

  // Jurisprudência
  const jurisprudenciaDBDefault: JurisprudenciaItem[] = [
    { id: 'j1', tribunal: 'STJ', processo: 'REsp 1.234.567/SP', publicacao: '01/01/2023', relator: 'Ministro X', ementa: 'DIREITO CIVIL. CONTRATOS. INADIMPLEMENTO. DANO MORAL. CONFIGURADO. Atraso excessivo na entrega de imóvel adquirido na planta configura dano moral indenizável, extrapolando o mero dissabor. O consumidor tem o direito à justa reparação pelos transtornos sofridos. A construtora deve arcar com as consequências de seu descumprimento contratual, incluindo os danos extrapatrimoniais causados ao adquirente, que teve suas expectativas frustradas e sua paz de espírito abalada pela incerteza e pela demora.' },
    { id: 'j2', tribunal: 'TJSP', processo: 'Apelação Cível 100.200.30-00', publicacao: '15/02/2023', relator: 'Desembargador Y', ementa: 'DIREITO DO CONSUMIDOR. TELEFONIA. COBRANÇA INDEVIDA. REPETIÇÃO DO INDÉBITO EM DOBRO. MÁ-FÉ. A cobrança de valores indevidos por serviços não solicitados de telefonia, quando demonstrada a má-fé da operadora, enseja a repetição do indébito em dobro, nos termos do artigo 42, parágrafo único, do Código de Defesa do Consumidor. Necessidade de comprovação da ausência de engano justificável pela fornecedora para afastar a sanção.' },
    { id: 'j3', tribunal: 'STF', processo: 'RE 987.654/RJ', publicacao: '10/03/2023', relator: 'Ministra Z', ementa: 'DIREITO CONSTITUCIONAL. LIBERDADE DE EXPRESSÃO. LIMITES. DISCURSO DE ÓDIO. VEDAÇÃO. A liberdade de expressão, embora fundamental, não é absoluta e encontra limites na dignidade da pessoa humana e na vedação ao discurso de ódio. Manifestações que incitam a violência ou a discriminação não estão abarcadas pela proteção constitucional. O Estado tem o dever de proteger os grupos vulneráveis contra tais práticas.' },
    { id: 'j4', tribunal: 'TST', processo: 'RR 112233-44.2022.5.03.0001', publicacao: '05/04/2023', relator: 'Ministro A', ementa: 'DIREITO DO TRABALHO. HORAS EXTRAS. CARTÕES DE PONTO BRITÂNICOS. INVALIDADE. ÔNUS DA PROVA. A apresentação de cartões de ponto com horários de entrada e saída uniformes ("britânicos") transfere ao empregador o ônus de provar a jornada efetivamente cumprida pelo empregado, prevalecendo a jornada alegada na inicial caso o empregador não se desincumba de seu encargo probatório. Súmula 338, III, do TST.' },
    { id: 'j5', tribunal: 'TRF1', processo: 'AMS 0012345-67.2021.4.01.3400', publicacao: '20/05/2023', relator: 'Desembargador Federal B', ementa: 'DIREITO ADMINISTRATIVO. SERVIDOR PÚBLICO. REMOÇÃO. MOTIVO DE SAÚDE DE DEPENDENTE. COMPROVAÇÃO. ART. 36, III, "B" DA LEI 8.112/90. Comprovada a necessidade de remoção do servidor público para localidade diversa por motivo de saúde de dependente que conste de seu assentamento funcional, e não havendo outra forma de tratamento no local de origem, impõe-se o deferimento do pedido, nos termos da Lei nº 8.112/90. A saúde é direito fundamental e deve ser protegida.' },
  ];
  const [resultadosJuris, setResultadosJuris] = useState<JurisprudenciaItem[]>([]); 
  const [termoBuscaJuris, setTermoBuscaJuris] = useState<string>('');
  const [filtroTribunalJuris, setFiltroTribunalJuris] = useState<string>('api_publica_tjsp'); 
  const [loadingJurisSearch, setLoadingJurisSearch] = useState<boolean>(false);
  const [resumosEmentas, setResumosEmentas] = useState<Record<string, string>>({});
  const [loadingResumoId, setLoadingResumoId] = useState<string | null>(null);

  // Legislação
  const [termoBuscaLeis, setTermoBuscaLeis] = useState<string>('');

  // Gerador de Documentos
  const [tipoDocumentoGerador, setTipoDocumentoGerador] = useState<string>('');
  const [clienteSelecionadoGerador, setClienteSelecionadoGerador] = useState<string>('');
  const [documentoGeradoTexto, setDocumentoGeradoTexto] = useState<string>('');

  // Controle Financeiro
  const [registrosFinanceiros, setRegistrosFinanceiros] = useState<RegistroFinanceiro[]>([]);
  const [novoHonorarioClienteId, setNovoHonorarioClienteId] = useState<string>('');
  const [novoHonorarioReferencia, setNovoHonorarioReferencia] = useState<string>('');
  const [novoHonorarioValor, setNovoHonorarioValor] = useState<string>('');
  const [novoHonorarioStatus, setNovoHonorarioStatus] = useState<'Aguardando Pagamento' | 'Pago'>('Aguardando Pagamento');
  const [novaDespesaDescricao, setNovaDespesaDescricao] = useState<string>('');
  const [novaDespesaCategoria, setNovaDespesaCategoria] = useState<'Custas Processuais' | 'Diligências' | 'Transporte' | 'Material de Escritório' | 'Outras'>('Custas Processuais');
  const [novaDespesaValor, setNovaDespesaValor] = useState<string>('');

  // Perfil do Usuário
  const initialPerfilUsuario: PerfilUsuario = {
    nomeCompleto: '', oab: '', ufOab: '', email: '', enderecoEscritorio: ''
  };
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilUsuario>(initialPerfilUsuario);
  const [formPerfilNome, setFormPerfilNome] = useState<string>('');
  const [formPerfilOAB, setFormPerfilOAB] = useState<string>('');
  const [formPerfilUFOAB, setFormPerfilUFOAB] = useState<string>('');
  const [formPerfilEmail, setFormPerfilEmail] = useState<string>('');
  const [formPerfilEndereco, setFormPerfilEndereco] = useState<string>('');

  // Análise de Petições com IA
  const [peticaoParaAnalise, setPeticaoParaAnalise] = useState<string>('');
  const [resultadoAnalisePeticao, setResultadoAnalisePeticao] = useState<string | null>(null);
  const [loadingAnalisePeticao, setLoadingAnalisePeticao] = useState<boolean>(false);

  // Agenda e Prazos
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [formEventoData, setFormEventoData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formEventoTitulo, setFormEventoTitulo] = useState<string>('');
  const [formEventoTipo, setFormEventoTipo] = useState<EventoAgenda['tipo']>('Prazo Processual');
  const [formEventoDescricao, setFormEventoDescricao] = useState<string>('');

  // Sub-módulo de Calculadoras
  const [activeCalculator, setActiveCalculator] = useState<string>('monetaria');

  // Configurações de Notificações
  const initialNotificacoesConfig: NotificacoesConfig = {
    emailPrazos: true,
    pushAudiencias: false, 
    resumoSemanal: true,
  };
  const [configNotificacoes, setConfigNotificacoes] = useState<NotificacoesConfig>(initialNotificacoesConfig);

  // Carregar dados do localStorage ao iniciar e inicializar AI Client
  useEffect(() => {
    const storedApiKey = localStorage.getItem('lexProGeminiApiKey');
    const envApiKey = process.env.GEMINI_API_KEY;
    let activeKeyToTry: string | null = null;

    if (storedApiKey && storedApiKey.trim() !== "") {
      activeKeyToTry = storedApiKey;
      setGeminiApiKey(storedApiKey);
      setInputGeminiApiKey(storedApiKey);
      console.log("Chave API do Gemini carregada do localStorage.");
    } else if (envApiKey && envApiKey.trim() !== "") {
      activeKeyToTry = envApiKey;
      setGeminiApiKey(envApiKey);
      setInputGeminiApiKey(envApiKey);
      console.log("Chave API do Gemini carregada das variáveis de ambiente (fallback).");
    }

    if (activeKeyToTry) {
      initializeGeminiClient(activeKeyToTry).then(client => {
        if (client) {
          setAiClient(client as unknown as GoogleGenAI); // Type assertion needed due to version differences
          toast.success("Cliente Gemini AI inicializado.", { autoClose: 2000 });
        } else {
          setAiClient(null);
          setGeminiApiKey(null);
        }
      }).catch(error => {
        console.error("Erro ao inicializar GoogleGenAI:", error);
        setAiClient(null);
        setGeminiApiKey(null);
      });
    } else {
      setAiClient(null);
      setGeminiApiKey(null);
      console.warn("Nenhuma chave API do Gemini configurada (localStorage ou ambiente). Funcionalidades de IA estarão desabilitadas até a configuração.");
    }

    // Carregar outros dados...
    const storedProcessos = localStorage.getItem('lexProProcessos');
    if (storedProcessos) {
      const parsedProcessos = JSON.parse(storedProcessos) as Omit<Processo, 'documentos'>[];
      setProcessos(parsedProcessos.map(p => ({...p, documentos: []})));
    }

    const storedClientes = localStorage.getItem('lexProClientes');
    if (storedClientes) setClientes(JSON.parse(storedClientes));

    const storedRegistrosFinanceiros = localStorage.getItem('lexProRegistrosFinanceiros');
    if (storedRegistrosFinanceiros) setRegistrosFinanceiros(JSON.parse(storedRegistrosFinanceiros));

    const storedPerfilUsuario = localStorage.getItem('lexProPerfilUsuario');
    if (storedPerfilUsuario) {
      const perfil: PerfilUsuario = JSON.parse(storedPerfilUsuario);
      setPerfilUsuario(perfil);
      setFormPerfilNome(perfil.nomeCompleto);
      setFormPerfilOAB(perfil.oab);
      setFormPerfilUFOAB(perfil.ufOab);
      setFormPerfilEmail(perfil.email);
      setFormPerfilEndereco(perfil.enderecoEscritorio);
    }

    const storedEventos = localStorage.getItem('lexProEventos');
    if (storedEventos) setEventos(JSON.parse(storedEventos));

    const storedNotificacoesConfig = localStorage.getItem('lexProNotificacoesConfig');
    if (storedNotificacoesConfig) {
      setConfigNotificacoes(JSON.parse(storedNotificacoesConfig));
    }
    setResultadosJuris([]); 
  }, []);

  // Salvar Processos
  useEffect(() => {
    const processosParaSalvar = processos.map(({ documentos, ...restoDoProcesso }) => restoDoProcesso);
    localStorage.setItem('lexProProcessos', JSON.stringify(processosParaSalvar));
  }, [processos]);

  useEffect(() => { localStorage.setItem('lexProClientes', JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem('lexProRegistrosFinanceiros', JSON.stringify(registrosFinanceiros)); }, [registrosFinanceiros]);
  useEffect(() => { localStorage.setItem('lexProPerfilUsuario', JSON.stringify(perfilUsuario)); }, [perfilUsuario]);
  useEffect(() => { localStorage.setItem('lexProEventos', JSON.stringify(eventos)); }, [eventos]);

  // Salvar Configurações de Notificações
  useEffect(() => {
    localStorage.setItem('lexProNotificacoesConfig', JSON.stringify(configNotificacoes));
  }, [configNotificacoes]);

  const handleSaveApiKey = () => {
    const keyToSave = inputGeminiApiKey.trim();
    if (!keyToSave) {
      toast.error("A chave API do Gemini não pode estar vazia.");
      return;
    }
    initializeGeminiClient(keyToSave).then(client => {
      if (client) {
        localStorage.setItem('lexProGeminiApiKey', keyToSave);
        setGeminiApiKey(keyToSave);
        setAiClient(client as unknown as GoogleGenAI); // Type assertion needed
        toast.success("Chave API do Gemini salva e ativada!");
      } else {
        setAiClient(null);
        setGeminiApiKey(null);
        localStorage.removeItem('lexProGeminiApiKey');
        toast.error("Chave API inválida. Verifique a chave e tente novamente.");
      }
    }).catch(error => {
      console.error("Erro ao tentar salvar/inicializar com a nova chave API:", error);
      toast.error("Chave API inválida ou erro na inicialização. Verifique a chave e tente novamente.");
      setAiClient(null);
      setGeminiApiKey(null);
      localStorage.removeItem('lexProGeminiApiKey');
    });
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('lexProGeminiApiKey');
    setGeminiApiKey(null);
    setInputGeminiApiKey('');
    setAiClient(null);
    toast.info("Chave API do Gemini removida.");
  };

  const ensureAiClient = (): boolean => {
    if (!aiClient) {
      toast.warn(
        <div>
          Funcionalidade de IA desabilitada.
          <br />
          Configure sua chave API em:
          <br />
          <strong>Configurações e Segurança &gt; Configurar Chaves de IA</strong>
        </div>, 
        { autoClose: 8000 }
      );
      return false;
    }
    return true;
  };

  const menuItems = [
    {
      id: 'gestao',
      title: 'Gestão de Processos e Casos',
      isMainModule: true,
      subItems: [
        { id: 'dashboard', title: 'Painel de Controle' },
        { id: 'cadastroProcessos', title: 'Cadastro de Processos' },
        { id: 'agendaPrazos', title: 'Agenda e Prazos' },
        { id: 'gestaoClientes', title: 'Gestão de Clientes (CRM)' },
      ]
    },
    {
      id: 'pesquisa',
      title: 'Pesquisa e Inteligência Jurídica',
      isMainModule: true,
      subItems: [
        { id: 'jurisprudencia', title: 'Jurisprudência Unificada' },
        { id: 'legislacao', title: 'Legislação Compilada' },
        { id: 'analisePeti', title: 'Análise de Petições com IA' },
      ]
    },
    {
      id: 'ferramentas',
      title: 'Ferramentas e Produtividade',
      isMainModule: true,
      subItems: [
        { id: 'calculadoras', title: 'Calculadoras Jurídicas' },
        { id: 'geradorDocs', title: 'Gerador de Documentos' },
        { id: 'controleFinanceiro', title: 'Controle Financeiro' },
      ]
    },
    {
      id: 'configuracoes',
      title: 'Configurações e Segurança',
      isMainModule: true,
      subItems: [
        { id: 'perfilUsuario', title: 'Perfil do Usuário' },
        { id: 'configApiKeys', title: 'Configurar Chaves de IA' },
        { id: 'notificacoes', title: 'Notificações' },
        { id: 'seguranca', title: 'Segurança' },
        { id: 'planoAssinatura', title: 'Plano de Assinatura' },
      ]
    }
  ];

  const handleMenuClick = (moduleId: string, parentId: string | null = null) => {
    setActiveModule(moduleId);
    if (parentId) {
      setActiveSubMenu(parentId);
    } else {
      const mainModule = menuItems.find(item => item.id === moduleId);
      if (mainModule && mainModule.subItems && mainModule.subItems.length > 0) {
        setActiveSubMenu(mainModule.id);
        setActiveModule(mainModule.subItems[0].id);
      } else {
        setActiveSubMenu(null);
      }
    }
    if (moduleId === 'calculadoras' && parentId === 'ferramentas') {
      setActiveCalculator('monetaria');
    }
  };

  useEffect(() => {
    if (menuItems.length > 0 && menuItems[0].subItems && menuItems[0].subItems.length > 0) {
      setActiveSubMenu(menuItems[0].id);
      setActiveModule(menuItems[0].subItems[0].id);
    }
  }, []);

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <Dashboard 
            processos={processos}
            registrosFinanceiros={registrosFinanceiros}
            eventos={eventos}
            handleMenuClick={handleMenuClick}
          />
        );
      case 'cadastroProcessos':
        return (
          <Processos 
            processos={processos}
            setProcessos={setProcessos}
            novoProcesso={novoProcesso}
            setNovoProcesso={setNovoProcesso}
            arquivosNovoProcesso={arquivosNovoProcesso}
            setArquivosNovoProcesso={setArquivosNovoProcesso}
            aiClient={aiClient}
            ensureAiClient={ensureAiClient}
          />
        );
      case 'agendaPrazos':
        return (
          <Agenda 
            eventos={eventos}
            setEventos={setEventos}
            formEventoData={formEventoData}
            setFormEventoData={setFormEventoData}
            formEventoTitulo={formEventoTitulo}
            setFormEventoTitulo={setFormEventoTitulo}
            formEventoTipo={formEventoTipo}
            setFormEventoTipo={setFormEventoTipo}
            formEventoDescricao={formEventoDescricao}
            setFormEventoDescricao={setFormEventoDescricao}
          />
        );
      case 'gestaoClientes':
        return (
          <Clientes 
            clientes={clientes}
            setClientes={setClientes}
            novoCliente={novoCliente}
            setNovoCliente={setNovoCliente}
            editingClienteId={editingClienteId}
            setEditingClienteId={setEditingClienteId}
            termoBuscaCliente={termoBuscaCliente}
            setTermoBuscaCliente={setTermoBuscaCliente}
          />
        );
      case 'jurisprudencia':
        return (
          <Jurisprudencia 
            resultadosJuris={resultadosJuris}
            setResultadosJuris={setResultadosJuris}
            termoBuscaJuris={termoBuscaJuris}
            setTermoBuscaJuris={setTermoBuscaJuris}
            filtroTribunalJuris={filtroTribunalJuris}
            setFiltroTribunalJuris={setFiltroTribunalJuris}
            loadingJurisSearch={loadingJurisSearch}
            setLoadingJurisSearch={setLoadingJurisSearch}
            resumosEmentas={resumosEmentas}
            setResumosEmentas={setResumosEmentas}
            loadingResumoId={loadingResumoId}
            setLoadingResumoId={setLoadingResumoId}
            aiClient={aiClient}
            ensureAiClient={ensureAiClient}
            jurisprudenciaDBDefault={jurisprudenciaDBDefault}
          />
        );
      case 'legislacao':
        return (
          <Legislacao 
            termoBuscaLeis={termoBuscaLeis}
            setTermoBuscaLeis={setTermoBuscaLeis}
          />
        );
      case 'analisePeti':
        return (
          <AnalisePeticao 
            peticaoParaAnalise={peticaoParaAnalise}
            setPeticaoParaAnalise={setPeticaoParaAnalise}
            resultadoAnalisePeticao={resultadoAnalisePeticao}
            setResultadoAnalisePeticao={setResultadoAnalisePeticao}
            loadingAnalisePeticao={loadingAnalisePeticao}
            setLoadingAnalisePeticao={setLoadingAnalisePeticao}
            aiClient={aiClient}
            ensureAiClient={ensureAiClient}
          />
        );
      case 'calculadoras':
        return (
          <Calculadoras 
            activeCalculator={activeCalculator}
            setActiveCalculator={setActiveCalculator}
          />
        );
      case 'geradorDocs':
        return (
          <Documentos 
            tipoDocumentoGerador={tipoDocumentoGerador}
            setTipoDocumentoGerador={setTipoDocumentoGerador}
            clienteSelecionadoGerador={clienteSelecionadoGerador}
            setClienteSelecionadoGerador={setClienteSelecionadoGerador}
            documentoGeradoTexto={documentoGeradoTexto}
            setDocumentoGeradoTexto={setDocumentoGeradoTexto}
            clientes={clientes}
            perfilUsuario={perfilUsuario}
          />
        );
      case 'controleFinanceiro':
        return (
          <Financeiro 
            registrosFinanceiros={registrosFinanceiros}
            setRegistrosFinanceiros={setRegistrosFinanceiros}
            novoHonorarioClienteId={novoHonorarioClienteId}
            setNovoHonorarioClienteId={setNovoHonorarioClienteId}
            novoHonorarioReferencia={novoHonorarioReferencia}
            setNovoHonorarioReferencia={setNovoHonorarioReferencia}
            novoHonorarioValor={novoHonorarioValor}
            setNovoHonorarioValor={setNovoHonorarioValor}
            novoHonorarioStatus={novoHonorarioStatus}
            setNovoHonorarioStatus={setNovoHonorarioStatus}
            novaDespesaDescricao={novaDespesaDescricao}
            setNovaDespesaDescricao={setNovaDespesaDescricao}
            novaDespesaCategoria={novaDespesaCategoria}
            setNovaDespesaCategoria={setNovaDespesaCategoria}
            novaDespesaValor={novaDespesaValor}
            setNovaDespesaValor={setNovaDespesaValor}
            clientes={clientes}
          />
        );
      case 'perfilUsuario':
        return (
          <Perfil 
            formPerfilNome={formPerfilNome}
            setFormPerfilNome={setFormPerfilNome}
            formPerfilOAB={formPerfilOAB}
            setFormPerfilOAB={setFormPerfilOAB}
            formPerfilUFOAB={formPerfilUFOAB}
            setFormPerfilUFOAB={setFormPerfilUFOAB}
            formPerfilEmail={formPerfilEmail}
            setFormPerfilEmail={setFormPerfilEmail}
            formPerfilEndereco={formPerfilEndereco}
            setFormPerfilEndereco={setFormPerfilEndereco}
            perfilUsuario={perfilUsuario}
            setPerfilUsuario={setPerfilUsuario}
          />
        );
      case 'configApiKeys':
        return (
          <ConfigApiKeys 
            inputGeminiApiKey={inputGeminiApiKey}
            setInputGeminiApiKey={setInputGeminiApiKey}
            handleSaveApiKey={handleSaveApiKey}
            handleRemoveApiKey={handleRemoveApiKey}
            geminiApiKey={geminiApiKey}
            aiClient={aiClient}
          />
        );
      case 'notificacoes':
        return (
          <Notificacoes 
            configNotificacoes={configNotificacoes}
            setConfigNotificacoes={setConfigNotificacoes}
          />
        );
      case 'seguranca':
        return <Seguranca />;
      case 'planoAssinatura':
        return <PlanoAssinatura />;
      default:
        return <h2>Selecione um módulo</h2>;
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="app-container">
        <nav className="sidebar" aria-label="Navegação Principal">
          <h1>Lex Pro Brasil</h1>
          <ul>
            {menuItems.map(mainItem => (
              <li key={mainItem.id}>
                <span
                  className={`module-title ${mainItem.subItems && mainItem.subItems.length > 0 ? '' : 'clickable'} ${activeModule === mainItem.id && (!mainItem.subItems || mainItem.subItems.length === 0) ? 'active' : ''}`}
                  onClick={() => mainItem.subItems && mainItem.subItems.length > 0 ? setActiveSubMenu(activeSubMenu === mainItem.id ? null : mainItem.id) : handleMenuClick(mainItem.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (mainItem.subItems && mainItem.subItems.length > 0 ? setActiveSubMenu(activeSubMenu === mainItem.id ? null : mainItem.id) : handleMenuClick(mainItem.id))}
                  role={mainItem.subItems && mainItem.subItems.length > 0 ? "button" : (mainItem.isMainModule ? "heading" : "link")}
                  tabIndex={mainItem.subItems && mainItem.subItems.length > 0 ? 0 : (mainItem.isMainModule ? -1 : 0) }
                  aria-expanded={activeSubMenu === mainItem.id}
                  aria-controls={mainItem.subItems ? `submenu-${mainItem.id}` : undefined}
                >
                  {mainItem.title}
                </span>
                {mainItem.subItems && activeSubMenu === mainItem.id && (
                  <ul className="sub-menu" id={`submenu-${mainItem.id}`}>
                    {mainItem.subItems.map(subItem => (
                      <li key={subItem.id}>
                        <a
                          href="#"
                          className={activeModule === subItem.id ? 'active' : ''}
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuClick(subItem.id, mainItem.id);
                          }}
                          aria-current={activeModule === subItem.id ? 'page' : undefined}
                        >
                          {subItem.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <main className="main-content" id="main-content-area" role="main" aria-live="polite">
          {renderModuleContent()}
        </main>
      </div>
    </>
  );
};

export default App;