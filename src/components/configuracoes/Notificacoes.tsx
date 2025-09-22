import React from 'react';
import { 
  FormControlLabel, 
  Switch, 
  Box, 
  Button 
} from '@mui/material';
import { toast } from 'react-toastify';

interface NotificacoesConfig {
  emailPrazos: boolean;
  pushAudiencias: boolean;
  resumoSemanal: boolean;
}

interface NotificacoesProps {
  configNotificacoes: NotificacoesConfig;
  setConfigNotificacoes: React.Dispatch<React.SetStateAction<NotificacoesConfig>>;
}

const Notificacoes: React.FC<NotificacoesProps> = ({ 
  configNotificacoes,
  setConfigNotificacoes
}) => {
  const handleNotificacaoChange = (key: keyof NotificacoesConfig) => {
    setConfigNotificacoes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotificacoesConfig = () => {
    toast.success("Configurações de notificações salvas!");
  };

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
      <p style={{ fontSize: '0.9em', marginTop: '20px', color: '#6c757d' }}>
        <strong>Nota:</strong> As funcionalidades de envio de e-mail e notificações push são conceituais nesta versão e dependem de infraestrutura de backend não implementada. As configurações são salvas localmente.
      </p>
    </div>
  );
};

export default Notificacoes;