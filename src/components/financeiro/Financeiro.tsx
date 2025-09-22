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

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
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

interface FinanceiroProps {
  registrosFinanceiros: RegistroFinanceiro[];
  setRegistrosFinanceiros: React.Dispatch<React.SetStateAction<RegistroFinanceiro[]>>;
  novoHonorarioClienteId: string;
  setNovoHonorarioClienteId: React.Dispatch<React.SetStateAction<string>>;
  novoHonorarioReferencia: string;
  setNovoHonorarioReferencia: React.Dispatch<React.SetStateAction<string>>;
  novoHonorarioValor: string;
  setNovoHonorarioValor: React.Dispatch<React.SetStateAction<string>>;
  novoHonorarioStatus: 'Aguardando Pagamento' | 'Pago';
  setNovoHonorarioStatus: React.Dispatch<React.SetStateAction<'Aguardando Pagamento' | 'Pago'>>;
  novaDespesaDescricao: string;
  setNovaDespesaDescricao: React.Dispatch<React.SetStateAction<string>>;
  novaDespesaCategoria: 'Custas Processuais' | 'Diligências' | 'Transporte' | 'Material de Escritório' | 'Outras';
  setNovaDespesaCategoria: React.Dispatch<React.SetStateAction<'Custas Processuais' | 'Diligências' | 'Transporte' | 'Material de Escritório' | 'Outras'>>;
  novaDespesaValor: string;
  setNovaDespesaValor: React.Dispatch<React.SetStateAction<string>>;
  clientes: Cliente[];
}

const Financeiro: React.FC<FinanceiroProps> = ({ 
  registrosFinanceiros,
  setRegistrosFinanceiros,
  novoHonorarioClienteId,
  setNovoHonorarioClienteId,
  novoHonorarioReferencia,
  setNovoHonorarioReferencia,
  novoHonorarioValor,
  setNovoHonorarioValor,
  novoHonorarioStatus,
  setNovoHonorarioStatus,
  novaDespesaDescricao,
  setNovaDespesaDescricao,
  novaDespesaCategoria,
  setNovaDespesaCategoria,
  novaDespesaValor,
  setNovaDespesaValor,
  clientes
}) => {
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
    setRegistrosFinanceiros(prev => [...prev, novoRegistro].sort((a, b) => new Date(b.dataLancamento).getTime() - new Date(a.dataLancamento).getTime()));
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
    setRegistrosFinanceiros(prev => [...prev, novaDespesaRegistro].sort((a, b) => new Date(b.dataLancamento).getTime() - new Date(a.dataLancamento).getTime()));
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

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalAReceberCtrl = calcularTotalAReceber();
  const totalDespesasMes = calcularTotalDespesasMesAtual();
  const honorariosRegistrados = registrosFinanceiros.filter(r => r.tipo === 'honorario') as Honorario[];
  const despesasRegistradas = registrosFinanceiros.filter(r => r.tipo === 'despesa') as Despesa[];

  return (
    <div className="card">
      <h2>Controle Financeiro do Escritório</h2>

      <div className="financial-summary-panel form-section" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', paddingBottom: '20px' }}>
        <div>
          <h4>Total a Receber</h4>
          <p style={{ fontSize: '1.5em', color: '#28a745', fontWeight: 'bold' }}>{formatCurrency(totalAReceberCtrl)}</p>
        </div>
        <div>
          <h4>Despesas (Mês Atual)</h4>
          <p style={{ fontSize: '1.5em', color: '#dc3545', fontWeight: 'bold' }}>{formatCurrency(totalDespesasMes)}</p>
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
              onChange={(e: SelectChangeEvent<string>) => setNovoHonorarioClienteId(e.target.value)}
              required
            >
              <MenuItem value=""><em>Selecione um cliente</em></MenuItem>
              {clientes.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
            </Select>
            {clientes.length === 0 && <p style={{ color: 'orange', fontSize: '0.9em', marginTop: '5px' }}>Nenhum cliente cadastrado.</p>}
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
          <Button type="submit" variant="contained" color="primary" disabled={clientes.length === 0} sx={{ mt: 1 }}>Lançar Honorário</Button>
        </Box>
        <div className="list-section">
          <h4>Honorários Lançados</h4>
          {honorariosRegistrados.length === 0 ? <p>Nenhum honorário lançado.</p> : (
            <List className="data-list">
              {honorariosRegistrados.map(h => (
                <ListItemButton component="li" key={h.id} sx={{ display: 'block', backgroundColor: '#e9ecef', mb: 1, borderRadius: '5px', border: '1px solid #dee2e6' }}>
                  <ListItemText primary={`Cliente: ${h.clienteNome}`} primaryTypographyProps={{ fontWeight: 'bold' }} />
                  <ListItemText secondary={`Referência: ${h.referenciaProcesso}`} />
                  <ListItemText secondary={`Valor: ${formatCurrency(h.valor)}`} />
                  <ListItemText
                    secondary={
                      <Box component="span" className={`badge badge-status-${h.status.toLowerCase().replace(' ', '-')}`}>
                        {h.status}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
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
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>Lançar Despesa</Button>
        </Box>
        <div className="list-section">
          <h4>Despesas Lançadas</h4>
          {despesasRegistradas.length === 0 ? <p>Nenhuma despesa lançada.</p> : (
            <List className="data-list">
              {despesasRegistradas.map(d => (
                <ListItemButton component="li" key={d.id} sx={{ display: 'block', backgroundColor: '#e9ecef', mb: 1, borderRadius: '5px', border: '1px solid #dee2e6' }}>
                  <ListItemText primary={`Descrição: ${d.descricao}`} primaryTypographyProps={{ fontWeight: 'bold' }} />
                  <ListItemText secondary={`Categoria: ${d.categoria}`} />
                  <ListItemText secondary={`Valor: ${formatCurrency(d.valor)}`} />
                  <ListItemText secondary={`Data: ${new Date(d.dataLancamento).toLocaleDateString('pt-BR')}`} />
                </ListItemButton>
              ))}
            </List>
          )}
        </div>
      </div>
      <p style={{ marginTop: '20px' }}><strong>LGPD:</strong> Seus dados financeiros são armazenados localmente no seu navegador e não são compartilhados.</p>
    </div>
  );
};

export default Financeiro;