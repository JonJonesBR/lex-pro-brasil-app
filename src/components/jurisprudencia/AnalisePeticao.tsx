import React from 'react';
import { TextField, Button, Box } from '@mui/material';
import { toast } from 'react-toastify';

interface AnalisePeticaoProps {
  peticaoParaAnalise: string;
  setPeticaoParaAnalise: React.Dispatch<React.SetStateAction<string>>;
  resultadoAnalisePeticao: string | null;
  setResultadoAnalisePeticao: React.Dispatch<React.SetStateAction<string | null>>;
  loadingAnalisePeticao: boolean;
  setLoadingAnalisePeticao: React.Dispatch<React.SetStateAction<boolean>>;
  aiClient: any;
  ensureAiClient: () => boolean;
}

const AnalisePeticao: React.FC<AnalisePeticaoProps> = ({ 
  peticaoParaAnalise,
  setPeticaoParaAnalise,
  resultadoAnalisePeticao,
  setResultadoAnalisePeticao,
  loadingAnalisePeticao,
  setLoadingAnalisePeticao,
  aiClient,
  ensureAiClient
}) => {
  const handleAnalisarPeticao = async () => {
    if (!ensureAiClient()) return;

    if (!peticaoParaAnalise.trim()) {
      toast.warn("Por favor, cole o texto da petição na área indicada.");
      return;
    }
    setLoadingAnalisePeticao(true);
    setResultadoAnalisePeticao(null);

    // In a real implementation, you would call the AI service
    try {
      // Mock AI response for demonstration
      const mockResponse = `# Análise da Petição

## Resumo da Tese Principal
Esta é uma análise simulada da petição. Em uma implementação real, a IA analisaria o conteúdo e forneceria insights valiosos.

## Pontos Fortes
1. Estrutura bem organizada
2. Argumentação clara
3. Fundamentação jurídica adequada

## Pontos Frágeis ou a Melhorar
1. Necessidade de mais evidências documentais
2. Aprimorar a redação de alguns trechos
3. Incluir precedentes mais recentes

## Sugestões de Jurisprudência
- Temas relacionados ao caso específico
- Decisões de tribunais superiores
- Precedentes do STJ e STF

## Artigos de Lei Relevantes
- Código Civil Brasileiro
- Código de Processo Civil
- Leis específicas do caso`;
      
      setResultadoAnalisePeticao(mockResponse);
    } catch (error) {
      console.error("Erro ao analisar petição:", error);
      setResultadoAnalisePeticao("Erro ao realizar a análise da petição. Tente novamente mais tarde.");
      toast.error("Ocorreu um erro ao tentar analisar a petição.");
    } finally {
      setLoadingAnalisePeticao(false);
    }
  };

  return (
    <div className="card">
      <h2>Análise de Petições com IA <span className="badge badge-ia">IA</span> <span className="badge badge-pro">PRO</span></h2>
      {!aiClient &&
        <div style={{ color: 'orange', fontWeight: 'bold', border: '1px solid orange', padding: '10px', borderRadius: '4px', mt: 1, mb: 1 }}>
          A funcionalidade de Análise de Petições com IA está desabilitada.
          Por favor, configure sua chave API do Google Gemini em "Configurações e Segurança &gt; Configurar Chaves de IA" para habilitá-la.
        </div>
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
              sx={{ mt: 1 }}
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
      <p style={{ marginTop: '20px' }}><strong>LGPD e Confidencialidade:</strong> O texto da sua petição é enviado para análise pela IA e não é armazenado permanentemente pelo Lex Pro Brasil após a conclusão da análise. Recomendamos não incluir dados excessivamente sensíveis ou pessoais identificáveis não essenciais para a análise da tese jurídica.</p>
    </div>
  );
};

export default AnalisePeticao;