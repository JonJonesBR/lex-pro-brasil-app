import React from 'react';
import { TextField, Button, Box, Typography, Link } from '@mui/material';
import { KeyIcon } from '@mui/icons-material';

interface ConfigApiKeysProps {
  inputGeminiApiKey: string;
  setInputGeminiApiKey: React.Dispatch<React.SetStateAction<string>>;
  handleSaveApiKey: () => void;
  handleRemoveApiKey: () => void;
  geminiApiKey: string | null;
  aiClient: any;
}

const ConfigApiKeys: React.FC<ConfigApiKeysProps> = ({ 
  inputGeminiApiKey,
  setInputGeminiApiKey,
  handleSaveApiKey,
  handleRemoveApiKey,
  geminiApiKey,
  aiClient
}) => {
  return (
    <div className="card">
      <h2>Configurar Chaves de IA</h2>
      <p>
        Insira suas chaves de API para habilitar as funcionalidades de Inteligência Artificial.
        A chave é armazenada localmente no seu navegador e não é enviada para nossos servidores.
      </p>

      <Box className="form-section" sx={{ mt: 2 }}>
        <h3>Chave API do Google Gemini</h3>
        <Typography variant="body2" sx={{ mb: 1 }}>
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
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
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
          <Typography variant="body2" color="green" sx={{ mt: 2, fontWeight: 'bold' }}>
            Chave API do Gemini configurada e ativa.
          </Typography>
        ) : (
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
            Chave API do Gemini não configurada. As funcionalidades de IA estão desabilitadas.
          </Typography>
        )}
        <Typography variant="caption" display="block" sx={{ mt: 3, color: 'text.secondary' }}>
          <strong>Nota de Privacidade:</strong> Sua chave API do Gemini é armazenada apenas no localStorage do seu navegador.
          Ela é usada para fazer chamadas diretas do seu navegador para os serviços da Google AI.
          O Lex Pro Brasil não armazena sua chave em servidores remotos.
        </Typography>
      </Box>
    </div>
  );
};

export default ConfigApiKeys;