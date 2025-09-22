import React from 'react';
import { 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Box 
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { toast } from 'react-toastify';

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface PerfilUsuario {
  nomeCompleto: string;
  oab: string;
  ufOab: string;
  email: string;
  enderecoEscritorio: string;
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

interface DocumentosProps {
  tipoDocumentoGerador: string;
  setTipoDocumentoGerador: React.Dispatch<React.SetStateAction<string>>;
  clienteSelecionadoGerador: string;
  setClienteSelecionadoGerador: React.Dispatch<React.SetStateAction<string>>;
  documentoGeradoTexto: string;
  setDocumentoGeradoTexto: React.Dispatch<React.SetStateAction<string>>;
  clientes: Cliente[];
  perfilUsuario: PerfilUsuario;
}

const Documentos: React.FC<DocumentosProps> = ({ 
  tipoDocumentoGerador,
  setTipoDocumentoGerador,
  clienteSelecionadoGerador,
  setClienteSelecionadoGerador,
  documentoGeradoTexto,
  setDocumentoGeradoTexto,
  clientes,
  perfilUsuario
}) => {
  const [loadingGeracaoDoc, setLoadingGeracaoDoc] = React.useState<boolean>(false);

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
    docFinal = docFinal.replace(/\[ADVOGADO_ESTADO CIVIL\]/g, '[ESTADO CIVIL DO ADVOGADO]');
    docFinal = docFinal.replace(/\[ESPECIFICAR AÇÃO\/DEMANDA\]/g, '[ESPECIFICAR AÇÃO/DEMANDA]');
    docFinal = docFinal.replace(/\[ESPECIFICAR JUÍZO\/VARA\/COMARCA\]/g, '[ESPECIFICAR JUÍZO/VARA/COMARCA]');
    docFinal = docFinal.replace(/\[DETALHAR VALORES E FORMA DE PAGAMENTO\]/g, '[DETALHAR VALORES E FORMA DE PAGAMENTO]');
    docFinal = docFinal.replace(/\[CIDADE PARA FORO\]/g, '[CIDADE PARA FORO]');
    docFinal = docFinal.replace(/\[CIDADE DE EMISSÃO\]/g, '[CIDADE DE EMISSÃO]');
    docFinal = docFinal.replace(/\[DATA POR EXTENSO\]/g, '[DATA POR EXTENSO]');

    setDocumentoGeradoTexto(docFinal);
    setLoadingGeracaoDoc(false);
  };

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
              setClienteSelecionadoGerador(e.target.value);
              setDocumentoGeradoTexto('');
            }}
          >
            <MenuItem value=""><em>Selecione um cliente</em></MenuItem>
            {clientes.map(cliente => (
              <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>
            ))}
          </Select>
          {clientes.length === 0 && <p style={{ color: 'orange', fontSize: '0.9em', marginTop: '5px' }}>Nenhum cliente cadastrado. Adicione clientes na seção "Gestão de Clientes".</p>}
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGerarDocumento}
          disabled={!tipoDocumentoGerador || !clienteSelecionadoGerador || loadingGeracaoDoc}
          sx={{ mt: 1 }}
        >
          {loadingGeracaoDoc ? 'Gerando...' : 'Gerar Documento'}
        </Button>
      </Box>

      {documentoGeradoTexto && !loadingGeracaoDoc && (
        <div className="result-section">
          <h3>Documento Gerado</h3>
          <TextField
            value={documentoGeradoTexto}
            InputProps={{ readOnly: true }}
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
            sx={{ marginTop: '10px' }}
          >
            Copiar Texto
          </Button>
          <p style={{ fontSize: '0.9em', marginTop: '10px', color: '#6c757d' }}>
            Revise o documento gerado e preencha os campos indicados com "[PREENCHER...]" ou "[ESPECIFICAR...]".
          </p>
        </div>
      )}
      {loadingGeracaoDoc && <p>Gerando documento, por favor aguarde...</p>}
      <p style={{ marginTop: '20px' }}><strong>LGPD:</strong> Os dados do cliente são utilizados exclusivamente para a geração deste documento e não são armazenados de forma adicional.</p>
    </div>
  );
};

export default Documentos;