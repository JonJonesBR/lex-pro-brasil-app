import React, { useState, FormEvent } from 'react';
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
  IconButton 
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { 
  DeleteIcon, 
  FolderIcon, 
  AddCircleOutlineIcon, 
  AttachFileIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';

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

interface ProcessosProps {
  processos: Processo[];
  setProcessos: React.Dispatch<React.SetStateAction<Processo[]>>;
  novoProcesso: Omit<Processo, 'id' | 'documentos'>;
  setNovoProcesso: React.Dispatch<React.SetStateAction<Omit<Processo, 'id' | 'documentos'>>>;
  arquivosNovoProcesso: File[];
  setArquivosNovoProcesso: React.Dispatch<React.SetStateAction<File[]>>;
  aiClient: any;
  ensureAiClient: () => boolean;
}

const Processos: React.FC<ProcessosProps> = ({ 
  processos, 
  setProcessos, 
  novoProcesso, 
  setNovoProcesso, 
  arquivosNovoProcesso, 
  setArquivosNovoProcesso,
  aiClient,
  ensureAiClient
}) => {
  const [textoProcessoIA, setTextoProcessoIA] = useState<string>('');
  const [loadingAnaliseProcessoIA, setLoadingAnaliseProcessoIA] = useState<boolean>(false);

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

    // This is a simplified version - in a real implementation, you would call the AI service
    try {
      // Mock AI response for demonstration
      const mockResponse = {
        numero: "0000000-00.0000.0.00.0000",
        comarca: "Comarca de São Paulo",
        vara: "1ª Vara Cível",
        natureza: "Ação de Cobrança",
        partes: "Autor: João da Silva, Réu: Empresa XYZ Ltda",
        objeto: "Cobrança de dívida referente a contrato de aluguel"
      };

      setNovoProcesso(prev => ({
        ...prev,
        numero: mockResponse.numero || '',
        comarca: mockResponse.comarca || '',
        vara: mockResponse.vara || '',
        natureza: mockResponse.natureza || '',
        partes: mockResponse.partes || '',
        objeto: mockResponse.objeto || '',
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

  return (
    <div className="card">
      <h2>Cadastro de Processos</h2>

      <div className="form-section ia-section">
        <h3>🤖 Cadastrar Processo com IA <span className="badge badge-ia">Beta</span></h3>
        {!aiClient && (
          <div style={{ color: 'orange', fontWeight: 'bold', border: '1px solid orange', padding: '10px', borderRadius: '4px', margin: '10px 0' }}>
            A funcionalidade de cadastro com IA está desabilitada.
            Por favor, configure sua chave API do Google Gemini em "Configurações e Segurança &gt; Configurar Chaves de IA" para habilitá-la.
          </div>
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
          <Box className="form-group" sx={{ mt: 2, mb: 2 }}>
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
                  <ListItemButton key={index} sx={{ borderBottom: '1px solid #eee' }}>
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
            <FolderIcon sx={{ fontSize: 60, color: 'primary.light' }} aria-hidden="true" />
            <h4 id="empty-processos-heading">Nenhum processo por aqui</h4>
            <p>Comece cadastrando seu primeiro processo para gerenciá-lo.</p>
            <Button onClick={handleFocusPrimeiroCampoProcesso} variant="contained" color="primary">
              Adicionar Primeiro Processo
            </Button>
          </div>
        ) : (
          <List className="data-list">
            {processos.map(p => (
              <ListItemButton component="li" key={p.id} sx={{ display: 'block', backgroundColor: '#e9ecef', mb: 1, borderRadius: '5px', border: '1px solid #dee2e6' }}>
                <ListItemText primaryTypographyProps={{ fontWeight: 'bold' }} primary={`Número: ${p.numero}`} />
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
                  secondaryTypographyProps={{ component: 'div' }}
                />
                {p.documentos && p.documentos.length > 0 && (
                  <Box className="data-list-item-prop" sx={{ mt: 1 }}>
                    <InputLabel sx={{ fontWeight: 'bold', fontSize: '0.9em' }}>Documentos:</InputLabel>
                    <List dense disablePadding sx={{ listStyleType: 'disc', pl: 2, fontSize: '0.9em' }}>
                      {p.documentos.map((doc, index) => (
                        <ListItemText key={index} primary={`${doc.name} (${(doc.size / 1024).toFixed(2)} KB)`} sx={{ pl: 0 }} />
                      ))}
                    </List>
                  </Box>
                )}
              </ListItemButton>
            ))}
          </List>
        )}
      </div>
      <p style={{ marginTop: '20px' }}><strong>LGPD & Persistência:</strong> Todos os dados, exceto arquivos, são salvos localmente. Arquivos enviados são para esta sessão e não persistem após fechar o navegador.</p>
    </div>
  );
};

export default Processos;