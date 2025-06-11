
import React, { useState, useEffect, FormEvent } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import CalculadoraMonetaria from './CalculadoraMonetaria';
import CalculadoraPrazos from './CalculadoraPrazos';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Box,
    List,
    ListItemButton,
    ListItemText,
    FormControlLabel,
    Switch,
    IconButton,
    ListSubheader,
    Typography,
    Link
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

// Icons will still be imported directly
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import GavelIcon from '@mui/icons-material/Gavel';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import KeyIcon from '@mui/icons-material/Key';


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
    documentos?: File[]; // Arquivos associados ao processo
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
    tribunal: string; // Can be API alias label or local DB code
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

interface Lei {
  id: string;
  nome: string;
  sigla: string;
  link: string;
}

interface NotificacoesConfig {
    emailPrazos: boolean;
    pushAudiencias: boolean;
    resumoSemanal: boolean;
}

const leisDB: Lei[] = [
  { id: 'cf88', nome: 'Constituição da República Federativa do Brasil de 1988', sigla: 'CF/88', link: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm' },
  { id: 'cc', nome: 'Código Civil - Lei nº 10.406/2002', sigla: 'CC', link: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm' },
  { id: 'cpc', nome: 'Código de Processo Civil - Lei nº 13.105/2015', sigla: 'CPC/15', link: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm' },
  { id: 'cp', nome: 'Código Penal - Decreto-Lei nº 2.848/1940', sigla: 'CP', link: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm' },
  { id: 'cpp', nome: 'Código de Processo Penal - Decreto-Lei nº 3.689/1941', sigla: 'CPP', link: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm' },
  { id: 'clt', nome: 'Consolidação das Leis do Trabalho - Decreto-Lei nº 5.452/1943', sigla: 'CLT', link: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm' },
  { id: 'ctn', nome: 'Código Tributário Nacional - Lei nº 5.172/1966', sigla: 'CTN', link: 'http://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
  { id: 'cdc', nome: 'Código de Defesa do Consumidor - Lei nº 8.078/1990', sigla: 'CDC', link: 'http://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm' },
  { id: 'lei8112', nome: 'Regime Jurídico dos Servidores Públicos Civis da União - Lei nº 8.112/1990', sigla: 'Lei 8.112/90', link: 'http://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm' },
  { id: 'lei8666', nome: 'Antiga Lei de Licitações e Contratos Administrativos - Lei nº 8.666/1993 (Revogada)', sigla: 'Lei 8.666/93', link: 'http://www.planalto.gov.br/ccivil_03/leis/l8666cons.htm' },
  { id: 'lei14133', nome: 'Nova Lei de Licitações e Contratos Administrativos - Lei nº 14.133/2021', sigla: 'Lei 14.133/21', link: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm' },
  { id: 'lgpd', nome: 'Lei Geral de Proteção de Dados Pessoais - Lei nº 13.709/2018', sigla: 'LGPD', link: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm' },
  { id: 'lei9099', nome: 'Juizados Especiais Cíveis e Criminais - Lei nº 9.099/1995', sigla: 'Lei 9.099/95', link: 'http://www.planalto.gov.br/ccivil_03/leis/l9099.htm' },
  { id: 'lei11340', nome: 'Lei Maria da Penha - Lei nº 11.340/2006', sigla: 'Lei Maria da Penha', link: 'http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm' },
  { id: 'eca', nome: 'Estatuto da Criança e do Adolescente - Lei nº 8.069/1990', sigla: 'ECA', link: 'http://www.planalto.gov.br/ccivil_03/leis/l8069.htm' },
  { id: 'estatutoidoso', nome: 'Estatuto do Idoso - Lei nº 10.741/2003', sigla: 'Estatuto do Idoso', link: 'http://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm' },
];

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

const datajudTribunalOptions = [
    // Tribunais Superiores
    { value: 'api_publica_tst', label: 'TST (API Datajud)', group: 'Tribunais Superiores' },
    { value: 'api_publica_tse', label: 'TSE (API Datajud)', group: 'Tribunais Superiores' },
    { value: 'api_publica_stj', label: 'STJ (API Datajud)', group: 'Tribunais Superiores' },
    { value: 'api_publica_stm', label: 'STM (API Datajud)', group: 'Tribunais Superiores' },
    // Justiça Federal
    { value: 'api_publica_trf1', label: 'TRF1 (API Datajud)', group: 'Justiça Federal' },
    { value: 'api_publica_trf2', label: 'TRF2 (API Datajud)', group: 'Justiça Federal' },
    { value: 'api_publica_trf3', label: 'TRF3 (API Datajud)', group: 'Justiça Federal' },
    { value: 'api_publica_trf4', label: 'TRF4 (API Datajud)', group: 'Justiça Federal' },
    { value: 'api_publica_trf5', label: 'TRF5 (API Datajud)', group: 'Justiça Federal' },
    { value: 'api_publica_trf6', label: 'TRF6 (API Datajud)', group: 'Justiça Federal' },
    // Justiça Estadual
    { value: 'api_publica_tjac', label: 'TJAC (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjal', label: 'TJAL (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjam', label: 'TJAM (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjap', label: 'TJAP (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjba', label: 'TJBA (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjce', label: 'TJCE (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjdft', label: 'TJDFT (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjes', label: 'TJES (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjgo', label: 'TJGO (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjma', label: 'TJMA (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjmg', label: 'TJMG (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjms', label: 'TJMS (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjmt', label: 'TJMT (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjpa', label: 'TJPA (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjpb', label: 'TJPB (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjpe', label: 'TJPE (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjpi', label: 'TJPI (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjpr', label: 'TJPR (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjrj', label: 'TJRJ (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjrn', label: 'TJRN (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjro', label: 'TJRO (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjrr', label: 'TJRR (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjrs', label: 'TJRS (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjsc', label: 'TJSC (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjse', label: 'TJSE (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjsp', label: 'TJSP (API Datajud)', group: 'Justiça Estadual' },
    { value: 'api_publica_tjto', label: 'TJTO (API Datajud)', group: 'Justiça Estadual' },
    // Justiça do Trabalho
    ...Array.from({ length: 24 }, (_, i) => ({ value: `api_publica_trt${i + 1}`, label: `TRT${i + 1} (API Datajud)`, group: 'Justiça do Trabalho' })),
    // Justiça Eleitoral (Exemplos, podem precisar de ajuste no alias se o padrão for diferente)
    { value: 'api_publica_tre-ac', label: 'TRE-AC (API Datajud)', group: 'Justiça Eleitoral' },
    { value: 'api_publica_tre-al', label: 'TRE-AL (API Datajud)', group: 'Justiça Eleitoral' },
    // ... Adicionar todos os TREs conforme a lista, atentando para o formato do alias.
    // Justiça Militar
    { value: 'api_publica_tjmmg', label: 'TJMMG (API Datajud)', group: 'Justiça Militar' },
    { value: 'api_publica_tjmrs', label: 'TJMRS (API Datajud)', group: 'Justiça Militar' },
    { value: 'api_publica_tjmsp', label: 'TJMSP (API Datajud)', group: 'Justiça Militar' },
];

const allTribunalOptions = [
    { value: 'Todos', label: 'Todos (Dados Locais Simulado)', group: "Local" },
    ...datajudTribunalOptions,
    { value: 'STJ_local', label: 'STJ (Dados Locais Simulado)', group: "Local" },
    { value: 'TJSP_local', label: 'TJSP (Dados Locais Simulado)', group: "Local" },
    { value: 'STF_local', label: 'STF (Dados Locais Simulado)', group: "Local" },
    { value: 'TST_local', label: 'TST (Dados Locais Simulado)', group: "Local" },
    { value: 'TRF1_local', label: 'TRF1 (Dados Locais Simulado)', group: "Local" },
];


const App: React.FC = () => {
    const [activeModule, setActiveModule] = useState<string>('dashboard');
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null);
    const [inputGeminiApiKey, setInputGeminiApiKey] = useState<string>('');
    const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);


    // Estado para Processos
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [novoProcesso, setNovoProcesso] = useState<Omit<Processo, 'id' | 'documentos'>>({
        numero: '', comarca: '', vara: '', natureza: '', partes: '', objeto: '', valorCausa: '', status: 'Ativo'
    });
    const [arquivosNovoProcesso, setArquivosNovoProcesso] = useState<File[]>([]);
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
    const [resultadosJuris, setResultadosJuris] = useState<JurisprudenciaItem[]>([]); 
    const [termoBuscaJuris, setTermoBuscaJuris] = useState<string>('');
    const [filtroTribunalJuris, setFiltroTribunalJuris] = useState<string>('api_publica_tjsp'); 
    const [loadingJurisSearch, setLoadingJurisSearch] = useState<boolean>(false);
    const [resumosEmentas, setResumosEmentas] = useState<Record<string, string>>({});
    const [loadingResumoId, setLoadingResumoId] = useState<string | null>(null);

    // Estado para Legislação
    const [termoBuscaLeis, setTermoBuscaLeis] = useState<string>('');


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

    // Estado para sub-módulo de Calculadoras
    const [activeCalculator, setActiveCalculator] = useState<string>('monetaria');

    // Estado para Configurações de Notificações
    const initialNotificacoesConfig: NotificacoesConfig = {
        emailPrazos: true,
        pushAudiencias: false, 
        resumoSemanal: true,
    };
    const [configNotificacoes, setConfigNotificacoes] = useState<NotificacoesConfig>(initialNotificacoesConfig);


    // Carregar dados do localStorage ao iniciar e inicializar AI Client
    useEffect(() => {
        const storedApiKey = localStorage.getItem('lexProGeminiApiKey');
        const envApiKey = process.env.API_KEY;
        let activeKeyToTry: string | null = null;

        if (storedApiKey && storedApiKey.trim() !== "") {
            activeKeyToTry = storedApiKey;
            setGeminiApiKey(storedApiKey);
            setInputGeminiApiKey(storedApiKey);
            console.log("Chave API do Gemini carregada do localStorage.");
        } else if (envApiKey && envApiKey.trim() !== "") {
            activeKeyToTry = envApiKey;
            setGeminiApiKey(envApiKey); // Define como ativa, mas não salva no localStorage automaticamente
            setInputGeminiApiKey(envApiKey); // Preenche o input para o usuário ver e salvar se quiser
            console.log("Chave API do Gemini carregada das variáveis de ambiente (fallback).");
        }

        if (activeKeyToTry) {
            try {
                const client = new GoogleGenAI({ apiKey: activeKeyToTry });
                setAiClient(client);
                // toast.success("Cliente Gemini AI inicializado.", { autoClose: 2000 });
            } catch (error) {
                console.error("Erro ao inicializar GoogleGenAI:", error);
                setAiClient(null);
                setGeminiApiKey(null); // Limpa se a inicialização falhar
                // Não mostra toast de erro aqui, pois pode ser comum se a chave for inválida/ausente
            }
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
        try {
            const client = new GoogleGenAI({ apiKey: keyToSave });
            // Teste superficial, uma chamada real seria melhor mas pode custar
            // Se a inicialização não falhar, consideramos válida por agora.
            localStorage.setItem('lexProGeminiApiKey', keyToSave);
            setGeminiApiKey(keyToSave);
            setAiClient(client);
            toast.success("Chave API do Gemini salva e ativada!");
        } catch (error) {
            console.error("Erro ao tentar salvar/inicializar com a nova chave API:", error);
            toast.error("Chave API inválida ou erro na inicialização. Verifique a chave e tente novamente.");
            setAiClient(null); // Garante que o cliente antigo não seja usado se a nova chave for inválida
            setGeminiApiKey(null);
            localStorage.removeItem('lexProGeminiApiKey'); // Remove chave inválida do LS
        }
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
               setActiveModule(mainModule.subItems[0].id); // Activate first sub-item by default
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

    const handleProcessoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setNovoProcesso(prev => ({ ...prev, [name as string]: value }));
    };

    const handleArquivosNovoProcessoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setArquivosNovoProcesso(prevArquivos => [...prevArquivos, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoverArquivoNovoProcesso = (fileNameToRemove: string) => {
        setArquivosNovoProcesso(prevArquivos => prevArquivos.filter(file => file.name !== fileNameToRemove));
    };


    const handleAddProcesso = (e: FormEvent) => {
        e.preventDefault();
        if (!novoProcesso.numero.trim()) {
            toast.error("O número do processo é obrigatório.");
            return;
        }
        const processoComId: Processo = {
            ...novoProcesso,
            id: new Date().toISOString(),
            documentos: arquivosNovoProcesso
        };
        setProcessos(prev => [processoComId, ...prev]); 
        setNovoProcesso({ numero: '', comarca: '', vara: '', natureza: '', partes: '', objeto: '', valorCausa: '', status: 'Ativo' });
        setArquivosNovoProcesso([]);
        const fileInput = document.getElementById('documentosProcesso') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        toast.success("Processo adicionado com sucesso!");
    };

    const handleAnalisarTextoParaProcesso = async () => {
        if (!ensureAiClient()) return;

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
            const response: GenerateContentResponse = await aiClient!.models.generateContent({ // Not null due to ensureAiClient
                model: 'gemini-2.5-flash-preview-04-17',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            let jsonStr = response.text.trim();
            const fenceRegex = new RegExp('^```(\\w*)?\\s*\\n?(.*?)\\n?\\s*```$', 's');
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
                jsonStr = match[2].trim();
            }

            const parsedData = JSON.parse(jsonStr) as Partial<Omit<Processo, 'id' | 'valorCausa' | 'status' | 'documentos'>>;

            setNovoProcesso(prev => ({
                ...prev,
                numero: parsedData.numero || '',
                comarca: parsedData.comarca || '',
                vara: parsedData.vara || '',
                natureza: parsedData.natureza || '',
                partes: parsedData.partes || '',
                objeto: parsedData.objeto || '',
            }));
            setTextoProcessoIA('');
            toast.success("Formulário preenchido com os dados extraídos pela IA. Revise antes de salvar.");

        } catch (error) {
            console.error("Erro ao analisar texto para processo com IA:", error);
            toast.error("Ocorreu um erro ao tentar analisar o texto com a IA. Verifique o console para mais detalhes ou tente novamente.");
        } finally {
            setLoadingAnaliseProcessoIA(false);
        }
    };

    const handleFocusPrimeiroCampoProcesso = () => {
        const primeiroCampo = document.getElementById('numero-processo-cnj'); 
        if (primeiroCampo) {
            primeiroCampo.focus();
            const formSection = primeiroCampo.closest('.form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                primeiroCampo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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

        if (editingClienteId) {
            setClientes(prevClientes =>
                prevClientes.map(c =>
                    c.id === editingClienteId ? { ...novoCliente, id: editingClienteId } : c
                )
            );
            toast.success("Cliente atualizado com sucesso!");
        } else {
            const clienteComId: Cliente = { ...novoCliente, id: new Date().toISOString() };
            setClientes(prev => [clienteComId, ...prev]);
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

    const handleSearchJurisprudencia = async (e?: FormEvent) => {
        if (e) e.preventDefault();
    
        if (!termoBuscaJuris.trim()) {
            toast.info("Por favor, insira um termo para a pesquisa de jurisprudência.");
            setResultadosJuris([]); 
            return;
        }
    
        setLoadingJurisSearch(true);
        setResultadosJuris([]); 
    
        const selectedTribunalOption = allTribunalOptions.find(opt => opt.value === filtroTribunalJuris);
    
        if (selectedTribunalOption && selectedTribunalOption.value.startsWith('api_publica_')) {
            const apiAlias = selectedTribunalOption.value;
            const datajudApiKey = 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='; // Hardcoded API Key - Not recommended for production
            const apiUrl = `/${apiAlias}/_search`; 
    
            const queryBody = {
                query: {
                    multi_match: {
                        query: termoBuscaJuris,
                        fields: ["ementa.texto", "classe.nome", "orgaoJulgador.nome", "numero", "relator.nome", "dadosBasicos.numero", "inteiroTeor"]
                    }
                },
                size: 20 
            };
    
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': datajudApiKey,
                    },
                    body: JSON.stringify(queryBody),
                });
    
                if (!response.ok) {
                    let errorData;
                    const errorText = await response.text();
                    try {
                        errorData = JSON.parse(errorText);
                    } catch (jsonError) {
                        errorData = { message: response.statusText, details: errorText };
                    }
                    console.error(`Erro na API DataJud (${selectedTribunalOption.label}):`, response.status, errorData);
                    toast.error(`Erro ao buscar (${selectedTribunalOption.label}): ${errorData.message || response.statusText}. Detalhes no console.`);
                    setResultadosJuris(jurisprudenciaDBDefault.filter(item => item.ementa.toLowerCase().includes(termoBuscaJuris.toLowerCase())));
                    return;
                }
    
                const data = await response.json();
    
                if (data && data.hits && data.hits.hits) {
                    const mappedResults: JurisprudenciaItem[] = data.hits.hits.map((hit: any) => {
                        const source = hit._source;
                        let dataPublicacaoStr = 'Não informada';
                        
                        const dataPublicacaoValue = source.dataPublicacao || source.dataDisponibilizacao;
                        if (dataPublicacaoValue) {
                            try {
                                let dateInput = dataPublicacaoValue;
                                if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
                                   dateInput += 'T00:00:00Z'; 
                                }
                                dataPublicacaoStr = new Date(dateInput).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                            } catch (dateError) {
                                console.warn('Erro ao formatar data de publicação:', dataPublicacaoValue, dateError);
                                dataPublicacaoStr = typeof dataPublicacaoValue === 'string' ? dataPublicacaoValue : 'Data inválida';
                            }
                        }
        
                        return {
                            id: hit._id || `${apiAlias}-${Math.random().toString(36).substring(7)}`,
                            tribunal: selectedTribunalOption.label, 
                            processo: source.numero || source.dadosBasicos?.numero || 'Número não informado',
                            publicacao: dataPublicacaoStr,
                            relator: source.relator?.nome || source.julgador?.nome || 'Relator não informado',
                            ementa: source.ementa?.texto || source.inteiroTeor || source.conteudoDocumento || 'Ementa não disponível',
                        };
                    });
                    setResultadosJuris(mappedResults);
                    if (mappedResults.length === 0) {
                        toast.info(`Nenhuma jurisprudência encontrada na API do ${selectedTribunalOption.label} para os termos informados. Tentando busca local.`);
                        setResultadosJuris(jurisprudenciaDBDefault.filter(item => item.ementa.toLowerCase().includes(termoBuscaJuris.toLowerCase())));
                    } else {
                        toast.success(`${mappedResults.length} resultado(s) encontrado(s) na API do ${selectedTribunalOption.label}.`);
                    }
                } else {
                    console.warn(`Estrutura de resposta inesperada da API DataJud (${selectedTribunalOption.label}):`, data);
                    toast.warn(`Nenhum resultado encontrado no ${selectedTribunalOption.label} ou formato de resposta inesperado. Tentando busca local.`);
                     setResultadosJuris(jurisprudenciaDBDefault.filter(item => item.ementa.toLowerCase().includes(termoBuscaJuris.toLowerCase())));
                }
        
            } catch (error) {
                console.error(`Falha ao buscar jurisprudência na API DataJud (${selectedTribunalOption.label}):`, error);
                toast.error(`Falha na comunicação com a API (${selectedTribunalOption.label}). Tentando busca local.`);
                setResultadosJuris(jurisprudenciaDBDefault.filter(item => item.ementa.toLowerCase().includes(termoBuscaJuris.toLowerCase())));
            } finally {
                setLoadingJurisSearch(false);
            }
        } else { 
            let filteredLocal = jurisprudenciaDBDefault;
            if (filtroTribunalJuris !== 'Todos') {
                const localKey = filtroTribunalJuris.replace('_local', '').replace('_simulado', '');
                filteredLocal = jurisprudenciaDBDefault.filter(item => 
                    item.tribunal.toUpperCase() === localKey.toUpperCase()
                );
            }
            const finalLocalResults = filteredLocal.filter(item => 
                item.ementa.toLowerCase().includes(termoBuscaJuris.toLowerCase()) ||
                item.processo.toLowerCase().includes(termoBuscaJuris.toLowerCase()) ||
                item.relator.toLowerCase().includes(termoBuscaJuris.toLowerCase())
            );
            setResultadosJuris(finalLocalResults);
            if (finalLocalResults.length === 0) {
                toast.info(`Nenhuma jurisprudência local encontrada para "${termoBuscaJuris}" no filtro "${selectedTribunalOption?.label || filtroTribunalJuris}".`);
            } else {
                 toast.success(`${finalLocalResults.length} resultado(s) encontrado(s) nos dados locais (${selectedTribunalOption?.label || filtroTribunalJuris}).`);
            }
            setLoadingJurisSearch(false);
        }
    };
    

    const handleResumirEmenta = async (ementa: string, itemId: string) => {
        if (!ensureAiClient()) return;
        
        setLoadingResumoId(itemId);
        setResumosEmentas(prev => ({ ...prev, [itemId]: '' }));

        const prompt = `Você é um assistente jurídico especialista. Resuma a seguinte ementa de forma clara e concisa, em no máximo 3 frases, destacando o ponto principal da decisão: "${ementa}"`;

        try {
            const response: GenerateContentResponse = await aiClient!.models.generateContent({ // Not null due to ensureAiClient
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
        docFinal = docFinal.replace(/\[NOME DO CLIENTE\]/g, cliente.nome || '[NOME DO CLIENTE PENDENTE]');
        docFinal = docFinal.replace(/\[CPF DO CLIENTE\]/g, cliente.cpfCnpj || '[CPF/CNPJ PENDENTE]');
        docFinal = docFinal.replace(/\[ENDEREÇO DO CLIENTE\]/g, cliente.endereco || '[ENDEREÇO PENDENTE]');
        docFinal = docFinal.replace(/\[PREENCHER NACIONALIDADE\]/g, '[PREENCHER NACIONALIDADE]');
        docFinal = docFinal.replace(/\[PREENCHER ESTADO CIVIL\]/g, '[PREENCHER ESTADO CIVIL]');
        docFinal = docFinal.replace(/\[PREENCHER PROFISSÃO\]/g, '[PREENCHER PROFISSÃO]');
        docFinal = docFinal.replace(/\[PREENCHER CEP\]/g, '[PREENCHER CEP]');
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

    const handleAnalisarPeticao = async () => {
        if (!ensureAiClient()) return;
        
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
            const response: GenerateContentResponse = await aiClient!.models.generateContent({ // Not null due to ensureAiClient
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
        setEventos(prev => [...prev, novoEventoItem].sort((a,b) => {
            const dateA = new Date(a.data.split('-').join('/') + 'T00:00:00');
            const dateB = new Date(b.data.split('-').join('/') + 'T00:00:00');
            return dateA.getTime() - dateB.getTime();
        }));
        setFormEventoData(new Date().toISOString().split('T')[0]);
        setFormEventoTitulo('');
        setFormEventoTipo('Prazo Processual');
        setFormEventoDescricao('');
        toast.success("Evento adicionado com sucesso!");
    };

    const handleNotificacaoChange = (key: keyof NotificacoesConfig) => {
        setConfigNotificacoes(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveNotificacoesConfig = () => {
        toast.success("Configurações de notificações salvas!");
    };


    const renderModuleContent = () => {
        switch (activeModule) {
            case 'dashboard':
                const processosAtivos = processos.filter(p => p.status === 'Ativo').length;
                const totalAReceberDash = calcularTotalAReceber();

                const today = new Date();
                today.setHours(0, 0, 0, 0); 

                const proximosEventos = eventos
                    .filter(evento => {
                        const [year, month, day] = evento.data.split('-').map(Number);
                        const eventoDate = new Date(year, month - 1, day); 
                        eventoDate.setHours(0,0,0,0);
                        return eventoDate >= today;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(a.data.split('-').join('/') + 'T00:00:00');
                        const dateB = new Date(b.data.split('-').join('/') + 'T00:00:00');
                        return dateA.getTime() - dateB.getTime();
                    })
                    .slice(0, 3);


                return (
                    <div>
                        <h2>Painel de Controle</h2>
                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <GavelIcon sx={{ fontSize: 40, color: 'primary.main', alignSelf: 'center', mb:1 }}/>
                                <h3>Processos Ativos</h3>
                                <div className="metric-value">{processosAtivos}</div>
                                <div className="metric-label">Processos em Andamento</div>
                            </div>

                            <div className="dashboard-card">
                                <EventNoteIcon sx={{ fontSize: 40, color: 'secondary.main', alignSelf: 'center', mb:1 }}/>
                                <h3>Próximos Prazos/Eventos</h3>
                                {proximosEventos.length > 0 ? (
                                    <ul>
                                        {proximosEventos.map(evento => (
                                            <li key={evento.id}>
                                                <span className="event-title">{evento.titulo}</span>
                                                <span className="event-date">
                                                    {new Date(evento.data + 'T03:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="metric-label" style={{textAlign:'center', marginTop: '20px'}}>Nenhum prazo ou evento futuro agendado.</p>
                                )}
                            </div>

                            <div className="dashboard-card">
                                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'success.main', alignSelf: 'center', mb:1 }}/>
                                <h3>Financeiro Rápido</h3>
                                <div className="metric-value">{formatCurrency(totalAReceberDash)}</div>
                                <div className="metric-label">Total a Receber</div>
                            </div>

                            <div className="dashboard-card">
                                 <SpeedIcon sx={{ fontSize: 40, color: 'info.main', alignSelf: 'center', mb:1 }}/>
                                <h3>Ações Rápidas</h3>
                                <div className="actions-container">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddCircleOutlineIcon />}
                                        onClick={() => {
                                            handleMenuClick('cadastroProcessos', 'gestao');
                                            setTimeout(handleFocusPrimeiroCampoProcesso, 0);
                                        }}
                                    >
                                        Adicionar Processo
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<EventNoteIcon />}
                                        onClick={() => handleMenuClick('agendaPrazos', 'gestao')}
                                    >
                                        Agendar Prazo/Evento
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'cadastroProcessos':
                return (
                    <div className="card">
                        <h2>Cadastro de Processos</h2>

                        <div className="form-section ia-section">
                            <h3>🤖 Cadastrar Processo com IA <span className="badge badge-ia">Beta</span></h3>
                            {!aiClient && (
                                <Typography variant="body1" color="orange" fontWeight="bold" sx={{border: '1px solid orange', padding: '10px', borderRadius: '4px', mt:1, mb:1}}>
                                    A funcionalidade de cadastro com IA está desabilitada.
                                    Por favor, configure sua chave API do Google Gemini em "Configurações e Segurança &gt; Configurar Chaves de IA" para habilitá-la.
                                </Typography>
                            )}
                            {aiClient && (
                                <Box component="div" sx={{ mt: 2 }}>
                                    <p>Cole abaixo um trecho do processo (ex: cabeçalho da petição, intimação) e a IA tentará preencher o formulário.</p>
                                     <TextField
                                        id="textoProcessoIA"
                                        label="Texto para Análise pela IA"
                                        multiline
                                        rows={8}
                                        value={textoProcessoIA}
                                        onChange={(e) => setTextoProcessoIA(e.target.value)}
                                        placeholder="Cole o texto aqui..."
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleAnalisarTextoParaProcesso}
                                        disabled={loadingAnaliseProcessoIA || !textoProcessoIA.trim()}
                                        sx={{ mt: 1, mb: 1 }}
                                    >
                                        {loadingAnaliseProcessoIA ? 'Analisando com IA...' : 'Analisar e Preencher Formulário'}
                                    </Button>
                                    {loadingAnaliseProcessoIA && <p><em>Aguarde, analisando texto...</em></p>}
                                </Box>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Adicionar Novo Processo Manualmente</h3>
                            <Box component="form" onSubmit={handleAddProcesso} sx={{ mt: 1 }}>
                                <TextField
                                    id="numero-processo-cnj" 
                                    name="numero"
                                    label="Número do Processo (CNJ)"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={novoProcesso.numero}
                                    onChange={handleProcessoInputChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    name="comarca"
                                    label="Comarca"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={novoProcesso.comarca}
                                    onChange={handleProcessoInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    name="vara"
                                    label="Vara"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={novoProcesso.vara}
                                    onChange={handleProcessoInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    name="natureza"
                                    label="Natureza da Ação"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={novoProcesso.natureza}
                                    onChange={handleProcessoInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    name="partes"
                                    label="Partes Envolvidas"
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={novoProcesso.partes}
                                    onChange={handleProcessoInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    name="objeto"
                                    label="Objeto da Ação"
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={novoProcesso.objeto}
                                    onChange={handleProcessoInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    name="valorCausa"
                                    label="Valor da Causa (R$)"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={novoProcesso.valorCausa}
                                    onChange={handleProcessoInputChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="status-select-label">Status</InputLabel>
                                    <Select
                                        labelId="status-select-label"
                                        id="status"
                                        name="status"
                                        value={novoProcesso.status}
                                        label="Status"
                                        onChange={handleProcessoInputChange}
                                    >
                                        <MenuItem value="Ativo">Ativo</MenuItem>
                                        <MenuItem value="Suspenso">Suspenso</MenuItem>
                                        <MenuItem value="Arquivado">Arquivado</MenuItem>
                                        <MenuItem value="Extinto">Extinto</MenuItem>
                                    </Select>
                                </FormControl>
                                <Box className="form-group" sx={{ mt: 2, mb: 2}}> 
                                    <InputLabel htmlFor="documentosProcesso" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                                        Documentos do Processo (Opcional):
                                    </InputLabel>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                        startIcon={<AttachFileIcon />}
                                    >
                                        Selecionar Arquivos
                                        <input 
                                          type="file" 
                                          id="documentosProcesso" 
                                          multiple 
                                          hidden
                                          onChange={handleArquivosNovoProcessoChange} 
                                        />
                                    </Button>
                                    {arquivosNovoProcesso.length > 0 && (
                                        <List dense sx={{ mt: 1, backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                            {arquivosNovoProcesso.map((file, index) => (
                                                <ListItemButton key={index} sx={{borderBottom: '1px solid #eee'}}>
                                                    <ListItemText 
                                                        primary={file.name} 
                                                        secondary={`(${(file.size / 1024).toFixed(2)} KB)`} 
                                                    />
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoverArquivoNovoProcesso(file.name)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2, mb: 2 }}
                                >
                                    Adicionar Processo
                                </Button>
                            </Box>
                        </div>
                        <div className="list-section">
                            <h3>Processos Cadastrados</h3>
                            {processos.length === 0 ? (
                                <div className="empty-state-container" role="region" aria-labelledby="empty-processos-heading">
                                    <FolderIcon sx={{fontSize: 60, color: 'primary.light' }} aria-hidden="true"/>
                                    <h4 id="empty-processos-heading">Nenhum processo por aqui</h4>
                                    <p>Comece cadastrando seu primeiro processo para gerenciá-lo.</p>
                                    <Button onClick={handleFocusPrimeiroCampoProcesso} variant="contained" color="primary">
                                        Adicionar Primeiro Processo
                                    </Button>
                                </div>
                            ) : (
                                <List className="data-list">
                                    {processos.map(p => (
                                        <ListItemButton component="li" key={p.id} sx={{display: 'block', backgroundColor: '#e9ecef', mb:1, borderRadius: '5px', border: '1px solid #dee2e6'}}>
                                            <ListItemText primaryTypographyProps={{fontWeight: 'bold'}} primary={`Número: ${p.numero}`} />
                                            <ListItemText secondary={`Comarca: ${p.comarca} - Vara: ${p.vara}`} />
                                            <ListItemText secondary={`Natureza: ${p.natureza}`} />
                                            <ListItemText secondary={`Partes: ${p.partes}`} />
                                            <ListItemText secondary={`Objeto: ${p.objeto}`} />
                                            <ListItemText secondary={`Valor: R$ ${p.valorCausa}`} />
                                            <ListItemText 
                                                secondary={
                                                    <Box component="span" className={`badge badge-status-${p.status.toLowerCase()}`}>
                                                        {p.status}
                                                    </Box>
                                                } 
                                                secondaryTypographyProps={{ component: 'div'}}
                                            />
                                            {p.documentos && p.documentos.length > 0 && (
                                                <Box className="data-list-item-prop" sx={{mt:1}}>
                                                    <InputLabel sx={{fontWeight:'bold', fontSize:'0.9em'}}>Documentos:</InputLabel>
                                                    <List dense disablePadding sx={{listStyleType: 'disc', pl: 2, fontSize: '0.9em'}}>
                                                        {p.documentos.map((doc, index) => (
                                                             <ListItemText key={index} primary={`${doc.name} (${(doc.size / 1024).toFixed(2)} KB)`} sx={{pl:0}}/>
                                                        ))}
                                                    </List>
                                                </Box>
                                            )}
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </div>
                         <p style={{marginTop: '20px'}}><strong>LGPD & Persistência:</strong> Todos os dados, exceto arquivos, são salvos localmente. Arquivos enviados são para esta sessão e não persistem após fechar o navegador.</p>
                    </div>
                );
            case 'agendaPrazos':
                const sortedEventos = [...eventos].sort((a, b) => {
                    const dateA = new Date(a.data.split('-').join('/') + 'T00:00:00');
                    const dateB = new Date(b.data.split('-').join('/') + 'T00:00:00');
                    return dateA.getTime() - dateB.getTime();
                });
                return (
                    <div className="card">
                        <h2>Agenda e Prazos</h2>
                        <div className="form-section">
                            <h3>Adicionar Novo Evento</h3>
                            <Box component="form" onSubmit={handleAddEvento}>
                                <TextField
                                    id="formEventoData"
                                    label="Data do Evento"
                                    type="date"
                                    value={formEventoData}
                                    onChange={e => setFormEventoData(e.target.value)}
                                    required
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    id="formEventoTitulo"
                                    label="Título do Evento"
                                    value={formEventoTitulo}
                                    onChange={e => setFormEventoTitulo(e.target.value)}
                                    required
                                    placeholder="Ex: Audiência João Silva"
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="formEventoTipo-label">Tipo</InputLabel>
                                    <Select
                                        labelId="formEventoTipo-label"
                                        id="formEventoTipo"
                                        value={formEventoTipo}
                                        label="Tipo"
                                        onChange={e => setFormEventoTipo(e.target.value as EventoAgenda['tipo'])}
                                    >
                                        <MenuItem value="Prazo Processual">Prazo Processual</MenuItem>
                                        <MenuItem value="Audiência">Audiência</MenuItem>
                                        <MenuItem value="Reunião">Reunião</MenuItem>
                                        <MenuItem value="Outro">Outro</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    id="formEventoDescricao"
                                    label="Descrição (Opcional)"
                                    value={formEventoDescricao}
                                    onChange={e => setFormEventoDescricao(e.target.value)}
                                    multiline
                                    rows={3}
                                    placeholder="Detalhes adicionais, link da videochamada, etc."
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button type="submit" variant="contained" color="primary" sx={{mt:1}}>Salvar Evento</Button>
                            </Box>
                        </div>
                        <div className="list-section">
                            <h3>Próximos Eventos</h3>
                            {sortedEventos.length === 0 ? <p>Nenhum evento agendado.</p> : (
                                <List className="data-list eventos-list">
                                    {sortedEventos.map(evento => (
                                        <ListItemButton 
                                            component="li" 
                                            key={evento.id} 
                                            className={`evento-item evento-tipo-${evento.tipo.toLowerCase().replace(/\s+/g, '-')}`}
                                            sx={{display: 'block', backgroundColor: '#e9ecef', mb:1, borderRadius: '5px', border: '1px solid #dee2e6'}}
                                        >
                                            <ListItemText primary={`Data: ${new Date(evento.data + 'T03:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} />
                                            <ListItemText secondary={`Título: ${evento.titulo}`} />
                                            <ListItemText 
                                                secondary={
                                                    <Box component="span" className={`badge badge-evento-${evento.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {evento.tipo}
                                                    </Box>
                                                } 
                                                secondaryTypographyProps={{ component: 'div'}}
                                            />
                                            {evento.descricao && <ListItemText secondary={`Descrição: ${evento.descricao}`} />}
                                        </ListItemButton>
                                    ))}
                                </List>
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
                            <Box component="form" onSubmit={handleSubmitClienteForm}>
                                <TextField 
                                    label="Nome Completo"
                                    id="nomeCliente" name="nome" 
                                    value={novoCliente.nome} 
                                    onChange={handleClienteInputChange} 
                                    required fullWidth margin="normal" InputLabelProps={{ shrink: true }}
                                />
                                <TextField 
                                    label="CPF/CNPJ"
                                    id="cpfCnpj" name="cpfCnpj" 
                                    value={novoCliente.cpfCnpj} 
                                    onChange={handleClienteInputChange} 
                                    fullWidth margin="normal" InputLabelProps={{ shrink: true }}
                                />
                                <TextField 
                                    label="E-mail"
                                    type="email"
                                    id="emailCliente" name="email" 
                                    value={novoCliente.email} 
                                    onChange={handleClienteInputChange} 
                                    fullWidth margin="normal" InputLabelProps={{ shrink: true }}
                                />
                                <TextField 
                                    label="Telefone"
                                    id="telefoneCliente" name="telefone" 
                                    value={novoCliente.telefone} 
                                    onChange={handleClienteInputChange} 
                                    fullWidth margin="normal" InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="Endereço"
                                    id="enderecoCliente" name="endereco" 
                                    value={novoCliente.endereco} 
                                    onChange={handleClienteInputChange} 
                                    multiline rows={3}
                                    fullWidth margin="normal" InputLabelProps={{ shrink: true }}
                                />
                                <Button type="submit" variant="contained" color="primary" sx={{mr: editingClienteId ? 1 : 0, mt:1}}>
                                    {editingClienteId ? 'Salvar Alterações' : 'Adicionar Cliente'}
                                </Button>
                                {editingClienteId && (
                                    <Button type="button" onClick={handleCancelEditCliente} variant="outlined" color="secondary" sx={{mt:1}}>
                                        Cancelar Edição
                                    </Button>
                                )}
                            </Box>
                        </div>

                        <div className="list-section">
                            <h3>Clientes Cadastrados</h3>
                             <TextField
                                label="Buscar Cliente"
                                id="buscaCliente"
                                placeholder="Digite nome, CPF/CNPJ ou e-mail para buscar..."
                                value={termoBuscaCliente}
                                onChange={(e) => setTermoBuscaCliente(e.target.value)}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2, maxWidth: '500px' }}
                            />

                            {clientesFiltrados.length === 0 && termoBuscaCliente.trim() !== '' && <p>Nenhum cliente encontrado com os termos da busca.</p>}
                            {clientesFiltrados.length === 0 && termoBuscaCliente.trim() === '' && <p>Nenhum cliente cadastrado.</p>}

                            {clientesFiltrados.length > 0 && (
                                <List className="data-list">
                                    {clientesFiltrados.map(c => (
                                        <ListItemButton component="li" key={c.id} sx={{display: 'block', backgroundColor: '#e9ecef', mb:1, borderRadius: '5px', border: '1px solid #dee2e6'}}>
                                            <ListItemText primary={`Nome: ${c.nome}`} primaryTypographyProps={{fontWeight: 'bold'}}/>
                                            <ListItemText secondary={`CPF/CNPJ: ${c.cpfCnpj}`} />
                                            <ListItemText secondary={`E-mail: ${c.email}`} />
                                            <ListItemText secondary={`Telefone: ${c.telefone}`} />
                                            <ListItemText secondary={`Endereço: ${c.endereco}`} />
                                            <Box sx={{ marginTop: '10px' }}>
                                                <Button onClick={() => handleStartEditCliente(c)} variant="outlined" color="secondary" sx={{ marginRight: '10px' }}>Editar</Button>
                                                <Button onClick={() => handleDeleteCliente(c.id)} variant="contained" color="error">Excluir</Button>
                                            </Box>
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </div>
                        <p style={{marginTop: '20px'}}><strong>LGPD:</strong> Asseguramos a privacidade e proteção dos dados dos seus clientes. Dados salvos localmente no seu navegador.</p>
                    </div>
                );
            case 'jurisprudencia':
                 const groupedTribunalOptions = allTribunalOptions.reduce((acc, option) => {
                    const group = option.group || 'Outros';
                    if (!acc[group]) {
                        acc[group] = [];
                    }
                    acc[group].push(option);
                    return acc;
                }, {} as Record<string, typeof allTribunalOptions>);

                return (
                    <div className="card">
                        <h2>Jurisprudência Unificada</h2>
                        <p>Pesquise jurisprudência diretamente na API pública do Datajud (CNJ) ou no banco de dados local simulado.</p>
                        
                        <Box component="form" onSubmit={handleSearchJurisprudencia} className="form-section" sx={{display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mt: 2}}>
                            <TextField
                                id="termoBuscaJuris"
                                label="Termo de Pesquisa"
                                value={termoBuscaJuris}
                                onChange={(e) => setTermoBuscaJuris(e.target.value)}
                                placeholder="Ex: dano moral, apelação, nome do relator..."
                                variant="outlined"
                                sx={{flexGrow: 1, minWidth: '300px'}}
                                InputLabelProps={{ shrink: true }}
                            />
                            <FormControl variant="outlined" sx={{minWidth: 280}}>
                                <InputLabel id="filtroTribunalJuris-label">Tribunal/Fonte</InputLabel>
                                <Select
                                    labelId="filtroTribunalJuris-label"
                                    id="filtroTribunalJuris"
                                    value={filtroTribunalJuris}
                                    label="Tribunal/Fonte"
                                    onChange={(e: SelectChangeEvent<string>) => setFiltroTribunalJuris(e.target.value)}
                                >
                                    {Object.entries(groupedTribunalOptions).flatMap(([groupName, options]) => [
                                        <ListSubheader key={groupName} sx={{backgroundColor: '#f0f0f0', color: 'black', fontWeight:'bold'}}>{groupName}</ListSubheader>,
                                        ...options.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))
                                    ])}
                                </Select>
                            </FormControl>
                            <Button type="submit" variant="contained" color="primary" disabled={loadingJurisSearch} sx={{height: '56px'}}>
                                {loadingJurisSearch ? 'Pesquisando...' : 'Pesquisar'}
                            </Button>
                        </Box>

                        <div className="list-section" aria-live="polite">
                            <h3>Resultados da Pesquisa</h3>
                            {resultadosJuris.length === 0 && !loadingJurisSearch && <p>Nenhuma jurisprudência encontrada para os critérios informados.</p>}
                            {loadingJurisSearch && <p>Carregando resultados...</p>}
                            {!loadingJurisSearch && resultadosJuris.length > 0 && (
                                <List className="data-list">
                                    {resultadosJuris.map(item => (
                                        <ListItemButton component="li" key={item.id} className="juris-item" aria-busy={loadingResumoId === item.id} sx={{display: 'block', backgroundColor: '#e9ecef', mb:1, borderRadius: '5px', border: '1px solid #dee2e6'}}>
                                            <ListItemText primary={`Tribunal/Fonte: ${item.tribunal}`} primaryTypographyProps={{fontWeight: 'bold'}}/>
                                            <ListItemText secondary={`Processo: ${item.processo}`} />
                                            <ListItemText secondary={`Publicação: ${item.publicacao}`} />
                                            <ListItemText secondary={`Relator: ${item.relator}`} />
                                            <ListItemText 
                                                primary="Ementa:"
                                                secondary={item.ementa} 
                                                primaryTypographyProps={{fontWeight:'medium', display: 'block', mb:0.5}} 
                                                secondaryTypographyProps={{component:'p', className:'ementa-text'}}
                                            />

                                            {aiClient ? (
                                                <Button
                                                    onClick={() => handleResumirEmenta(item.ementa, item.id)}
                                                    variant="outlined"
                                                    color="secondary"
                                                    disabled={loadingResumoId === item.id}
                                                    sx={{marginTop: '10px'}}
                                                >
                                                    {loadingResumoId === item.id ? 'Resumindo...' : 'Resumir com IA'}
                                                </Button>
                                            ) : (
                                                 <Typography variant="body2" color="orange" sx={{marginTop: '10px', fontSize:'0.9em'}}>
                                                    Para resumir com IA, configure sua chave API em "Configurações e Segurança &gt; Configurar Chaves de IA".
                                                 </Typography>
                                             )}

                                            {loadingResumoId === item.id && <p className="resumo-loading"><em>Carregando resumo...</em></p>}
                                            {resumosEmentas[item.id] && (
                                                <div className="resumo-ia" style={{marginTop: '10px', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #b3daff', borderRadius: '4px'}}>
                                                    <strong>Resumo IA:</strong>
                                                    <p style={{whiteSpace: 'pre-wrap'}}>{resumosEmentas[item.id]}</p>
                                                </div>
                                            )}
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </div>
                         <p style={{marginTop: '20px', fontSize: '0.85em', color: '#6c757d'}}>
                             <strong>Fonte dos Dados:</strong> Resultados "(API Datajud)" são obtidos em tempo real via API Pública do Datajud (CNJ).
                             Resultados "(Dados Locais Simulado)" são dados de exemplo.
                         </p>
                    </div>
                );
            case 'legislacao':
                const leisFiltradas = leisDB.filter(lei => {
                    if (!termoBuscaLeis.trim()) return true;
                    const termo = termoBuscaLeis.toLowerCase();
                    return (
                        lei.nome.toLowerCase().includes(termo) ||
                        lei.sigla.toLowerCase().includes(termo)
                    );
                });
                return (
                    <div className="card">
                        <h2>Legislação Compilada (Vade Mecum Digital)</h2>
                        <p>Consulte rapidamente os principais códigos e leis do Brasil. Os links direcionam para as fontes oficiais no site do Planalto.</p>
                        
                        <Box sx={{ my: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Buscar Lei ou Código (Nome ou Sigla)"
                                placeholder="Ex: CF/88, Código Civil, LGPD..."
                                value={termoBuscaLeis}
                                onChange={(e) => setTermoBuscaLeis(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        {leisFiltradas.length > 0 ? (
                            <List>
                                {leisFiltradas.map(lei => (
                                    <ListItemButton
                                        key={lei.id}
                                        component="a"
                                        href={lei.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ 
                                            border: '1px solid #eee', 
                                            mb: 1, 
                                            borderRadius: '4px',
                                            '&:hover': { backgroundColor: '#f0f8ff'} 
                                        }}
                                    >
                                        <ListItemText
                                            primary={lei.nome}
                                            secondary={lei.sigla}
                                            primaryTypographyProps={{ fontWeight: 'medium', color: 'primary.main' }}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        ) : (
                            <p>Nenhuma lei encontrada para "{termoBuscaLeis}". Tente um termo de busca diferente.</p>
                        )}
                        <p style={{fontSize: '0.9em', color: '#6c757d', marginTop: '20px', textAlign: 'center'}}>
                            <strong>Aviso:</strong> Mantenha-se sempre atualizado consultando as fontes oficiais. Os links fornecidos direcionam ao site do Planalto.
                        </p>
                    </div>
                );
            case 'analisePeti':
                return (
                    <div className="card">
                        <h2>Análise de Petições com IA <span className="badge badge-ia">IA</span> <span className="badge badge-pro">PRO</span></h2>
                        {!aiClient && 
                            <Typography variant="body1" color="orange" fontWeight="bold" sx={{border: '1px solid orange', padding: '10px', borderRadius: '4px', mt:1, mb:1}}>
                                A funcionalidade de Análise de Petições com IA está desabilitada.
                                Por favor, configure sua chave API do Google Gemini em "Configurações e Segurança &gt; Configurar Chaves de IA" para habilitá-la.
                            </Typography>
                        }
                        {aiClient && (
                            <>
                                <p>Cole o texto da sua petição abaixo para receber uma análise estruturada, identificando pontos fortes, frágeis, sugestões de jurisprudência e artigos de lei relevantes.</p>
                                <Box className="form-section">
                                     <TextField
                                        id="peticaoParaAnalise"
                                        label="Texto da Petição"
                                        multiline
                                        rows={15}
                                        value={peticaoParaAnalise}
                                        onChange={(e) => setPeticaoParaAnalise(e.target.value)}
                                        placeholder="Cole aqui o texto completo da sua petição inicial, contestação, recurso, etc."
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleAnalisarPeticao}
                                        disabled={loadingAnalisePeticao || !peticaoParaAnalise.trim()}
                                        sx={{mt:1}}
                                    >
                                        {loadingAnalisePeticao ? 'Analisando...' : 'Analisar Petição com IA'}
                                    </Button>
                                </Box>
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
                return (
                    <div className="card">
                        <h2>Calculadoras Jurídicas</h2>
                        <Box className="sub-module-nav" sx={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee', display: 'flex', gap: 1 }}>
                            <Button
                                variant={activeCalculator === 'monetaria' ? 'contained' : 'outlined'}
                                onClick={() => setActiveCalculator('monetaria')}
                            >
                                Atualização Monetária
                            </Button>
                            <Button
                                 variant={activeCalculator === 'prazos' ? 'contained' : 'outlined'}
                                onClick={() => setActiveCalculator('prazos')}
                            >
                                Prazos Processuais
                            </Button>
                        </Box>

                        {activeCalculator === 'monetaria' && <CalculadoraMonetaria />}
                        {activeCalculator === 'prazos' && <CalculadoraPrazos />}
                        
                        {(activeCalculator !== 'monetaria' && activeCalculator !== 'prazos') && (
                             <>
                                <hr style={{marginTop: '30px'}} />
                                <h4>Outras Calculadoras (descritivo):</h4>
                                <ul>
                                    <li>Calculadora de Horas Extras e Verbas Rescisórias (Trabalhista)</li>
                                    <li>Calculadora de Custas Processuais</li>
                                </ul>
                                <p><em>(As demais calculadoras ainda são descritivas.)</em></p>
                             </>
                        )}
                    </div>
                );
            case 'geradorDocs':
                return (
                    <div className="card">
                        <h2>Gerador de Documentos</h2>
                        <Box className="form-section">
                            <h3>Configurar Documento</h3>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="tipoDocumentoGerador-label">Tipo de Documento</InputLabel>
                                <Select
                                    labelId="tipoDocumentoGerador-label"
                                    id="tipoDocumentoGerador"
                                    value={tipoDocumentoGerador}
                                    label="Tipo de Documento"
                                    onChange={(e: SelectChangeEvent<string>) => {
                                        setTipoDocumentoGerador(e.target.value);
                                        setDocumentoGeradoTexto('');
                                    }}
                                >
                                    <MenuItem value=""><em>Selecione o tipo</em></MenuItem>
                                    <MenuItem value="procuracaoAdJudicia">Procuração Ad Judicia</MenuItem>
                                    <MenuItem value="contratoHonorarios">Contrato de Honorários Advocatícios</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal" disabled={clientes.length === 0}>
                                <InputLabel id="clienteSelecionadoGerador-label">Cliente</InputLabel>
                                <Select
                                    labelId="clienteSelecionadoGerador-label"
                                    id="clienteSelecionadoGerador"
                                    value={clienteSelecionadoGerador}
                                    label="Cliente"
                                    onChange={(e: SelectChangeEvent<string>) => {
                                        setClienteSelecionadoGerador(e.target.value)
                                        setDocumentoGeradoTexto('');
                                    }}
                                >
                                     <MenuItem value=""><em>Selecione um cliente</em></MenuItem>
                                    {clientes.map(cliente => (
                                        <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>
                                    ))}
                                </Select>
                                {clientes.length === 0 && <p style={{color: 'orange', fontSize: '0.9em', marginTop: '5px'}}>Nenhum cliente cadastrado. Adicione clientes na seção "Gestão de Clientes".</p>}
                            </FormControl>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGerarDocumento}
                                disabled={!tipoDocumentoGerador || !clienteSelecionadoGerador || loadingGeracaoDoc}
                                sx={{mt:1}}
                            >
                                {loadingGeracaoDoc ? 'Gerando...' : 'Gerar Documento'}
                            </Button>
                        </Box>

                        {documentoGeradoTexto && !loadingGeracaoDoc && (
                            <div className="result-section">
                                <h3>Documento Gerado</h3>
                                <TextField
                                    value={documentoGeradoTexto}
                                    InputProps={{readOnly: true}}
                                    multiline
                                    rows={20}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    aria-label="Texto do documento gerado"
                                />
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(documentoGeradoTexto);
                                        toast.info("Texto do documento copiado para a área de transferência!");
                                    }}
                                    sx={{marginTop: '10px'}}
                                >
                                    Copiar Texto
                                </Button>
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
                const totalAReceberCtrl = calcularTotalAReceber(); 
                const totalDespesasMes = calcularTotalDespesasMesAtual();
                const honorariosRegistrados = registrosFinanceiros.filter(r => r.tipo === 'honorario') as Honorario[];
                const despesasRegistradas = registrosFinanceiros.filter(r => r.tipo === 'despesa') as Despesa[];

                return (
                    <div className="card">
                        <h2>Controle Financeiro do Escritório</h2>

                        <div className="financial-summary-panel form-section" style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center', paddingBottom: '20px'}}>
                            <div>
                                <h4>Total a Receber</h4>
                                <p style={{fontSize: '1.5em', color: '#28a745', fontWeight: 'bold'}}>{formatCurrency(totalAReceberCtrl)}</p>
                            </div>
                            <div>
                                <h4>Despesas (Mês Atual)</h4>
                                <p style={{fontSize: '1.5em', color: '#dc3545', fontWeight: 'bold'}}>{formatCurrency(totalDespesasMes)}</p>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Lançamento de Honorários</h3>
                            <Box component="form" onSubmit={handleAddHonorario}>
                                <FormControl fullWidth margin="normal" disabled={clientes.length === 0}>
                                    <InputLabel id="novoHonorarioClienteId-label">Cliente</InputLabel>
                                    <Select 
                                        labelId="novoHonorarioClienteId-label"
                                        id="novoHonorarioClienteId" 
                                        name="clienteId" 
                                        value={novoHonorarioClienteId} 
                                        label="Cliente"
                                        onChange={(e: SelectChangeEvent<string>) => setNovoHonorarioClienteId(e.target.value)} required>
                                        <MenuItem value=""><em>Selecione um cliente</em></MenuItem>
                                        {clientes.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                                    </Select>
                                    {clientes.length === 0 && <p style={{color: 'orange', fontSize: '0.9em', marginTop: '5px'}}>Nenhum cliente cadastrado.</p>}
                                </FormControl>
                                <TextField
                                    name="referenciaProcesso"
                                    label="Referência/Processo"
                                    value={novoHonorarioReferencia} 
                                    onChange={e => setNovoHonorarioReferencia(e.target.value)} 
                                    required 
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    name="valor"
                                    label="Valor (R$)"
                                    type="number"
                                    inputProps={{ step: "0.01" }}
                                    value={novoHonorarioValor} 
                                    onChange={e => setNovoHonorarioValor(e.target.value)} 
                                    placeholder="Ex: 1500.00" 
                                    required 
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="novoHonorarioStatus-label">Status</InputLabel>
                                    <Select
                                        labelId="novoHonorarioStatus-label"
                                        id="novoHonorarioStatus"
                                        name="status"
                                        value={novoHonorarioStatus}
                                        label="Status"
                                        onChange={(e: SelectChangeEvent<Honorario['status']>) => setNovoHonorarioStatus(e.target.value as Honorario['status'])}
                                    >
                                        <MenuItem value="Aguardando Pagamento">Aguardando Pagamento</MenuItem>
                                        <MenuItem value="Pago">Pago</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button type="submit" variant="contained" color="primary" disabled={clientes.length === 0} sx={{mt:1}}>Lançar Honorário</Button>
                            </Box>
                            <div className="list-section">
                                <h4>Honorários Lançados</h4>
                                {honorariosRegistrados.length === 0 ? <p>Nenhum honorário lançado.</p> : (
                                    <List className="data-list">
                                        {honorariosRegistrados.map(h => (
                                            <ListItemButton component="li" key={h.id} sx={{display: 'block', backgroundColor: '#e9ecef', mb:1, borderRadius: '5px', border: '1px solid #dee2e6'}}>
                                                <ListItemText primary={`Cliente: ${h.clienteNome}`} primaryTypographyProps={{fontWeight: 'bold'}} />
                                                <ListItemText secondary={`Referência: ${h.referenciaProcesso}`} />
                                                <ListItemText secondary={`Valor: ${formatCurrency(h.valor)}`} />
                                                <ListItemText 
                                                    secondary={
                                                        <Box component="span" className={`badge badge-status-${h.status.toLowerCase().replace(' ','-')}`}>
                                                            {h.status}
                                                        </Box>
                                                    } 
                                                    secondaryTypographyProps={{ component: 'div'}}
                                                />
                                                <ListItemText secondary={`Data: ${new Date(h.dataLancamento).toLocaleDateString('pt-BR')}`} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Gestão de Despesas</h3>
                            <Box component="form" onSubmit={handleAddDespesa}>
                                <TextField
                                    name="descricaoDespesa"
                                    label="Descrição da Despesa"
                                    value={novaDespesaDescricao}
                                    onChange={e => setNovaDespesaDescricao(e.target.value)}
                                    required
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="novaDespesaCategoria-label">Categoria</InputLabel>
                                    <Select
                                        labelId="novaDespesaCategoria-label"
                                        id="novaDespesaCategoria"
                                        name="categoriaDespesa"
                                        value={novaDespesaCategoria}
                                        label="Categoria"
                                        onChange={(e: SelectChangeEvent<Despesa['categoria']>) => setNovaDespesaCategoria(e.target.value as Despesa['categoria'])}
                                    >
                                        <MenuItem value="Custas Processuais">Custas Processuais</MenuItem>
                                        <MenuItem value="Diligências">Diligências</MenuItem>
                                        <MenuItem value="Transporte">Transporte</MenuItem>
                                        <MenuItem value="Material de Escritório">Material de Escritório</MenuItem>
                                        <MenuItem value="Outras">Outras</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    name="valorDespesa"
                                    label="Valor (R$)"
                                    type="number"
                                    inputProps={{ step: "0.01" }}
                                    value={novaDespesaValor}
                                    onChange={e => setNovaDespesaValor(e.target.value)}
                                    placeholder="Ex: 150.00"
                                    required
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button type="submit" variant="contained" color="primary" sx={{mt:1}}>Lançar Despesa</Button>
                            </Box>
                             <div className="list-section">
                                <h4>Despesas Lançadas</h4>
                                {despesasRegistradas.length === 0 ? <p>Nenhuma despesa lançada.</p> : (
                                    <List className="data-list">
                                        {despesasRegistradas.map(d => (
                                             <ListItemButton component="li" key={d.id} sx={{display: 'block', backgroundColor: '#e9ecef', mb:1, borderRadius: '5px', border: '1px solid #dee2e6'}}>
                                                <ListItemText primary={`Descrição: ${d.descricao}`} primaryTypographyProps={{fontWeight: 'bold'}} />
                                                <ListItemText secondary={`Categoria: ${d.categoria}`} />
                                                <ListItemText secondary={`Valor: ${formatCurrency(d.valor)}`} />
                                                <ListItemText secondary={`Data: ${new Date(d.dataLancamento).toLocaleDateString('pt-BR')}`} />
                                            </ListItemButton>
                                        ))}
                                    </List>
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
                        <Box component="form" onSubmit={handleSavePerfil} className="form-section">
                            <TextField 
                                label="Nome Completo do Advogado" 
                                id="formPerfilNome" 
                                value={formPerfilNome} 
                                onChange={e => setFormPerfilNome(e.target.value)} 
                                fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
                            />
                            <TextField 
                                label="Número da OAB" 
                                id="formPerfilOAB" 
                                value={formPerfilOAB} 
                                onChange={e => setFormPerfilOAB(e.target.value)} 
                                fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
                            />
                            <TextField 
                                label="UF da OAB" 
                                id="formPerfilUFOAB" 
                                value={formPerfilUFOAB} 
                                onChange={e => setFormPerfilUFOAB(e.target.value)} 
                                placeholder="Ex: SP, RJ, MG" 
                                fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
                            />
                            <TextField 
                                label="E-mail Profissional" 
                                type="email" 
                                id="formPerfilEmail" 
                                value={formPerfilEmail} 
                                onChange={e => setFormPerfilEmail(e.target.value)} 
                                fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
                            />
                            <TextField 
                                label="Endereço do Escritório" 
                                id="formPerfilEndereco" 
                                value={formPerfilEndereco} 
                                onChange={e => setFormPerfilEndereco(e.target.value)} 
                                multiline rows={3} 
                                fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
                            />
                            <Button type="submit" variant="contained" color="primary" sx={{mt:1}}>Salvar Perfil</Button>
                        </Box>
                        <p style={{marginTop: '20px'}}><strong>LGPD:</strong> Seus dados de perfil são armazenados localmente no seu navegador e são utilizados para preencher automaticamente informações em documentos gerados pelo sistema.</p>
                    </div>
                );
            case 'configApiKeys':
                 return (
                    <div className="card">
                        <h2>Configurar Chaves de IA</h2>
                        <p>
                            Insira suas chaves de API para habilitar as funcionalidades de Inteligência Artificial.
                            A chave é armazenada localmente no seu navegador e não é enviada para nossos servidores.
                        </p>

                        <Box className="form-section" sx={{mt: 2}}>
                            <h3>Chave API do Google Gemini</h3>
                            <Typography variant="body2" sx={{mb:1}}>
                                Para obter sua chave, acesse o <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</Link>.
                            </Typography>
                            <TextField
                                id="inputGeminiApiKey"
                                label="Sua Chave API do Google Gemini"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={inputGeminiApiKey}
                                onChange={(e) => setInputGeminiApiKey(e.target.value)}
                                placeholder="Cole sua chave API aqui"
                                type="password"
                                InputLabelProps={{ shrink: true }}
                            />
                            <Box sx={{display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap'}}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveApiKey}
                                    startIcon={<KeyIcon />}
                                >
                                    Salvar Chave Gemini
                                </Button>
                                {geminiApiKey && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleRemoveApiKey}
                                    >
                                        Remover Chave
                                    </Button>
                                )}
                            </Box>
                             {geminiApiKey ? (
                                <Typography variant="body2" color="green" sx={{mt:2, fontWeight: 'bold'}}>
                                    Chave API do Gemini configurada e ativa.
                                </Typography>
                            ) : (
                                <Typography variant="body2" color="error" sx={{mt:2, fontWeight: 'bold'}}>
                                    Chave API do Gemini não configurada. As funcionalidades de IA estão desabilitadas.
                                </Typography>
                            )}
                             <Typography variant="caption" display="block" sx={{mt:3, color: 'text.secondary'}}>
                                <strong>Nota de Privacidade:</strong> Sua chave API do Gemini é armazenada apenas no localStorage do seu navegador.
                                Ela é usada para fazer chamadas diretas do seu navegador para os serviços da Google AI.
                                O Lex Pro Brasil não armazena sua chave em servidores remotos.
                            </Typography>
                        </Box>
                    </div>
                );
            case 'notificacoes':
                 return (
                    <div className="card">
                        <h2>Configurações de Notificações</h2>
                        <p>Personalize como e quando você deseja ser notificado pelo Lex Pro Brasil. Suas preferências são salvas automaticamente.</p>
                        
                        <Box sx={{ mt: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={configNotificacoes.emailPrazos}
                                        onChange={() => handleNotificacaoChange('emailPrazos')}
                                        name="emailPrazos"
                                        color="primary"
                                    />
                                }
                                label="Receber e-mail 3 dias antes de um prazo processual."
                                className="switch-label-full-width"
                            />
                             <FormControlLabel
                                control={
                                    <Switch
                                        checked={configNotificacoes.pushAudiencias}
                                        onChange={() => handleNotificacaoChange('pushAudiencias')}
                                        name="pushAudiencias"
                                        color="primary"
                                    />
                                }
                                label="Enviar notificação push para audiências agendadas. (Descritivo/Futuro)"
                                className="switch-label-full-width"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={configNotificacoes.resumoSemanal}
                                        onChange={() => handleNotificacaoChange('resumoSemanal')}
                                        name="resumoSemanal"
                                        color="primary"
                                    />
                                }
                                label="Enviar resumo semanal de atividades por e-mail. (Descritivo/Futuro)"
                                className="switch-label-full-width"
                            />
                        </Box>

                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button 
                                variant="contained" 
                                onClick={handleSaveNotificacoesConfig}
                                >
                                Confirmar Salvamento das Configurações
                            </Button>
                        </Box>
                         <p style={{fontSize: '0.9em', marginTop: '20px', color: '#6c757d'}}>
                            <strong>Nota:</strong> As funcionalidades de envio de e-mail e notificações push são conceituais nesta versão e dependem de infraestrutura de backend não implementada. As configurações são salvas localmente.
                        </p>
                    </div>
                );
            case 'seguranca':
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
            case 'planoAssinatura':
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

// Adiciona regras CSS se não existirem
const styleSheet = document.styleSheets[0];
if (styleSheet) {
    const addRuleIfNotExists = (ruleText: string) => {
        const selector = ruleText.substring(0, ruleText.indexOf('{')).trim();
        let exists = false;
        if (styleSheet && styleSheet.cssRules) {
            try {
                for (const rule of Array.from(styleSheet.cssRules)) {
                    if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    styleSheet.insertRule(ruleText, styleSheet.cssRules.length);
                }
            } catch (e) {
                console.warn(`Could not access or insert CSS rule for selector "${selector}":`, e);
            }
        } else {
             console.warn("Stylesheet or cssRules not available for adding rule:", ruleText);
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
        `.evento-tipo-prazo-processual { border-left-color: #dc3545; }`, 
        `.evento-tipo-audiência { border-left-color: #ffc107; }`, 
        `.evento-tipo-reunião { border-left-color: #17a2b8; }`, 
        `.evento-tipo-outro { border-left-color: #6c757d; }`, 
        `.badge-evento-prazo-processual { background-color: #dc3545; color: white;}`,
        `.badge-evento-audiência { background-color: #ffc107; color: black;}`,
        `.badge-evento-reunião { background-color: #17a2b8; color: white;}`,
        `.badge-evento-outro { background-color: #6c757d; color: white;}`,
        `.ia-section { background-color: #e6f7ff; padding: 20px; border-radius: 5px; margin-bottom: 30px; border: 1px solid #b3daff; }`,
        `.ia-section h3 .badge-ia { background-color: #007bff; color: white; }`,
        `.empty-state-container { text-align: center; padding: 40px 20px; background-color: #f8f9fa; border-radius: 8px; margin-top: 20px; border: 1px dashed #d1d9e0; }`,
        `.empty-state-container svg { margin-bottom: 15px; }`, 
        `.empty-state-container h4 { color: #003366; margin-bottom: 10px; font-size: 1.5em; margin-top: 0;}`,
        `.empty-state-container p { color: #495057; margin-bottom: 20px; font-size: 1em; }`,
        `.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding-top: 10px; }`,
        `.dashboard-card { background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; flex-direction: column; min-height: 200px; justify-content: space-between; }`,
        `.dashboard-card h3 { margin-top: 0; margin-bottom: 10px; font-size: 1.15em; color: #003366; text-align: center; }`,
        `.dashboard-card .metric-value { font-size: 2.2em; font-weight: 600; color: #0059b3; margin-bottom: 5px; text-align: center; line-height: 1.2; }`,
        `.dashboard-card .metric-label { font-size: 0.9em; color: #6c757d; text-align: center; margin-bottom: 10px; flex-grow: 1; }`,
        `.dashboard-card ul { list-style: none; padding: 0; margin: 0; flex-grow: 1; max-height: 100px; overflow-y: auto; }`,
        `.dashboard-card ul li { padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.9em; display: flex; justify-content: space-between; align-items: center; }`,
        `.dashboard-card ul li:last-child { border-bottom: none; }`,
        `.dashboard-card .event-title { font-weight: 500; color: #343a40; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }`,
        `.dashboard-card .event-date { color: #495057; font-size: 0.85em; background-color: #e9ecef; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }`,
        `.dashboard-card .actions-container { margin-top: 15px; display: flex; flex-direction: column; gap: 10px; }`,
        `.dashboard-card .actions-container .MuiButton-root { width: 100%; }`,
        `.switch-label-full-width { display: flex; width: 100%; justify-content: space-between; align-items: center; margin-left: 0 !important; margin-right: 0 !important; padding: 8px 0; border-bottom: 1px solid #eee; }`,
        `.switch-label-full-width .MuiFormControlLabel-label { flex-grow: 1; }`,
        `.switch-label-full-width:last-child { border-bottom: none; }`,
        `.sub-module-nav { display: flex; gap: 8px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }`

    ];

    cssRules.forEach(ruleText => addRuleIfNotExists(ruleText));
}
