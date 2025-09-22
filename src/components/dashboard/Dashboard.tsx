import React from 'react';
import GavelIcon from '@mui/icons-material/Gavel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Button } from '@mui/material';

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

interface EventoAgenda {
  id: string;
  data: string;
  titulo: string;
  tipo: 'Prazo Processual' | 'Audiência' | 'Reunião' | 'Outro';
  descricao: string;
}

interface DashboardProps {
  processos: Processo[];
  registrosFinanceiros: RegistroFinanceiro[];
  eventos: EventoAgenda[];
  handleMenuClick: (moduleId: string, parentId: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  processos, 
  registrosFinanceiros, 
  eventos, 
  handleMenuClick 
}) => {
  const processosAtivos = processos.filter(p => p.status === 'Ativo').length;
  
  const calcularTotalAReceber = (): number => {
    return registrosFinanceiros.reduce((acc, curr) => {
      if (curr.tipo === 'honorario' && curr.status === 'Aguardando Pagamento') {
        return acc + curr.valor;
      }
      return acc;
    }, 0);
  };

  const totalAReceberDash = calcularTotalAReceber();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const proximosEventos = eventos
    .filter(evento => {
      const [year, month, day] = evento.data.split('-').map(Number);
      const eventoDate = new Date(year, month - 1, day);
      eventoDate.setHours(0, 0, 0, 0);
      return eventoDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.data.split('-').join('/') + 'T00:00:00');
      const dateB = new Date(b.data.split('-').join('/') + 'T00:00:00');
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    <div>
      <h2>Painel de Controle</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <GavelIcon sx={{ fontSize: 40, color: 'primary.main', alignSelf: 'center', mb: 1 }} />
          <h3>Processos Ativos</h3>
          <div className="metric-value">{processosAtivos}</div>
          <div className="metric-label">Processos em Andamento</div>
        </div>

        <div className="dashboard-card">
          <EventNoteIcon sx={{ fontSize: 40, color: 'secondary.main', alignSelf: 'center', mb: 1 }} />
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
            <p className="metric-label" style={{ textAlign: 'center', marginTop: '20px' }}>Nenhum prazo ou evento futuro agendado.</p>
          )}
        </div>

        <div className="dashboard-card">
          <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'success.main', alignSelf: 'center', mb: 1 }} />
          <h3>Financeiro Rápido</h3>
          <div className="metric-value">{formatCurrency(totalAReceberDash)}</div>
          <div className="metric-label">Total a Receber</div>
        </div>

        <div className="dashboard-card">
          <SpeedIcon sx={{ fontSize: 40, color: 'info.main', alignSelf: 'center', mb: 1 }} />
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
};

export default Dashboard;