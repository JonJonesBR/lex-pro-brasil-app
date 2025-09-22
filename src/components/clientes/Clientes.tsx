import React, { FormEvent } from 'react';
import { 
  TextField, 
  Button, 
  Box,
  List,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { toast } from 'react-toastify';

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface ClientesProps {
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  novoCliente: Omit<Cliente, 'id'>;
  setNovoCliente: React.Dispatch<React.SetStateAction<Omit<Cliente, 'id'>>>;
  editingClienteId: string | null;
  setEditingClienteId: React.Dispatch<React.SetStateAction<string | null>>;
  termoBuscaCliente: string;
  setTermoBuscaCliente: React.Dispatch<React.SetStateAction<string>>;
}

const Clientes: React.FC<ClientesProps> = ({ 
  clientes, 
  setClientes, 
  novoCliente, 
  setNovoCliente, 
  editingClienteId, 
  setEditingClienteId,
  termoBuscaCliente,
  setTermoBuscaCliente
}) => {
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

  const clientesFiltrados = clientes.filter(cliente => {
    if (!termoBuscaCliente.trim()) return true;
    const termo = termoBuscaCliente.toLowerCase();
    return (
      (cliente.nome?.toLowerCase() || '').includes(termo) ||
      (cliente.cpfCnpj?.toLowerCase() || '').includes(termo) ||
      (cliente.email?.toLowerCase() || '').includes(termo)
    );
  });

  const clienteEmEdicao = editingClienteId ? clientes.find(c => c.id === editingClienteId) : null;

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
          <Button type="submit" variant="contained" color="primary" sx={{ mr: editingClienteId ? 1 : 0, mt: 1 }}>
            {editingClienteId ? 'Salvar Alterações' : 'Adicionar Cliente'}
          </Button>
          {editingClienteId && (
            <Button type="button" onClick={handleCancelEditCliente} variant="outlined" color="secondary" sx={{ mt: 1 }}>
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
              <ListItemButton component="li" key={c.id} sx={{ display: 'block', backgroundColor: '#e9ecef', mb: 1, borderRadius: '5px', border: '1px solid #dee2e6' }}>
                <ListItemText primary={`Nome: ${c.nome}`} primaryTypographyProps={{ fontWeight: 'bold' }} />
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
      <p style={{ marginTop: '20px' }}><strong>LGPD:</strong> Asseguramos a privacidade e proteção dos dados dos seus clientes. Dados salvos localmente no seu navegador.</p>
    </div>
  );
};

export default Clientes;