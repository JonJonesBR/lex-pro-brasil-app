import React, { FormEvent } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { toast } from 'react-toastify';

interface PerfilUsuario {
  nomeCompleto: string;
  oab: string;
  ufOab: string;
  email: string;
  enderecoEscritorio: string;
}

interface PerfilProps {
  formPerfilNome: string;
  setFormPerfilNome: React.Dispatch<React.SetStateAction<string>>;
  formPerfilOAB: string;
  setFormPerfilOAB: React.Dispatch<React.SetStateAction<string>>;
  formPerfilUFOAB: string;
  setFormPerfilUFOAB: React.Dispatch<React.SetStateAction<string>>;
  formPerfilEmail: string;
  setFormPerfilEmail: React.Dispatch<React.SetStateAction<string>>;
  formPerfilEndereco: string;
  setFormPerfilEndereco: React.Dispatch<React.SetStateAction<string>>;
  perfilUsuario: PerfilUsuario;
  setPerfilUsuario: React.Dispatch<React.SetStateAction<PerfilUsuario>>;
}

const Perfil: React.FC<PerfilProps> = ({ 
  formPerfilNome,
  setFormPerfilNome,
  formPerfilOAB,
  setFormPerfilOAB,
  formPerfilUFOAB,
  setFormPerfilUFOAB,
  formPerfilEmail,
  setFormPerfilEmail,
  formPerfilEndereco,
  setFormPerfilEndereco,
  perfilUsuario,
  setPerfilUsuario
}) => {
  const handleSavePerfil = (e: FormEvent) => {
    e.preventDefault();
    const perfilAtualizado: PerfilUsuario = {
      nomeCompleto: formPerfilNome,
      oab: formPerfilOAB,
      ufOab: formPerfilUFOAB,
      email: formPerfilEmail,
      enderecoEscritorio: formPerfilEndereco,
    };
    setPerfilUsuario(perfilAtualizado);
    toast.success("Perfil salvo com sucesso!");
  };

  return (
    <div className="card">
      <h2>Perfil do Usuário</h2>
      <p>Gerencie suas informações profissionais para personalizar sua experiência e agilizar a geração de documentos.</p>
      <Box component="form" onSubmit={handleSavePerfil} className="form-section">
        <TextField
          label="Nome Completo do Advogado"
          id="formPerfilNome"
          value={formPerfilNome}
          onChange={e => setFormPerfilNome(e.target.value)}
          fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Número da OAB"
          id="formPerfilOAB"
          value={formPerfilOAB}
          onChange={e => setFormPerfilOAB(e.target.value)}
          fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="UF da OAB"
          id="formPerfilUFOAB"
          value={formPerfilUFOAB}
          onChange={e => setFormPerfilUFOAB(e.target.value)}
          placeholder="Ex: SP, RJ, MG"
          fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="E-mail Profissional"
          type="email"
          id="formPerfilEmail"
          value={formPerfilEmail}
          onChange={e => setFormPerfilEmail(e.target.value)}
          fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Endereço do Escritório"
          id="formPerfilEndereco"
          value={formPerfilEndereco}
          onChange={e => setFormPerfilEndereco(e.target.value)}
          multiline rows={3}
          fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>Salvar Perfil</Button>
      </Box>
      <p style={{ marginTop: '20px' }}><strong>LGPD:</strong> Seus dados de perfil são armazenados localmente no seu navegador e são utilizados para preencher automaticamente informações em documentos gerados pelo sistema.</p>
    </div>
  );
};

export default Perfil;