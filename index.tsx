
import React, { useState, useEffect, FormEvent } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import CalculadoraMonetaria from './CalculadoraMonetaria'; // Import the new component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interfaces para tipagem dos dados
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
    tribunal: 'STJ' | 'TJSP' | 'STF' | 'TRF1' | 'TST';
    processo: string;
    publicacao: string;
    relator: string;
    ementa: string;
}

interface Honorario {
    id: string;
    tipo: 'honorario';
    dataLancamento: string; // ISO string
    clienteId: string;
    clienteNome: string;
    referenciaProcesso: string;
    valor: number;
    status: 'Aguardando Pagamento' | 'Pago';
}

interface Despesa {
    id: string;
    tipo: 'despesa';
    dataLancamento: string; // ISO string
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
    data: string; // YYYY-MM-DD
    titulo: string;
    tipo: 'Prazo Processual' | 'Audiência' | 'Reunião' | 'Outro';
    descricao: string;
}


// Inicialização da API Gemini (ASSUMINDO que process.env.API_KEY está configurado)
const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Erro ao inicializar GoogleGenAI. Verifique sua API Key e configurações.", error);
  }
} else {
    console.warn("API_KEY do Gemini não encontrada. Funcionalidades de IA estarão desabilitadas.");
}

// Templates de Documentos
const TEMPLATE_PROCURACAO_AD_JUDICIA = `PROCURAÇÃO "AD JUDICIA ET EXTRA"

OUTORGANTE: [NOME DO CLIENTE], [PREENCHER NACIONALIDADE], [PREENCHER ESTADO CIVIL], [PREENCHER PROFISSÃO], portador(a) do CPF nº [CPF DO CLIENTE], residente e domiciliado(a) em [ENDEREÇO DO CLIENTE], CEP [PREENCHER CEP].

OUTORGADO(S): [ADVOGADO_NOME_COMPLETO], nacionalidade brasileira, estado civil [ADVOGADO_ESTADO_CIVIL], advogado(a), inscrito(a) na OAB/[UF DA OAB] sob o nº [ADVOGADO_OAB], com escritório profissional situado na [ADVOGADO_ENDERECO_ESCRITORIO], e-mail: [ADVOGADO_EMAIL], onde recebe intimações e notificações.

PODERES: Pelo presente instrumento particular de procuração, o(a) OUTORGANTE nomeia e constitui seu(sua) bastante procurador(a) o(s) OUTORGADO(S) acima qualificado(s), a quem confere amplos, gerais e ilimitados poderes para o foro em geral, com a cláusula "ad judicia et extra", em qualquer Juízo, Instância ou Tribunal, podendo propor contra quem de direito as ações competentes e defender os interesses do(a) OUTORGANTE nas contrárias, seguindo umas e outras, até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe, ainda, poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, receber e dar quitação, podendo substabelecer esta em outrem, com ou sem reservas de iguais poderes, agindo em conjunto ou separadamente, dando tudo por bom, firme e valioso. Poderes específicos para atuar na defesa dos interesses do(a) outorgante em [ESPECIFICAR OBJETO DA AÇÃO/DEMANDA].

[CIDADE DE EMISSÃO], [DATA POR EXTENSO].

_________________________________________
[NOME DO CLIENTE]
(Outorgante)
`;

const TEMPLATE_CONTRATO_HONORARIOS = `CONTRATO DE HONORÁRIOS ADVOCATÍCIOS

Pelo presente instrumento particular de Contrato de Honorários Advocatícios, têm entre si, justo e contratado o seguinte:

CONTRATANTE: [NOME DO CLIENTE], [PREENCHER NACIONALIDADE], [PREENCHER ESTADO CIVIL], [PREENCHER PROFISSÃO], portador(a) do CPF nº [CPF DO CLIENTE], residente e domiciliado(a) em [ENDEREÇO DO CLIENTE], CEP [PREENCHER CEP].

CONTRATADO(A): [ADVOGADO_NOME_COMPLETO], nacionalidade brasileira, estado civil [ADVOGADO_ESTADO_CIVIL], advogado(a), inscrito(a) na OAB/[UF DA OAB] sob o nº [ADVOGADO_OAB], com escritório profissional situado na [ADVOGADO_ENDERECO_ESCRITORIO], e-mail: [ADVOGADO_EMAIL].

CLÁUSULA 1ª - DO OBJETO DO CONTRATO
O(A) CONTRATADO(A) prestará ao(à) CONTRATANTE os seguintes serviços profissionais:
Patrocínio dos interesses do(a) CONTRATANTE na ação de [ESPECIFICAR AÇÃO/DEMANDA], a ser proposta/em trâmite perante [ESPECIFICAR JUÍZO/VARA/COMARCA].

CLÁUSULA 2ª - DOS HONORÁRIOS
Pelos serviços prestados, o(a) CONTRATANTE pagará ao(à) CONTRATADO(A) a título de honorários advocatícios o valor de [DETALHAR VALORES E FORMA DE PAGAMENTO].
Parágrafo Primeiro: As despesas processuais (custas, taxas, emolumentos, etc.) e extraprocessuais (cópias, autenticações, viagens, etc.) correrão por conta do(a) CONTRATANTE.
Parágrafo Segundo: Em caso de acordo, os honorários pactuados serão devidos integralmente.
Parágrafo Terceiro: Em caso de revogação do mandato por parte do(a) CONTRATANTE antes do término da demanda, serão devidos os honorários proporcionais ao trabalho realizado, além de eventual cláusula penal.

CLÁUSULA 3ª - DAS OBRIGAÇÕES DO(A) CONTRATANTE
O(A) CONTRATANTE se obriga a fornecer ao(à) CONTRATADO(A) todos os documentos e informações necessárias ao bom e fiel desempenho do mandato, bem como a pagar os honorários na forma e prazos ajustados.

CLÁUSULA 4ª - DO FORO
Fica eleito o foro da comarca de [CIDADE PARA FORO] para dirimir quaisquer dúvidas oriundas do presente contrato.

E, por estarem assim justos e contratados, assinam o presente instrumento em 02 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.

[CIDADE DE EMISSÃO], [DATA POR EXTENSO].

_________________________________________
[NOME DO CLIENTE]
(Contratante)

_________________________________________
[ADVOGADO_NOME_COMPLETO]
(Contratado(a))

Testemunhas:
1. _________________________________ Nome: CPF:
2. _________________________________ Nome: CPF:
`;


const App: React.FC = () => {
    const [activeModule, setActiveModule] = useState<string>('dashboard');
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

    // Estado para Processos
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [novoProcesso, setNovoProcesso] = useState<Omit<Processo, 'id'>>({
        numero: '', comarca: '', vara: '', natureza: '', partes: '', objeto: '', valorCausa: '', status: 'Ativo'
    });
    const [textoProcessoIA, setTextoProcessoIA] = useState<string>('');
    const [loadingAnaliseProcessoIA, setLoadingAnaliseProcessoIA] = useState<boolean>(false);


    // Estado para Clientes
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [novoCliente, setNovoCliente] = useState<Omit<Cliente, 'id'>>({
        nome: '', cpfCnpj: '', email: '', telefone: '', endereco: ''
    });
    const [editingClienteId, setEditingClienteId] = useState<string | null>(null);
    const [termoBuscaCliente, setTermoBuscaCliente] = useState<string>('');


    // Estado para Jurisprudência
    const jurisprudenciaDBDefault: JurisprudenciaItem[] = [
        { id: 'j1', tribunal: 'STJ', processo: 'REsp 1.234.567/SP', publicacao: '01/01/2023', relator: 'Ministro X', ementa: 'DIREITO CIVIL. CONTRATOS. INADIMPLEMENTO. DANO MORAL. CONFIGURADO. Atraso excessivo na entrega de imóvel adquirido na planta configura dano moral indenizável, extrapolando o mero dissabor. O consumidor tem o direito à justa reparação pelos transtornos sofridos. A construtora deve arcar com as consequências de seu descumprimento contratual, incluindo os danos extrapatrimoniais causados ao adquirente, que teve suas expectativas frustradas e sua paz de espírito abalada pela incerteza e pela demora.' },
        { id: 'j2', tribunal: 'TJSP', processo: 'Apelação Cível 100.200.30-00', publicacao: '15/02/2023', relator: 'Desembargador Y', ementa: 'DIREITO DO CONSUMIDOR. TELEFONIA. COBRANÇA INDEVIDA. REPETIÇÃO DO INDÉBITO EM DOBRO. MÁ-FÉ. A cobrança de valores indevidos por serviços não solicitados de telefonia, quando demonstrada a má-fé da operadora, enseja a repetição do indébito em dobro, nos termos do artigo 42, parágrafo único, do Código de Defesa do Consumidor. Necessidade de comprovação da ausência de engano justificável pela fornecedora para afastar a sanção.' },
        { id: 'j3', tribunal: 'STF', processo: 'RE 987.654/RJ', publicacao: '10/03/2023', relator: 'Ministra Z', ementa: 'DIREITO CONSTITUCIONAL. LIBERDADE DE EXPRESSÃO. LIMITES. DISCURSO DE ÓDIO. VEDAÇÃO. A liberdade de expressão, embora fundamental, não é absoluta e encontra limites na dignidade da pessoa humana e na vedação ao discurso de ódio. Manifestações que incitam a violência ou a discriminação não estão abarcadas pela proteção constitucional. O Estado tem o dever de proteger os grupos vulneráveis contra tais práticas.' },
        { id: 'j4', tribunal: 'TST', processo: 'RR 112233-44.2022.5.03.0001', publicacao: '05/04/2023', relator: 'Ministro A', ementa: 'DIREITO DO TRABALHO. HORAS EXTRAS. CARTÕES DE PONTO BRITÂNICOS. INVALIDADE. ÔNUS DA PROVA. A apresentação de cartões de ponto com horários de entrada e saída uniformes ("britânicos") transfere ao empregador o ônus de provar a jornada efetivamente cumprida pelo empregado, prevalecendo a jornada alegada na inicial caso o empregador não se desincumba de seu encargo probatório. Súmula 338, III, do TST.' },
        { id: 'j5', tribunal: 'TRF1', processo: 'AMS 0012345-67.2021.4.01.3400', publicacao: '20/05/2023', relator: 'Desembargador Federal B', ementa: 'DIREITO ADMINISTRATIVO. SERVIDOR PÚBLICO. REMOÇÃO. MOTIVO DE SAÚDE DE DEPENDENTE. COMPROVAÇÃO. ART. 36, III, "B" DA LEI 8.112/90. Comprovada a necessidade de remoção do servidor público para localidade diversa por motivo de saúde de dependente que conste de seu assentamento funcional, e não havendo outra forma de tratamento no local de origem, impõe-se o deferimento do pedido, nos termos da Lei nº 8.112/90. A saúde é direito fundamental e deve ser protegida.' },
    ];
    const [jurisprudenciaDB, setJurisprudenciaDB] = useState<JurisprudenciaItem[]>(jurisprudenciaDBDefault);
    const [termoBuscaJuris, setTermoBuscaJuris] = useState<string>('');
    const [filtroTribunalJuris, setFiltroTribunalJuris] = useState<string>('Todos');
    const [resultadosJuris, setResultadosJuris] = useState<JurisprudenciaItem[]>([]);
    const [loadingJurisSearch, setLoadingJurisSearch] = useState<boolean>(false);
    const [resumosEmentas, setResumosEmentas] = useState<Record<string, string>>({});
    const [loadingResumoId, setLoadingResumoId] = useState<string | null>(null);

    // Estado para Gerador de Documentos
    const [tipoDocumentoGerador, setTipoDocumentoGerador] = useState<string>('');
    const [clienteSelecionadoGerador, setClienteSelecionadoGerador] = useState<string>('');
    const [documentoGeradoTexto, setDocumentoGeradoTexto] = useState<string>('');
    const [loadingGeracaoDoc, setLoadingGeracaoDoc] = useState<boolean>(false);

    // Estado para Controle Financeiro
    const [registrosFinanceiros, setRegistrosFinanceiros] = useState<RegistroFinanceiro[]>([]);
    const [novoHonorarioClienteId, setNovoHonorarioClienteId] = useState<string>('');
    const [novoHonorarioReferencia, setNovoHonorarioReferencia] = useState<string>('');
    const [novoHonorarioValor, setNovoHonorarioValor] = useState<string>('');
    const [novoHonorarioStatus, setNovoHonorarioStatus] = useState<'Aguardando Pagamento' | 'Pago'>('Aguardando Pagamento');
    const [novaDespesaDescricao, setNovaDespesaDescricao] = useState<string>('');
    const [novaDespesaCategoria, setNovaDespesaCategoria] = useState<'Custas Processuais' | 'Diligências' | 'Transporte' | 'Material de Escritório' | 'Outras'>('Custas Processuais');
    const [novaDespesaValor, setNovaDespesaValor] = useState<string>('');

    // Estado para Perfil do Usuário
    const initialPerfilUsuario: PerfilUsuario = {
        nomeCompleto: '', oab: '', ufOab: '', email: '', enderecoEscritorio: ''
    };
    const [perfilUsuario, setPerfilUsuario] = useState<PerfilUsuario>(initialPerfilUsuario);
    const [formPerfilNome, setFormPerfilNome] = useState<string>('');
    const [formPerfilOAB, setFormPerfilOAB] = useState<string>('');
    const [formPerfilUFOAB, setFormPerfilUFOAB] = useState<string>('');
    const [formPerfilEmail, setFormPerfilEmail] = useState<string>('');
    const [formPerfilEndereco, setFormPerfilEndereco] = useState<string>('');

    // Estado para Análise de Petições com IA
    const [peticaoParaAnalise, setPeticaoParaAnalise] = useState<string>('');
    const [resultadoAnalisePeticao, setResultadoAnalisePeticao] = useState<string | null>(null);
    const [loadingAnalisePeticao, setLoadingAnalisePeticao] = useState<boolean>(false);

    // Estado para Agenda e Prazos
    const [eventos, setEventos] = useState<EventoAgenda[]>([]);
    const [formEventoData, setFormEventoData] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
    const [formEventoTitulo, setFormEventoTitulo] = useState<string>('');
    const [formEventoTipo, setFormEventoTipo] = useState<EventoAgenda['tipo']>('Prazo Processual');
    const [formEventoDescricao, setFormEventoDescricao] = useState<string>('');


    // Carregar dados do localStorage ao iniciar
    useEffect(() => {
        const storedProcessos = localStorage.getItem('lexProProcessos');
        if (storedProcessos) setProcessos(JSON.parse(storedProcessos));

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

        setResultadosJuris(jurisprudenciaDB); // Initialize with default DB
    }, []);

    // Salvar Processos
    useEffect(() => {
        localStorage.setItem('lexProProcessos', JSON.stringify(processos));
    }, [processos]);

    // Salvar Clientes
    useEffect(() => {
        localStorage.setItem('lexProClientes', JSON.stringify(clientes));
    }, [clientes]);

    // Salvar Registros Financeiros
    useEffect(() => {
        localStorage.setItem('lexProRegistrosFinanceiros', JSON.stringify(registrosFinanceiros));
    }, [registrosFinanceiros]);

    // Salvar Perfil do Usuário
    useEffect(() => {
        localStorage.setItem('lexProPerfilUsuario', JSON.stringify(perfilUsuario));
    }, [perfilUsuario]);

    // Salvar Eventos da Agenda
    useEffect(() => {
        localStorage.setItem('lexProEventos', JSON.stringify(eventos));
    }, [eventos]);


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
                { id: 'seguranca', title: 'Segurança' },
                { id: 'notificacoes', title: 'Notificações' },
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
    };

    useEffect(() => {
        if (menuItems.length > 0 && menuItems[0].subItems && menuItems[0].subItems.length > 0) {
            setActiveSubMenu(menuItems[0].id);
            setActiveModule(menuItems[0].subItems[0].id);
        }
    }, []);

    const handleProcessoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNovoProcesso(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProcesso = (e: FormEvent) => {
        e.preventDefault();
        if (!novoProcesso.numero.trim()) {
            toast.error("O número do processo é obrigatório.");
            return;
        }
        const processoComId: Processo = { ...novoProcesso, id: new Date().toISOString() };
        setProcessos(prev => [...prev, processoComId]);
        setNovoProcesso({ numero: '', comarca: '', vara: '', natureza: '', partes: '', objeto: '', valorCausa: '', status: 'Ativo' });
        toast.success("Processo adicionado com sucesso!");
    };

    const handleAnalisarTextoParaProcesso = async () => {
        if (!ai) {
            toast.warn("A funcionalidade de IA não está disponível. Verifique a configuração da API Key.");
            return;
        }
        if (!textoProcessoIA.trim()) {
            toast.warn("Por favor, cole o texto para análise na área indicada.");
            return;
        }
        setLoadingAnaliseProcessoIA(true);

        const prompt = `Você é um assistente jurídico especialista em extrair informações de documentos legais brasileiros. Analise o texto fornecido e retorne um objeto JSON contendo os seguintes campos:
- "numero": O número do processo no formato CNJ (Ex: "0000000-00.0000.0.00.0000"). Se não encontrar ou não estiver no formato CNJ, tente extrair o número disponível. Se não encontrar, deixe em branco.
- "comarca": A comarca do processo (Ex: "Comarca de São Paulo"). Se não encontrar, deixe em branco.
- "vara": A vara do processo (Ex: "1ª Vara Cível"). Se não encontrar, deixe em branco.
- "natureza": A natureza da ação (Ex: "Ação de Cobrança", "Mandado de Segurança", "Divórcio Litigioso"). Se não encontrar, deixe em branco.
- "partes": As partes envolvidas, tentando identificar Autor(es) e Réu(s) (Ex: "Autor: João da Silva, Réu: Empresa XYZ Ltda"). Se não encontrar, deixe em branco.
- "objeto": Um breve resumo do objeto principal da ação (Ex: "Cobrança de dívida referente a contrato de aluguel", "Pleito de indenização por danos morais"). Se não encontrar, deixe em branco.

Se alguma informação não puder ser extraída do texto, retorne uma string vazia para o campo correspondente no JSON. Priorize a precisão. O texto para análise é o seguinte:
"""
${textoProcessoIA}
"""`;

        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            let jsonStr = response.text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
                jsonStr = match[2].trim();
            }

            const parsedData = JSON.parse(jsonStr) as Partial<Omit<Processo, 'id' | 'valorCausa' | 'status'>>;

            setNovoProcesso(prev => ({
                ...prev, // Mantém valorCausa, status e outros campos não extraídos pela IA
                numero: parsedData.numero || '',
                comarca: parsedData.comarca || '',
                vara: parsedData.vara || '',
                natureza: parsedData.natureza || '',
                partes: parsedData.partes || '',
                objeto: parsedData.objeto || '',
            }));
            setTextoProcessoIA(''); // Limpa a textarea após o sucesso
            toast.success("Formulário preenchido com os dados extraídos pela IA. Revise antes de salvar.");

        } catch (error) {
            console.error("Erro ao analisar texto para processo com IA:", error);
            toast.error("Ocorreu um erro ao tentar analisar o texto com a IA. Verifique o console para mais detalhes ou tente novamente.");
        } finally {
            setLoadingAnaliseProcessoIA(false);
        }
    };


    const handleClienteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNovoCliente(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitClienteForm = (e: FormEvent) => {
        e.preventDefault();
        if (!novoCliente.nome.trim()) {
            toast.error("O nome do cliente é obrigatório.");
            return;
        }

        if (editingClienteId) { // Editando cliente existente
            setClientes(prevClientes =>
                prevClientes.map(c =>
                    c.id === editingClienteId ? { ...novoCliente, id: editingClienteId } : c
                )
            );
            toast.success("Cliente atualizado com sucesso!");
        } else { // Adicionando novo cliente
            const clienteComId: Cliente = { ...novoCliente, id: new Date().toISOString() };
            setClientes(prev => [...prev, clienteComId]);
            toast.success("Cliente adicionado com sucesso!");
        }
        setEditingClienteId(null);
        setNovoCliente({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '' });
    };

    const handleStartEditCliente = (cliente: Cliente) => {
        setEditingClienteId(cliente.id);
        setNovoCliente({
            nome: cliente.nome,
            cpfCnpj: cliente.cpfCnpj,
            email: cliente.email,
            telefone: cliente.telefone,
            endereco: cliente.endereco
        });
        const formElement = document.getElementById('form-gestao-clientes');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleCancelEditCliente = () => {
        setEditingClienteId(null);
        setNovoCliente({ nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '' });
    };

    const handleDeleteCliente = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.")) {
            setClientes(prev => prev.filter(cliente => cliente.id !== id));
            if (editingClienteId === id) {
                handleCancelEditCliente();
            }
            toast.success("Cliente excluído com sucesso!");
        }
    };

    const handleSearchJurisprudencia = (e?: FormEvent) => {
        if(e) e.preventDefault();
        setLoadingJurisSearch(true);
        let filtrados = jurisprudenciaDB;

        if (filtroTribunalJuris !== 'Todos') {
            filtrados = filtrados.filter(item => item.tribunal === filtroTribunalJuris);
        }

        if (termoBuscaJuris.trim() !== '') {
            const termo = termoBuscaJuris.toLowerCase();
            filtrados = filtrados.filter(item =>
                item.ementa.toLowerCase().includes(termo) ||
                item.processo.toLowerCase().includes(termo) ||
                item.relator.toLowerCase().includes(termo)
            );
        }
        setResultadosJuris(filtrados);
        setLoadingJurisSearch(false);
    };

    const handleResumirEmenta = async (ementa: string, itemId: string) => {
        if (!ai) {
            toast.warn("A funcionalidade de IA não está disponível. Verifique a configuração da API Key.");
            return;
        }
        setLoadingResumoId(itemId);
        setResumosEmentas(prev => ({ ...prev, [itemId]: '' }));

        const prompt = `Você é um assistente jurídico especialista. Resuma a seguinte ementa de forma clara e concisa, em no máximo 3 frases, destacando o ponto principal da decisão: "${ementa}"`;

        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: prompt,
            });
            const textoResumido = response.text;
            setResumosEmentas(prev => ({ ...prev, [itemId]: textoResumido }));
        } catch (error) {
            console.error("Erro ao resumir ementa:", error);
            setResumosEmentas(prev => ({ ...prev, [itemId]: "Erro ao gerar resumo." }));
            toast.error("Ocorreu um erro ao tentar resumir a ementa. Tente novamente.");
        } finally {
            setLoadingResumoId(null);
        }
    };

    const handleGerarDocumento = () => {
        if (!tipoDocumentoGerador) {
            toast.warn("Por favor, selecione o tipo de documento.");
            return;
        }
        if (!clienteSelecionadoGerador) {
            toast.warn("Por favor, selecione um cliente.");
            return;
        }

        setLoadingGeracaoDoc(true);
        const cliente = clientes.find(c => c.id === clienteSelecionadoGerador);
        if (!cliente) {
            toast.error("Cliente não encontrado.");
            setLoadingGeracaoDoc(false);
            return;
        }

        let template = '';
        if (tipoDocumentoGerador === 'contratoHonorarios') {
            template = TEMPLATE_CONTRATO_HONORARIOS;
        } else if (tipoDocumentoGerador === 'procuracaoAdJudicia') {
            template = TEMPLATE_PROCURACAO_AD_JUDICIA;
        }

        let docFinal = template;
        // Cliente
        docFinal = docFinal.replace(/\[NOME DO CLIENTE\]/g, cliente.nome || '[NOME DO CLIENTE PENDENTE]');
        docFinal = docFinal.replace(/\[CPF DO CLIENTE\]/g, cliente.cpfCnpj || '[CPF/CNPJ PENDENTE]');
        docFinal = docFinal.replace(/\[ENDEREÇO DO CLIENTE\]/g, cliente.endereco || '[ENDEREÇO PENDENTE]');

        docFinal = docFinal.replace(/\[PREENCHER NACIONALIDADE\]/g, '[PREENCHER NACIONALIDADE]');
        docFinal = docFinal.replace(/\[PREENCHER ESTADO CIVIL\]/g, '[PREENCHER ESTADO CIVIL]');
        docFinal = docFinal.replace(/\[PREENCHER PROFISSÃO\]/g, '[PREENCHER PROFISSÃO]');
        docFinal = docFinal.replace(/\[PREENCHER CEP\]/g, '[PREENCHER CEP]');

        // Advogado (do Perfil do Usuário)
        docFinal = docFinal.replace(/\[ADVOGADO_NOME_COMPLETO\]/g, perfilUsuario.nomeCompleto || '[NOME DO ADVOGADO]');
        docFinal = docFinal.replace(/\[ADVOGADO_OAB\]/g, perfilUsuario.oab || '[OAB DO ADVOGADO]');
        docFinal = docFinal.replace(/\[UF DA OAB\]/g, perfilUsuario.ufOab || '[UF DA OAB]');
        docFinal = docFinal.replace(/\[ADVOGADO_EMAIL\]/g, perfilUsuario.email || '[EMAIL DO ADVOGADO]');
        docFinal = docFinal.replace(/\[ADVOGADO_ENDERECO_ESCRITORIO\]/g, perfilUsuario.enderecoEscritorio || '[ENDEREÇO DO ESCRITÓRIO]');

        docFinal = docFinal.replace(/\[ADVOGADO_ESTADO_CIVIL\]/g, '[ESTADO CIVIL DO ADVOGADO]');

        docFinal = docFinal.replace(/\[ESPECIFICAR AÇÃO\/DEMANDA\]/g, '[ESPECIFICAR AÇÃO/DEMANDA]');
        docFinal = docFinal.replace(/\[ESPECIFICAR JUÍZO\/VARA\/COMARCA\]/g, '[ESPECIFICAR JUÍZO/VARA/COMARCA]');
        docFinal = docFinal.replace(/\[DETALHAR VALORES E FORMA DE PAGAMENTO\]/g, '[DETALHAR VALORES E FORMA DE PAGAMENTO]');
        docFinal = docFinal.replace(/\[CIDADE PARA FORO\]/g, '[CIDADE PARA FORO]');
        docFinal = docFinal.replace(/\[CIDADE DE EMISSÃO\]/g, '[CIDADE DE EMISSÃO]');
        docFinal = docFinal.replace(/\[DATA POR EXTENSO\]/g, '[DATA POR EXTENSO]');

        setDocumentoGeradoTexto(docFinal);
        setLoadingGeracaoDoc(false);
    };

    // Funções do Controle Financeiro
    const formatCurrency = (value: number): string => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleAddHonorario = (e: FormEvent) => {
        e.preventDefault();
        const valorNum = parseFloat(novoHonorarioValor);
        if (!novoHonorarioClienteId || !novoHonorarioReferencia.trim() || isNaN(valorNum) || valorNum <= 0) {
            toast.error("Preencha todos os campos do honorário corretamente (Cliente, Referência e Valor).");
            return;
        }
        const clienteSelecionado = clientes.find(c => c.id === novoHonorarioClienteId);
        if (!clienteSelecionado) {
            toast.error("Cliente não encontrado.");
            return;
        }

        const novoRegistro: Honorario = {
            id: new Date().toISOString(),
            tipo: 'honorario',
            dataLancamento: new Date().toISOString(),
            clienteId: novoHonorarioClienteId,
            clienteNome: clienteSelecionado.nome,
            referenciaProcesso: novoHonorarioReferencia,
            valor: valorNum,
            status: novoHonorarioStatus
        };
        setRegistrosFinanceiros(prev => [...prev, novoRegistro].sort((a,b) => new Date(b.dataLancamento).getTime() - new Date(a.dataLancamento).getTime()));
        setNovoHonorarioClienteId('');
        setNovoHonorarioReferencia('');
        setNovoHonorarioValor('');
        setNovoHonorarioStatus('Aguardando Pagamento');
        toast.success("Honorário lançado com sucesso!");
    };

    const handleAddDespesa = (e: FormEvent) => {
        e.preventDefault();
        const valorNum = parseFloat(novaDespesaValor);
        if (!novaDespesaDescricao.trim() || isNaN(valorNum) || valorNum <= 0) {
            toast.error("Preencha todos os campos da despesa corretamente (Descrição e Valor).");
            return;
        }
        const novaDespesaRegistro: Despesa = {
            id: new Date().toISOString(),
            tipo: 'despesa',
            dataLancamento: new Date().toISOString(),
            descricao: novaDespesaDescricao,
            categoria: novaDespesaCategoria,
            valor: valorNum
        };
        setRegistrosFinanceiros(prev => [...prev, novaDespesaRegistro].sort((a,b) => new Date(b.dataLancamento).getTime() - new Date(a.dataLancamento).getTime()));
        setNovaDespesaDescricao('');
        setNovaDespesaCategoria('Custas Processuais');
        setNovaDespesaValor('');
        toast.success("Despesa lançada com sucesso!");
    };

    const calcularTotalAReceber = (): number => {
        return registrosFinanceiros.reduce((acc, curr) => {
            if (curr.tipo === 'honorario' && curr.status === 'Aguardando Pagamento') {
                return acc + curr.valor;
            }
            return acc;
        }, 0);
    };

    const calcularTotalDespesasMesAtual = (): number => {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        return registrosFinanceiros.reduce((acc, curr) => {
            if (curr.tipo === 'despesa') {
                const dataLancamento = new Date(curr.dataLancamento);
                if (dataLancamento.getMonth() === mesAtual && dataLancamento.getFullYear() === anoAtual) {
                    return acc + curr.valor;
                }
            }
            return acc;
        }, 0);
    };

    // Funções do Perfil do Usuário
    const handleSavePerfil = (e: FormEvent) => {
        e.preventDefault();
        const perfilAtualizado: PerfilUsuario = {
            nomeCompleto: formPerfilNome,
            oab: formPerfilOAB,
            ufOab: formPerfilUFOAB,
            email: formPerfilEmail,
            enderecoEscritorio: formPerfilEndereco,
        };
        setPerfilUsuario(perfilAtualizado);
        toast.success("Perfil salvo com sucesso!");
    };

    // Funções da Análise de Petição com IA
    const handleAnalisarPeticao = async () => {
        if (!ai) {
            toast.warn("A funcionalidade de IA não está disponível. Verifique a configuração da API Key.");
            return;
        }
        if (!peticaoParaAnalise.trim()) {
            toast.warn("Por favor, cole o texto da petição na área indicada.");
            return;
        }
        setLoadingAnalisePeticao(true);
        setResultadoAnalisePeticao(null);

        const prompt = `Você é um advogado sênior e especialista em direito processual brasileiro. Analise o texto desta petição e retorne uma análise estruturada em Markdown. Identifique os seguintes pontos:
1.  **Resumo da Tese Principal:** Em um parágrafo.
2.  **Pontos Fortes:** Liste os 3 principais argumentos ou pontos fortes da peça.
3.  **Pontos Frágeis ou a Melhorar:** Liste os 3 principais pontos que podem ser contestados ou que precisam de mais fundamentação.
4.  **Sugestões de Jurisprudência:** Sugira 2 a 3 temas de jurisprudência que poderiam fortalecer a peça, sem citar ementas completas.
5.  **Artigos de Lei Relevantes:** Aponte 2 a 3 artigos de lei que são cruciais para o caso e que talvez não tenham sido explorados.

Texto da Petição:
"""
${peticaoParaAnalise}
"""`;

        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: prompt,
            });
            setResultadoAnalisePeticao(response.text);
        } catch (error) {
            console.error("Erro ao analisar petição:", error);
            setResultadoAnalisePeticao("Erro ao realizar a análise da petição. Tente novamente mais tarde.");
            toast.error("Ocorreu um erro ao tentar analisar a petição.");
        } finally {
            setLoadingAnalisePeticao(false);
        }
    };

    // Funções da Agenda e Prazos
    const handleAddEvento = (e: FormEvent) => {
        e.preventDefault();
        if (!formEventoData || !formEventoTitulo.trim()) {
            toast.error("Data e Título são obrigatórios para o evento.");
            return;
        }
        const novoEventoItem: EventoAgenda = {
            id: new Date().toISOString(),
            data: formEventoData,
            titulo: formEventoTitulo,
            tipo: formEventoTipo,
            descricao: formEventoDescricao
        };
        setEventos(prev => [...prev, novoEventoItem].sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime()));
        setFormEventoData(new Date().toISOString().split('T')[0]);
        setFormEventoTitulo('');
        setFormEventoTipo('Prazo Processual');
        setFormEventoDescricao('');
        toast.success("Evento adicionado com sucesso!");
    };


    const renderModuleContent = () => {
        switch (activeModule) {
            case 'dashboard':
                return (
                    <div className="card">
                        <h2>Painel de Controle (Dashboard)</h2>
                        <p>Visão geral e centralizada das suas atividades jurídicas mais importantes. Acompanhe seus prazos, movimentações e tarefas de forma rápida e eficiente.</p>
                        <h4>Funcionalidades:</h4>
                        <ul>
                            <li><strong>Prazos Processuais Próximos:</strong> Listagem clara dos próximos prazos fatais, com contagem regressiva.</li>
                            <li><strong>Últimas Movimentações Processuais:</strong> Notificações de novas atualizações nos processos cadastrados (simulação de integração com tribunais).</li>
                            <li><strong>Tarefas Pendentes:</strong> Gerenciamento de tarefas pessoais e vinculadas a processos.</li>
                            <li><strong>Notificações Importantes:</strong> Alertas sobre audiências, perícias e outros eventos críticos.</li>
                            <li><strong>Resumo do Dia/Semana:</strong> Indicadores chave e resumo de atividades.</li>
                        </ul>
                         <p><em>(Esta seção é uma visão geral. As funcionalidades interativas estão sendo implementadas nos respectivos módulos.)</em></p>
                    </div>
                );
            case 'cadastroProcessos':
                return (
                    <div className="card">
                        <h2>Cadastro de Processos</h2>

                        <div className="form-section ia-section">
                            <h3>🤖 Cadastrar Processo com IA <span className="badge badge-ia">Beta</span></h3>
                            {!ai && (
                                <p style={{color: 'orange', fontWeight: 'bold', border: '1px solid orange', padding: '10px', borderRadius: '4px'}}>
                                    A funcionalidade de cadastro com IA está desabilitada. Verifique se a API Key do Gemini está configurada.
                                </p>
                            )}
                            {ai && (
                                <>
                                    <p>Cole abaixo um trecho do processo (ex: cabeçalho da petição, intimação) e a IA tentará preencher o formulário.</p>
                                    <div className="form-group">
                                        <label htmlFor="textoProcessoIA">Texto para Análise:</label>
                                        <textarea
                                            id="textoProcessoIA"
                                            rows={8}
                                            value={textoProcessoIA}
                                            onChange={(e) => setTextoProcessoIA(e.target.value)}
                                            placeholder="Cole o texto aqui..."
                                            style={{width: '100%', boxSizing: 'border-box'}}
                                            aria-label="Texto para análise pela IA para preenchimento de processo"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAnalisarTextoParaProcesso}
                                        className="btn-primary"
                                        disabled={loadingAnaliseProcessoIA || !textoProcessoIA.trim()}
                                    >
                                        {loadingAnaliseProcessoIA ? 'Analisando com IA...' : 'Analisar e Preencher Formulário'}
                                    </button>
                                    {loadingAnaliseProcessoIA && <p><em>Aguarde, analisando texto...</em></p>}
                                </>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Adicionar Novo Processo Manualmente</h3>
                            <form onSubmit={handleAddProcesso}>
                                <div className="form-group">
                                    <label htmlFor="numero">Número do Processo (CNJ):</label>
                                    <input type="text" id="numero" name="numero" value={novoProcesso.numero} onChange={handleProcessoInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="comarca">Comarca:</label>
                                    <input type="text" id="comarca" name="comarca" value={novoProcesso.comarca} onChange={handleProcessoInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="vara">Vara:</label>
                                    <input type="text" id="vara" name="vara" value={novoProcesso.vara} onChange={handleProcessoInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="natureza">Natureza da Ação:</label>
                                    <input type="text" id="natureza" name="natureza" value={novoProcesso.natureza} onChange={handleProcessoInputChange} />
                                </div>
                                 <div className="form-group">
                                    <label htmlFor="partes">Partes Envolvidas:</label>
                                    <textarea id="partes" name="partes" value={novoProcesso.partes} onChange={handleProcessoInputChange} rows={3}></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="objeto">Objeto da Ação:</label>
                                    <textarea id="objeto" name="objeto" value={novoProcesso.objeto} onChange={handleProcessoInputChange} rows={3}></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="valorCausa">Valor da Causa (R$):</label>
                                    <input type="text" id="valorCausa" name="valorCausa" value={novoProcesso.valorCausa} onChange={handleProcessoInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="status">Status:</label>
                                    <select id="status" name="status" value={novoProcesso.status} onChange={handleProcessoInputChange}>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Suspenso">Suspenso</option>
                                        <option value="Arquivado">Arquivado</option>
                                        <option value="Extinto">Extinto</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary">Adicionar Processo</button>
                            </form>
                        </div>
                        <div className="list-section">
                            <h3>Processos Cadastrados</h3>
                            {processos.length === 0 ? <p>Nenhum processo cadastrado.</p> : (
                                <ul className="data-list">
                                    {processos.map(p => (
                                        <li key={p.id}>
                                            <span className="data-list-item-prop"><strong>Número:</strong> <code>{p.numero}</code></span>
                                            <span className="data-list-item-prop"><strong>Comarca:</strong> {p.comarca} - <strong>Vara:</strong> {p.vara}</span>
                                            <span className="data-list-item-prop"><strong>Natureza:</strong> {p.natureza}</span>
                                            <span className="data-list-item-prop"><strong>Partes:</strong> {p.partes}</span>
                                            <span className="data-list-item-prop"><strong>Objeto:</strong> {p.objeto}</span>
                                            <span className="data-list-item-prop"><strong>Valor:</strong> R$ {p.valorCausa}</span>
                                            <span className="data-list-item-prop"><strong>Status:</strong> <span className={`badge badge-status-${p.status.toLowerCase()}`}>{p.status}</span></span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                         <p style={{marginTop: '20px'}}><strong>LGPD:</strong> Todos os dados são tratados com máxima segurança e em conformidade com a Lei Geral de Proteção de Dados. Dados salvos localmente no seu navegador.</p>
                    </div>
                );
            case 'agendaPrazos':
                const sortedEventos = [...eventos].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
                return (
                    <div className="card">
                        <h2>Agenda e Prazos</h2>
                        <div className="form-section">
                            <h3>Adicionar Novo Evento</h3>
                            <form onSubmit={handleAddEvento}>
                                <div className="form-group">
                                    <label htmlFor="formEventoData">Data:</label>
                                    <input type="date" id="formEventoData" value={formEventoData} onChange={e => setFormEventoData(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="formEventoTitulo">Título:</label>
                                    <input type="text" id="formEventoTitulo" value={formEventoTitulo} onChange={e => setFormEventoTitulo(e.target.value)} required placeholder="Ex: Audiência João Silva"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="formEventoTipo">Tipo:</label>
                                    <select id="formEventoTipo" value={formEventoTipo} onChange={e => setFormEventoTipo(e.target.value as EventoAgenda['tipo'])}>
                                        <option value="Prazo Processual">Prazo Processual</option>
                                        <option value="Audiência">Audiência</option>
                                        <option value="Reunião">Reunião</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="formEventoDescricao">Descrição (Opcional):</label>
                                    <textarea id="formEventoDescricao" value={formEventoDescricao} onChange={e => setFormEventoDescricao(e.target.value)} rows={3} placeholder="Detalhes adicionais, link da videochamada, etc."></textarea>
                                </div>
                                <button type="submit" className="btn-primary">Salvar Evento</button>
                            </form>
                        </div>
                        <div className="list-section">
                            <h3>Próximos Eventos</h3>
                            {sortedEventos.length === 0 ? <p>Nenhum evento agendado.</p> : (
                                <ul className="data-list eventos-list">
                                    {sortedEventos.map(evento => (
                                        <li key={evento.id} className={`evento-item evento-tipo-${evento.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                                            <span className="data-list-item-prop"><strong>Data:</strong> {new Date(evento.data + 'T00:00:00-03:00').toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            <span className="data-list-item-prop"><strong>Título:</strong> {evento.titulo}</span>
                                            <span className="data-list-item-prop"><strong>Tipo:</strong> <span className={`badge badge-evento-${evento.tipo.toLowerCase().replace(/\s+/g, '-')}`}>{evento.tipo}</span></span>
                                            {evento.descricao && <span className="data-list-item-prop"><strong>Descrição:</strong> {evento.descricao}</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <p style={{marginTop: '20px'}}><strong>LGPD:</strong> Seus eventos são armazenados localmente no seu navegador.</p>
                    </div>
                );
            case 'gestaoClientes':
                 const clienteEmEdicao = editingClienteId ? clientes.find(c => c.id === editingClienteId) : null;
                 const clientesFiltrados = clientes.filter(cliente => {
                    if (!termoBuscaCliente.trim()) return true;
                    const termo = termoBuscaCliente.toLowerCase();
                    return (
                        (cliente.nome?.toLowerCase() || '').includes(termo) ||
                        (cliente.cpfCnpj?.toLowerCase() || '').includes(termo) ||
                        (cliente.email?.toLowerCase() || '').includes(termo)
                    );
                });

                 return (
                    <div className="card">
                        <h2>Gestão de Clientes (CRM Jurídico)</h2>
                        <div className="form-section" id="form-gestao-clientes">
                            <h3>{editingClienteId && clienteEmEdicao ? `Editando Cliente: ${clienteEmEdicao.nome}` : 'Adicionar Novo Cliente'}</h3>
                            <form onSubmit={handleSubmitClienteForm}>
                                <div className="form-group">
                                    <label htmlFor="nomeCliente">Nome Completo:</label>
                                    <input type="text" id="nomeCliente" name="nome" value={novoCliente.nome} onChange={handleClienteInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cpfCnpj">CPF/CNPJ:</label>
                                    <input type="text" id="cpfCnpj" name="cpfCnpj" value={novoCliente.cpfCnpj} onChange={handleClienteInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emailCliente">E-mail:</label>
                                    <input type="email" id="emailCliente" name="email" value={novoCliente.email} onChange={handleClienteInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="telefoneCliente">Telefone:</label>
                                    <input type="text" id="telefoneCliente" name="telefone" value={novoCliente.telefone} onChange={handleClienteInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="enderecoCliente">Endereço:</label>
                                    <textarea id="enderecoCliente" name="endereco" value={novoCliente.endereco} onChange={handleClienteInputChange} rows={3}></textarea>
                                </div>
                                <button type="submit" className="btn-primary">
                                    {editingClienteId ? 'Salvar Alterações' : 'Adicionar Cliente'}
                                </button>
                                {editingClienteId && (
                                    <button type="button" onClick={handleCancelEditCliente} className="btn-secondary" style={{ marginLeft: '10px' }}>
                                        Cancelar Edição
                                    </button>
                                )}
                            </form>
                        </div>

                        <div className="list-section">
                            <h3>Clientes Cadastrados</h3>
                             <div className="form-group" style={{marginBottom: '20px'}}>
                                <label htmlFor="buscaCliente" style={{fontWeight: 'normal'}}>Buscar Cliente:</label>
                                <input
                                    type="text"
                                    id="buscaCliente"
                                    placeholder="Digite nome, CPF/CNPJ ou e-mail para buscar..."
                                    value={termoBuscaCliente}
                                    onChange={(e) => setTermoBuscaCliente(e.target.value)}
                                    style={{maxWidth: '400px'}}
                                />
                            </div>

                            {clientesFiltrados.length === 0 && termoBuscaCliente.trim() !== '' && <p>Nenhum cliente encontrado com os termos da busca.</p>}
                            {clientesFiltrados.length === 0 && termoBuscaCliente.trim() === '' && <p>Nenhum cliente cadastrado.</p>}

                            {clientesFiltrados.length > 0 && (
                                <ul className="data-list">
                                    {clientesFiltrados.map(c => (
                                        <li key={c.id}>
                                            <span className="data-list-item-prop"><strong>Nome:</strong> {c.nome}</span>
                                            <span className="data-list-item-prop"><strong>CPF/CNPJ:</strong> <code>{c.cpfCnpj}</code></span>
                                            <span className="data-list-item-prop"><strong>E-mail:</strong> {c.email}</span>
                                            <span className="data-list-item-prop"><strong>Telefone:</strong> {c.telefone}</span>
                                            <span className="data-list-item-prop"><strong>Endereço:</strong> {c.endereco}</span>
                                            <div style={{ marginTop: '10px' }}>
                                                <button onClick={() => handleStartEditCliente(c)} className="btn-secondary" style={{ marginRight: '10px' }}>Editar</button>
                                                <button onClick={() => handleDeleteCliente(c.id)} className="btn-danger">Excluir</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <p style={{marginTop: '20px'}}><strong>LGPD:</strong> Asseguramos a privacidade e proteção dos dados dos seus clientes. Dados salvos localmente no seu navegador.</p>
                    </div>
                );
            case 'jurisprudencia':
                return (
                    <div className="card">
                        <h2>Jurisprudência Unificada</h2>
                        <form onSubmit={handleSearchJurisprudencia} className="form-section">
                            <div className="form-group">
                                <label htmlFor="termoBuscaJuris">Termo de Pesquisa:</label>
                                <input
                                    type="text"
                                    id="termoBuscaJuris"
                                    value={termoBuscaJuris}
                                    onChange={(e) => setTermoBuscaJuris(e.target.value)}
                                    placeholder="Pesquisar na ementa, processo, relator..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="filtroTribunalJuris">Tribunal:</label>
                                <select
                                    id="filtroTribunalJuris"
                                    value={filtroTribunalJuris}
                                    onChange={(e) => setFiltroTribunalJuris(e.target.value)}
                                >
                                    <option value="Todos">Todos os Tribunais</option>
                                    <option value="STJ">STJ</option>
                                    <option value="TJSP">TJSP</option>
                                    <option value="STF">STF</option>
                                    <option value="TST">TST</option>
                                    <option value="TRF1">TRF1</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loadingJurisSearch}>
                                {loadingJurisSearch ? 'Pesquisando...' : 'Pesquisar'}
                            </button>
                        </form>

                        <div className="list-section" aria-live="polite">
                            <h3>Resultados da Pesquisa</h3>
                            {resultadosJuris.length === 0 && !loadingJurisSearch && <p>Nenhuma jurisprudência encontrada para os critérios informados.</p>}
                            {loadingJurisSearch && <p>Carregando resultados...</p>}
                            {!loadingJurisSearch && resultadosJuris.length > 0 && (
                                <ul className="data-list">
                                    {resultadosJuris.map(item => (
                                        <li key={item.id} className="juris-item" aria-busy={loadingResumoId === item.id}>
                                            <span className="data-list-item-prop"><strong>Tribunal:</strong> {item.tribunal}</span>
                                            <span className="data-list-item-prop"><strong>Processo:</strong> <code>{item.processo}</code></span>
                                            <span className="data-list-item-prop"><strong>Publicação:</strong> {item.publicacao}</span>
                                            <span className="data-list-item-prop"><strong>Relator:</strong> {item.relator}</span>
                                            <p className="ementa-text"><strong>Ementa:</strong> {item.ementa}</p>

                                            {ai && (
                                                <button
                                                    onClick={() => handleResumirEmenta(item.ementa, item.id)}
                                                    className="btn-secondary"
                                                    disabled={loadingResumoId === item.id}
                                                    style={{marginTop: '10px'}}
                                                >
                                                    {loadingResumoId === item.id ? 'Resumindo...' : 'Resumir com IA'}
                                                </button>
                                            )}

                                            {loadingResumoId === item.id && <p className="resumo-loading"><em>Carregando resumo...</em></p>}
                                            {resumosEmentas[item.id] && (
                                                <div className="resumo-ia" style={{marginTop: '10px', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #b3daff', borderRadius: '4px'}}>
                                                    <strong>Resumo IA:</strong>
                                                    <p style={{whiteSpace: 'pre-wrap'}}>{resumosEmentas[item.id]}</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                         <p style={{marginTop: '20px'}}><strong>Fonte dos Dados:</strong> Banco de dados simulado para fins de demonstração.</p>
                    </div>
                );
            case 'legislacao':
                return (
                    <div className="card">
                        <h2>Legislação Compilada (Vade Mecum Digital)</h2>
                        <p>Tenha acesso rápido e atualizado aos principais dispositivos legais brasileiros.</p>
                         <p><em>(Esta seção ainda é descritiva. Funcionalidades interativas serão implementadas futuramente.)</em></p>
                    </div>
                );
            case 'analisePeti':
                return (
                    <div className="card">
                        <h2>Análise de Petições com IA <span className="badge badge-ia">IA</span> <span className="badge badge-pro">PRO</span></h2>
                        {!ai && <p style={{color: 'orange', fontWeight: 'bold', border: '1px solid orange', padding: '10px', borderRadius: '4px'}}>A funcionalidade de Análise de Petições com IA está desabilitada. Verifique se a API Key do Gemini está configurada corretamente no ambiente de execução.</p>}
                        {ai && (
                            <>
                                <p>Cole o texto da sua petição abaixo para receber uma análise estruturada, identificando pontos fortes, frágeis, sugestões de jurisprudência e artigos de lei relevantes.</p>
                                <div className="form-section">
                                    <div className="form-group">
                                        <label htmlFor="peticaoParaAnalise">Texto da Petição:</label>
                                        <textarea
                                            id="peticaoParaAnalise"
                                            rows={15}
                                            value={peticaoParaAnalise}
                                            onChange={(e) => setPeticaoParaAnalise(e.target.value)}
                                            placeholder="Cole aqui o texto completo da sua petição inicial, contestação, recurso, etc."
                                            style={{width: '100%', boxSizing: 'border-box'}}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAnalisarPeticao}
                                        className="btn-primary"
                                        disabled={loadingAnalisePeticao || !peticaoParaAnalise.trim()}
                                    >
                                        {loadingAnalisePeticao ? 'Analisando...' : 'Analisar Petição com IA'}
                                    </button>
                                </div>
                                {loadingAnalisePeticao && <p>Analisando petição, por favor aguarde... Isso pode levar alguns instantes.</p>}
                                {resultadoAnalisePeticao && !loadingAnalisePeticao && (
                                    <div className="result-section">
                                        <h3>Resultado da Análise</h3>
                                        <div className="markdown-result" dangerouslySetInnerHTML={{ __html: resultadoAnalisePeticao.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

                                    </div>
                                )}
                            </>
                        )}
                        <p style={{marginTop: '20px'}}><strong>LGPD e Confidencialidade:</strong> O texto da sua petição é enviado para análise pela IA e não é armazenado permanentemente pelo Lex Pro Brasil após a conclusão da análise. Recomendamos não incluir dados excessivamente sensíveis ou pessoais identificáveis não essenciais para a análise da tese jurídica.</p>
                    </div>
                );
            case 'calculadoras':
                return <CalculadoraMonetaria />;
            case 'geradorDocs':
                return (
                    <div className="card">
                        <h2>Gerador de Documentos</h2>
                        <div className="form-section">
                            <h3>Configurar Documento</h3>
                            <div className="form-group">
                                <label htmlFor="tipoDocumentoGerador">Tipo de Documento:</label>
                                <select
                                    id="tipoDocumentoGerador"
                                    value={tipoDocumentoGerador}
                                    onChange={(e) => {
                                        setTipoDocumentoGerador(e.target.value);
                                        setDocumentoGeradoTexto('');
                                    }}
                                >
                                    <option value="">Selecione o tipo</option>
                                    <option value="procuracaoAdJudicia">Procuração Ad Judicia</option>
                                    <option value="contratoHonorarios">Contrato de Honorários Advocatícios</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="clienteSelecionadoGerador">Cliente:</label>
                                <select
                                    id="clienteSelecionadoGerador"
                                    value={clienteSelecionadoGerador}
                                    onChange={(e) => {
                                        setClienteSelecionadoGerador(e.target.value)
                                        setDocumentoGeradoTexto('');
                                    }}
                                    disabled={clientes.length === 0}
                                >
                                    <option value="">Selecione um cliente</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                                    ))}
                                </select>
                                {clientes.length === 0 && <p style={{color: 'orange', fontSize: '0.9em'}}>Nenhum cliente cadastrado. Adicione clientes na seção "Gestão de Clientes".</p>}
                            </div>
                            <button
                                onClick={handleGerarDocumento}
                                className="btn-primary"
                                disabled={!tipoDocumentoGerador || !clienteSelecionadoGerador || loadingGeracaoDoc}
                            >
                                {loadingGeracaoDoc ? 'Gerando...' : 'Gerar Documento'}
                            </button>
                        </div>

                        {documentoGeradoTexto && !loadingGeracaoDoc && (
                            <div className="result-section">
                                <h3>Documento Gerado</h3>
                                <textarea
                                    value={documentoGeradoTexto}
                                    readOnly
                                    rows={20}
                                    style={{width: '100%', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9em', border: '1px solid #ccc', padding: '10px', boxSizing: 'border-box'}}
                                    aria-label="Texto do documento gerado"
                                ></textarea>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(documentoGeradoTexto);
                                        toast.info("Texto do documento copiado para a área de transferência!");
                                    }}
                                    className="btn-secondary"
                                    style={{marginTop: '10px'}}
                                >
                                    Copiar Texto
                                </button>
                                <p style={{fontSize: '0.9em', marginTop: '10px', color: '#6c757d'}}>
                                    Revise o documento gerado e preencha os campos indicados com "[PREENCHER...]" ou "[ESPECIFICAR...]".
                                </p>
                            </div>
                        )}
                        {loadingGeracaoDoc && <p>Gerando documento, por favor aguarde...</p>}
                         <p style={{marginTop: '20px'}}><strong>LGPD:</strong> Os dados do cliente são utilizados exclusivamente para a geração deste documento e não são armazenados de forma adicional.</p>
                    </div>
                );
            case 'controleFinanceiro':
                const totalAReceber = calcularTotalAReceber();
                const totalDespesasMes = calcularTotalDespesasMesAtual();
                const honorariosRegistrados = registrosFinanceiros.filter(r => r.tipo === 'honorario') as Honorario[];
                const despesasRegistradas = registrosFinanceiros.filter(r => r.tipo === 'despesa') as Despesa[];

                return (
                    <div className="card">
                        <h2>Controle Financeiro do Escritório</h2>

                        <div className="financial-summary-panel form-section" style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center', paddingBottom: '20px'}}>
                            <div>
                                <h4>Total a Receber</h4>
                                <p style={{fontSize: '1.5em', color: '#28a745', fontWeight: 'bold'}}>{formatCurrency(totalAReceber)}</p>
                            </div>
                            <div>
                                <h4>Despesas (Mês Atual)</h4>
                                <p style={{fontSize: '1.5em', color: '#dc3545', fontWeight: 'bold'}}>{formatCurrency(totalDespesasMes)}</p>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Lançamento de Honorários</h3>
                            <form onSubmit={handleAddHonorario}>
                                <div className="form-group">
                                    <label htmlFor="novoHonorarioClienteId">Cliente:</label>
                                    <select id="novoHonorarioClienteId" value={novoHonorarioClienteId} onChange={e => setNovoHonorarioClienteId(e.target.value)} required disabled={clientes.length === 0}>
                                        <option value="">Selecione um cliente</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                    {clientes.length === 0 && <p style={{color: 'orange', fontSize: '0.9em'}}>Nenhum cliente cadastrado.</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="novoHonorarioReferencia">Referência/Processo:</label>
                                    <input type="text" id="novoHonorarioReferencia" value={novoHonorarioReferencia} onChange={e => setNovoHonorarioReferencia(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="novoHonorarioValor">Valor (R$):</label>
                                    <input type="number" step="0.01" id="novoHonorarioValor" value={novoHonorarioValor} onChange={e => setNovoHonorarioValor(e.target.value)} placeholder="Ex: 1500.00" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="novoHonorarioStatus">Status:</label>
                                    <select id="novoHonorarioStatus" value={novoHonorarioStatus} onChange={e => setNovoHonorarioStatus(e.target.value as Honorario['status'])}>
                                        <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                                        <option value="Pago">Pago</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary" disabled={clientes.length === 0}>Lançar Honorário</button>
                            </form>
                            <div className="list-section">
                                <h4>Honorários Lançados</h4>
                                {honorariosRegistrados.length === 0 ? <p>Nenhum honorário lançado.</p> : (
                                    <ul className="data-list">
                                        {honorariosRegistrados.map(h => (
                                            <li key={h.id}>
                                                <span className="data-list-item-prop"><strong>Cliente:</strong> {h.clienteNome}</span>
                                                <span className="data-list-item-prop"><strong>Referência:</strong> {h.referenciaProcesso}</span>
                                                <span className="data-list-item-prop"><strong>Valor:</strong> {formatCurrency(h.valor)}</span>
                                                <span className="data-list-item-prop"><strong>Status:</strong> <span className={`badge badge-status-${h.status.toLowerCase().replace(' ','-')}`}>{h.status}</span></span>
                                                <span className="data-list-item-prop"><strong>Data:</strong> {new Date(h.dataLancamento).toLocaleDateString('pt-BR')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Gestão de Despesas</h3>
                            <form onSubmit={handleAddDespesa}>
                                <div className="form-group">
                                    <label htmlFor="novaDespesaDescricao">Descrição da Despesa:</label>
                                    <input type="text" id="novaDespesaDescricao" value={novaDespesaDescricao} onChange={e => setNovaDespesaDescricao(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="novaDespesaCategoria">Categoria:</label>
                                    <select id="novaDespesaCategoria" value={novaDespesaCategoria} onChange={e => setNovaDespesaCategoria(e.target.value as Despesa['categoria'])}>
                                        <option value="Custas Processuais">Custas Processuais</option>
                                        <option value="Diligências">Diligências</option>
                                        <option value="Transporte">Transporte</option>
                                        <option value="Material de Escritório">Material de Escritório</option>
                                        <option value="Outras">Outras</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="novaDespesaValor">Valor (R$):</label>
                                    <input type="number" step="0.01" id="novaDespesaValor" value={novaDespesaValor} onChange={e => setNovaDespesaValor(e.target.value)} placeholder="Ex: 150.00" required />
                                </div>
                                <button type="submit" className="btn-primary">Lançar Despesa</button>
                            </form>
                             <div className="list-section">
                                <h4>Despesas Lançadas</h4>
                                {despesasRegistradas.length === 0 ? <p>Nenhuma despesa lançada.</p> : (
                                    <ul className="data-list">
                                        {despesasRegistradas.map(d => (
                                            <li key={d.id}>
                                                <span className="data-list-item-prop"><strong>Descrição:</strong> {d.descricao}</span>
                                                <span className="data-list-item-prop"><strong>Categoria:</strong> {d.categoria}</span>
                                                <span className="data-list-item-prop"><strong>Valor:</strong> {formatCurrency(d.valor)}</span>
                                                <span className="data-list-item-prop"><strong>Data:</strong> {new Date(d.dataLancamento).toLocaleDateString('pt-BR')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <p style={{marginTop: '20px'}}><strong>LGPD:</strong> Seus dados financeiros são armazenados localmente no seu navegador e não são compartilhados.</p>
                    </div>
                );
            case 'perfilUsuario':
                return (
                    <div className="card">
                        <h2>Perfil do Usuário</h2>
                        <p>Gerencie suas informações profissionais para personalizar sua experiência e agilizar a geração de documentos.</p>
                        <form onSubmit={handleSavePerfil} className="form-section">
                            <div className="form-group">
                                <label htmlFor="formPerfilNome">Nome Completo do Advogado:</label>
                                <input type="text" id="formPerfilNome" value={formPerfilNome} onChange={e => setFormPerfilNome(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="formPerfilOAB">Número da OAB:</label>
                                <input type="text" id="formPerfilOAB" value={formPerfilOAB} onChange={e => setFormPerfilOAB(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="formPerfilUFOAB">UF da OAB:</label>
                                <input type="text" id="formPerfilUFOAB" value={formPerfilUFOAB} onChange={e => setFormPerfilUFOAB(e.target.value)} placeholder="Ex: SP, RJ, MG" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="formPerfilEmail">E-mail Profissional:</label>
                                <input type="email" id="formPerfilEmail" value={formPerfilEmail} onChange={e => setFormPerfilEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="formPerfilEndereco">Endereço do Escritório:</label>
                                <textarea id="formPerfilEndereco" value={formPerfilEndereco} onChange={e => setFormPerfilEndereco(e.target.value)} rows={3}></textarea>
                            </div>
                            <button type="submit" className="btn-primary">Salvar Perfil</button>
                        </form>
                        <p style={{marginTop: '20px'}}><strong>LGPD:</strong> Seus dados de perfil são armazenados localmente no seu navegador e são utilizados para preencher automaticamente informações em documentos gerados pelo sistema.</p>
                    </div>
                );
            case 'seguranca':
                return (
                    <div className="card">
                        <h2>Segurança</h2>
                        <p>Sua tranquilidade e a proteção dos seus dados são nossa prioridade.</p>
                        <h4>Medidas de Segurança (descritivo):</h4>
                        <ul>
                            <li>Autenticação de Dois Fatores (2FA) - <em>(Planejado para futura implementação)</em></li>
                            <li>Criptografia de Ponta a Ponta para dados sensíveis em trânsito e em repouso - <em>(Conceito)</em></li>
                            <li>Conformidade com a LGPD: Todos os dados, especialmente os de clientes e processos, são tratados com o mais alto rigor, garantindo os direitos dos titulares. O armazenamento local atual reforça o controle do usuário sobre seus dados.</li>
                        </ul>
                         <p><em>(Esta seção ainda é descritiva, com ênfase nos conceitos de segurança a serem aplicados.)</em></p>
                    </div>
                );
            case 'notificacoes':
                return (
                    <div className="card">
                        <h2>Configurações de Notificações</h2>
                        <p>Personalize como e quando você deseja ser notificado pelo Lex Pro Brasil.</p>
                        <p><em>(Esta seção ainda é descritiva. Funcionalidades interativas como configuração de alertas por e-mail/push para prazos e movimentações serão implementadas futuramente.)</em></p>
                    </div>
                );
            case 'planoAssinatura':
                return (
                    <div className="card">
                        <h2>Plano de Assinatura</h2>
                        <p>Desbloqueie todo o potencial do Lex Pro Brasil com nosso plano profissional.</p>
                        <h4>Plano Lex Pro Essencial (Gratuito)</h4>
                        <ul>
                            <li>Cadastro de Clientes (ilimitado)</li>
                            <li>Cadastro de Processos (ilimitado)</li>
                            <li>Agenda e Prazos (Básica)</li>
                            <li>Calculadora de Atualização Monetária</li>
                            <li>Gerador de Documentos (com templates básicos)</li>
                            <li>Controle Financeiro Básico</li>
                            <li>Perfil do Usuário</li>
                        </ul>
                        <h4>Plano Lex Pro Avançado <span className="badge badge-pro">PRO</span></h4>
                        <ul>
                            <li><strong>Todos os recursos do Essencial, mais:</strong></li>
                            <li>Pesquisa de Jurisprudência Unificada com Resumo por IA <span className="badge badge-ia">IA</span></li>
                            <li>Análise de Petições com IA <span className="badge badge-ia">IA</span></li>
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

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

const styleSheet = document.styleSheets[0];
if (styleSheet) {
    const addRuleIfNotExists = (ruleText: string) => {
        const selector = ruleText.substring(0, ruleText.indexOf('{')).trim();
        let exists = false;
        for (const rule of Array.from(styleSheet.cssRules)) {
            if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            styleSheet.insertRule(ruleText, styleSheet.cssRules.length);
        }
    };

    const cssRules = [
        `.btn-secondary { background-color: #6c757d; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em; transition: background-color 0.3s ease; margin-right: 10px; }`,
        `.btn-secondary:hover { background-color: #5a6268; }`,
        `.btn-secondary:disabled { background-color: #adb5bd; cursor: not-allowed; }`,
        `.btn-danger { background-color: #dc3545; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em; transition: background-color 0.3s ease; }`,
        `.btn-danger:hover { background-color: #c82333; }`,
        `.ementa-text { white-space: pre-wrap; margin-bottom: 10px; }`,
        `.juris-item { border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom:15px; }`,
        `.juris-item:last-child { border-bottom: none; }`,
        `.resumo-loading { color: #0059b3; font-style: italic; }`,
        `.badge-status-ativo { background-color: #28a745; color: white; padding: 0.25em 0.5em; border-radius: 0.25rem; font-size: 0.8em;}`,
        `.badge-status-suspenso { background-color: #ffc107; color: black; padding: 0.25em 0.5em; border-radius: 0.25rem; font-size: 0.8em;}`,
        `.badge-status-arquivado { background-color: #6c757d; color: white; padding: 0.25em 0.5em; border-radius: 0.25rem; font-size: 0.8em;}`,
        `.badge-status-extinto { background-color: #dc3545; color: white; padding: 0.25em 0.5em; border-radius: 0.25rem; font-size: 0.8em;}`,
        `.badge-status-aguardando-pagamento { background-color: #ffc107; color: black; padding: 0.25em 0.5em; border-radius: 0.25rem; font-size: 0.8em;}`,
        `.badge-status-pago { background-color: #28a745; color: white; padding: 0.25em 0.5em; border-radius: 0.25rem; font-size: 0.8em;}`,
        `.financial-summary-panel > div { flex: 1; margin: 0 10px; padding: 15px; background-color: #e9ecef; border-radius: 5px; }`,
        `.markdown-result { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin-top: 15px; white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; line-height: 1.5; }`,
        `.markdown-result strong { font-weight: bold; color: #003366; }`,
        `.eventos-list li { border-left-width: 5px; border-left-style: solid; }`,
        `.evento-tipo-prazo-processual { border-left-color: #dc3545; }`, /* Red for deadlines */
        `.evento-tipo-audiência { border-left-color: #ffc107; }`, /* Yellow for hearings */
        `.evento-tipo-reunião { border-left-color: #17a2b8; }`, /* Teal for meetings */
        `.evento-tipo-outro { border-left-color: #6c757d; }`, /* Grey for other */
        `.badge-evento-prazo-processual { background-color: #dc3545; color: white;}`,
        `.badge-evento-audiência { background-color: #ffc107; color: black;}`,
        `.badge-evento-reunião { background-color: #17a2b8; color: white;}`,
        `.badge-evento-outro { background-color: #6c757d; color: white;}`,
        `.ia-section { background-color: #e6f7ff; padding: 20px; border-radius: 5px; margin-bottom: 30px; border: 1px solid #b3daff; }`,
        `.ia-section h3 .badge-ia { background-color: #007bff; color: white; }`
    ];

    cssRules.forEach(ruleText => {
        try {
            const selector = ruleText.substring(0, ruleText.indexOf('{')).trim();
            let ruleExists = false;
            if (styleSheet && styleSheet.cssRules) {
                for (let i = 0; i < styleSheet.cssRules.length; i++) {
                    const existingRule = styleSheet.cssRules[i];
                    if (existingRule instanceof CSSStyleRule && existingRule.selectorText === selector) {
                        ruleExists = true;
                        break;
                    }
                }
            }
            if (!ruleExists) {
                 styleSheet.insertRule(ruleText, styleSheet.cssRules.length);
            }
        } catch (e) {
            console.warn("Could not add CSS rule (it might already exist or stylesheet is inaccessible):", ruleText, e);
        }
    });
}
