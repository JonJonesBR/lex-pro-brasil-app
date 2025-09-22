import React, { FormEvent } from 'react';
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
  ListSubheader
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { toast } from 'react-toastify';

interface JurisprudenciaItem {
  id: string;
  tribunal: string;
  processo: string;
  publicacao: string;
  relator: string;
  ementa: string;
}

interface JurisprudenciaProps {
  resultadosJuris: JurisprudenciaItem[];
  setResultadosJuris: React.Dispatch<React.SetStateAction<JurisprudenciaItem[]>>;
  termoBuscaJuris: string;
  setTermoBuscaJuris: React.Dispatch<React.SetStateAction<string>>;
  filtroTribunalJuris: string;
  setFiltroTribunalJuris: React.Dispatch<React.SetStateAction<string>>;
  loadingJurisSearch: boolean;
  setLoadingJurisSearch: React.Dispatch<React.SetStateAction<boolean>>;
  resumosEmentas: Record<string, string>;
  setResumosEmentas: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loadingResumoId: string | null;
  setLoadingResumoId: React.Dispatch<React.SetStateAction<string | null>>;
  aiClient: any;
  ensureAiClient: () => boolean;
  jurisprudenciaDBDefault: JurisprudenciaItem[];
}

const allTribunalOptions = [
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
  // Local
  { value: 'Todos', label: 'Todos (Dados Locais Simulado)', group: "Local" },
  { value: 'STJ_local', label: 'STJ (Dados Locais Simulado)', group: "Local" },
  { value: 'TJSP_local', label: 'TJSP (Dados Locais Simulado)', group: "Local" },
  { value: 'STF_local', label: 'STF (Dados Locais Simulado)', group: "Local" },
  { value: 'TST_local', label: 'TST (Dados Locais Simulado)', group: "Local" },
  { value: 'TRF1_local', label: 'TRF1 (Dados Locais Simulado)', group: "Local" },
];

const Jurisprudencia: React.FC<JurisprudenciaProps> = ({ 
  resultadosJuris,
  setResultadosJuris,
  termoBuscaJuris,
  setTermoBuscaJuris,
  filtroTribunalJuris,
  setFiltroTribunalJuris,
  loadingJurisSearch,
  setLoadingJurisSearch,
  resumosEmentas,
  setResumosEmentas,
  loadingResumoId,
  setLoadingResumoId,
  aiClient,
  ensureAiClient,
  jurisprudenciaDBDefault
}) => {
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
      // In a real implementation, you would use a secure way to handle this key
      const datajudApiKey = 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
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
                dataPublicacaoStr = new Date(dateInput).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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

    // In a real implementation, you would call the AI service
    try {
      // Mock AI response for demonstration
      const mockResponse = `Resumo da ementa: ${ementa.substring(0, 100)}...`;
      setResumosEmentas(prev => ({ ...prev, [itemId]: mockResponse }));
    } catch (error) {
      console.error("Erro ao resumir ementa:", error);
      setResumosEmentas(prev => ({ ...prev, [itemId]: "Erro ao gerar resumo." }));
      toast.error("Ocorreu um erro ao tentar resumir a ementa. Tente novamente.");
    } finally {
      setLoadingResumoId(null);
    }
  };

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

      <Box component="form" onSubmit={handleSearchJurisprudencia} className="form-section" sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mt: 2 }}>
        <TextField
          id="termoBuscaJuris"
          label="Termo de Pesquisa"
          value={termoBuscaJuris}
          onChange={(e) => setTermoBuscaJuris(e.target.value)}
          placeholder="Ex: dano moral, apelação, nome do relator..."
          variant="outlined"
          sx={{ flexGrow: 1, minWidth: '300px' }}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 280 }}>
          <InputLabel id="filtroTribunalJuris-label">Tribunal/Fonte</InputLabel>
          <Select
            labelId="filtroTribunalJuris-label"
            id="filtroTribunalJuris"
            value={filtroTribunalJuris}
            label="Tribunal/Fonte"
            onChange={(e: SelectChangeEvent<string>) => setFiltroTribunalJuris(e.target.value)}
          >
            {Object.entries(groupedTribunalOptions).flatMap(([groupName, options]) => [
              <ListSubheader key={groupName} sx={{ backgroundColor: '#f0f0f0', color: 'black', fontWeight: 'bold' }}>{groupName}</ListSubheader>,
              ...options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ])}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" disabled={loadingJurisSearch} sx={{ height: '56px' }}>
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
              <ListItemButton component="li" key={item.id} className="juris-item" aria-busy={loadingResumoId === item.id} sx={{ display: 'block', backgroundColor: '#e9ecef', mb: 1, borderRadius: '5px', border: '1px solid #dee2e6' }}>
                <ListItemText primary={`Tribunal/Fonte: ${item.tribunal}`} primaryTypographyProps={{ fontWeight: 'bold' }} />
                <ListItemText secondary={`Processo: ${item.processo}`} />
                <ListItemText secondary={`Publicação: ${item.publicacao}`} />
                <ListItemText secondary={`Relator: ${item.relator}`} />
                <ListItemText
                  primary="Ementa:"
                  secondary={item.ementa}
                  primaryTypographyProps={{ fontWeight: 'medium', display: 'block', mb: 0.5 }}
                  secondaryTypographyProps={{ component: 'p', className: 'ementa-text' }}
                />

                {aiClient ? (
                  <Button
                    onClick={() => handleResumirEmenta(item.ementa, item.id)}
                    variant="outlined"
                    color="secondary"
                    disabled={loadingResumoId === item.id}
                    sx={{ marginTop: '10px' }}
                  >
                    {loadingResumoId === item.id ? 'Resumindo...' : 'Resumir com IA'}
                  </Button>
                ) : (
                  <div style={{ color: 'orange', marginTop: '10px', fontSize: '0.9em' }}>
                    Para resumir com IA, configure sua chave API em "Configurações e Segurança &gt; Configurar Chaves de IA".
                  </div>
                )}

                {loadingResumoId === item.id && <p className="resumo-loading"><em>Carregando resumo...</em></p>}
                {resumosEmentas[item.id] && (
                  <div className="resumo-ia" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #b3daff', borderRadius: '4px' }}>
                    <strong>Resumo IA:</strong>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{resumosEmentas[item.id]}</p>
                  </div>
                )}
              </ListItemButton>
            ))}
          </List>
        )}
      </div>
      <p style={{ marginTop: '20px', fontSize: '0.85em', color: '#6c757d' }}>
        <strong>Fonte dos Dados:</strong> Resultados "(API Datajud)" são obtidos em tempo real via API Pública do Datajud (CNJ).
        Resultados "(Dados Locais Simulado)" são dados de exemplo.
      </p>
    </div>
  );
};

export default Jurisprudencia;