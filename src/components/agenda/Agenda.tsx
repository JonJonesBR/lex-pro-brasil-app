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
  ListItemText
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { toast } from 'react-toastify';

interface EventoAgenda {
  id: string;
  data: string;
  titulo: string;
  tipo: 'Prazo Processual' | 'Audiência' | 'Reunião' | 'Outro';
  descricao: string;
}

interface AgendaProps {
  eventos: EventoAgenda[];
  setEventos: React.Dispatch<React.SetStateAction<EventoAgenda[]>>;
  formEventoData: string;
  setFormEventoData: React.Dispatch<React.SetStateAction<string>>;
  formEventoTitulo: string;
  setFormEventoTitulo: React.Dispatch<React.SetStateAction<string>>;
  formEventoTipo: EventoAgenda['tipo'];
  setFormEventoTipo: React.Dispatch<React.SetStateAction<EventoAgenda['tipo']>>;
  formEventoDescricao: string;
  setFormEventoDescricao: React.Dispatch<React.SetStateAction<string>>;
}

const Agenda: React.FC<AgendaProps> = ({ 
  eventos, 
  setEventos, 
  formEventoData, 
  setFormEventoData,
  formEventoTitulo,
  setFormEventoTitulo,
  formEventoTipo,
  setFormEventoTipo,
  formEventoDescricao,
  setFormEventoDescricao
}) => {
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
    setEventos(prev => [...prev, novoEventoItem].sort((a, b) => {
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
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>Salvar Evento</Button>
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
                sx={{ display: 'block', backgroundColor: '#e9ecef', mb: 1, borderRadius: '5px', border: '1px solid #dee2e6' }}
              >
                <ListItemText primary={`Data: ${new Date(evento.data + 'T03:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} />
                <ListItemText secondary={`Título: ${evento.titulo}`} />
                <ListItemText
                  secondary={
                    <Box component="span" className={`badge badge-evento-${evento.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                      {evento.tipo}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
                {evento.descricao && <ListItemText secondary={`Descrição: ${evento.descricao}`} />}
              </ListItemButton>
            ))}
          </List>
        )}
      </div>
      <p style={{ marginTop: '20px' }}><strong>LGPD:</strong> Seus eventos são armazenados localmente no seu navegador.</p>
    </div>
  );
};

export default Agenda;