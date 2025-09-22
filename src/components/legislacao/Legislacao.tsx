import React, { useState, useEffect } from 'react';
import { TextField, Box, List, ListItemButton, ListItemText } from '@mui/material';

interface Lei {
  id: string;
  nome: string;
  sigla: string;
  link: string;
}

const leisDB: Lei[] = [
  { id: 'cf88', nome: 'Constituição da República Federativa do Brasil de 1988', sigla: 'CF/88', link: 'http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm' },
  { id: 'cc', nome: 'Código Civil - Lei nº 10.406/2002', sigla: 'CC', link: 'http://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm' },
  { id: 'cpc', nome: 'Código de Processo Civil - Lei nº 13.105/2015', sigla: 'CPC/15', link: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm' },
  { id: 'cp', nome: 'Código Penal - Decreto-Lei nº 2.848/1940', sigla: 'CP', link: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm' },
  { id: 'cpp', nome: 'Código de Processo Penal - Decreto-Lei nº 3.689/1941', sigla: 'CPP', link: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm' },
  { id: 'clt', nome: 'Consolidação das Leis do Trabalho - Decreto-Lei nº 5.452/1943', sigla: 'CLT', link: 'http://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm' },
  { id: 'ctn', nome: 'Código Tributário Nacional - Lei nº 5.172/1966', sigla: 'CTN', link: 'http://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
  { id: 'cdc', nome: 'Código de Defesa do Consumidor - Lei nº 8.078/1990', sigla: 'CDC', link: 'http://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm' },
  { id: 'lei8112', nome: 'Regime Jurídico dos Servidores Públicos Civis da União - Lei nº 8.112/1990', sigla: 'Lei 8.112/90', link: 'http://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm' },
  { id: 'lei8666', nome: 'Antiga Lei de Licitações e Contratos Administrativos - Lei nº 8.666/1993 (Revogada)', sigla: 'Lei 8.666/93', link: 'http://www.planalto.gov.br/ccivil_03/leis/l8666cons.htm' },
  { id: 'lei14133', nome: 'Nova Lei de Licitações e Contratos Administrativos - Lei nº 14.133/2021', sigla: 'Lei 14.133/21', link: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm' },
  { id: 'lgpd', nome: 'Lei Geral de Proteção de Dados Pessoais - Lei nº 13.709/2018', sigla: 'LGPD', link: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm' },
  { id: 'lei9099', nome: 'Juizados Especiais Cíveis e Criminais - Lei nº 9.099/1995', sigla: 'Lei 9.099/95', link: 'http://www.planalto.gov.br/ccivil_03/leis/l9099.htm' },
  { id: 'lei11340', nome: 'Lei Maria da Penha - Lei nº 11.340/2006', sigla: 'Lei Maria da Penha', link: 'http://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm' },
  { id: 'eca', nome: 'Estatuto da Criança e do Adolescente - Lei nº 8.069/1990', sigla: 'ECA', link: 'http://www.planalto.gov.br/ccivil_03/leis/l8069.htm' },
  { id: 'estatutoidoso', nome: 'Estatuto do Idoso - Lei nº 10.741/2003', sigla: 'Estatuto do Idoso', link: 'http://www.planalto.gov.br/ccivil_03/leis/2003/l10.741.htm' },
];

interface LegislacaoProps {
  termoBuscaLeis: string;
  setTermoBuscaLeis: React.Dispatch<React.SetStateAction<string>>;
}

const Legislacao: React.FC<LegislacaoProps> = ({ 
  termoBuscaLeis,
  setTermoBuscaLeis
}) => {
  const [leisFiltradas, setLeisFiltradas] = useState<Lei[]>(leisDB);

  useEffect(() => {
    const leisFiltradas = leisDB.filter(lei => {
      if (!termoBuscaLeis.trim()) return true;
      const termo = termoBuscaLeis.toLowerCase();
      return (
        lei.nome.toLowerCase().includes(termo) ||
        lei.sigla.toLowerCase().includes(termo)
      );
    });
    setLeisFiltradas(leisFiltradas);
  }, [termoBuscaLeis]);

  return (
    <div className="card">
      <h2>Legislação Compilada (Vade Mecum Digital)</h2>
      <p>Consulte rapidamente os principais códigos e leis do Brasil. Os links direcionam para as fontes oficiais no site do Planalto.</p>

      <Box sx={{ my: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar Lei ou Código (Nome ou Sigla)"
          placeholder="Ex: CF/88, Código Civil, LGPD..."
          value={termoBuscaLeis}
          onChange={(e) => setTermoBuscaLeis(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {leisFiltradas.length > 0 ? (
        <List>
          {leisFiltradas.map(lei => (
            <ListItemButton
              key={lei.id}
              component="a"
              href={lei.link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                border: '1px solid #eee',
                mb: 1,
                borderRadius: '4px',
                '&:hover': { backgroundColor: '#f0f8ff' }
              }}
            >
              <ListItemText
                primary={lei.nome}
                secondary={lei.sigla}
                primaryTypographyProps={{ fontWeight: 'medium', color: 'primary.main' }}
              />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <p>Nenhuma lei encontrada para "{termoBuscaLeis}". Tente um termo de busca diferente.</p>
      )}
      <p style={{ fontSize: '0.9em', color: '#6c757d', marginTop: '20px', textAlign: 'center' }}>
        <strong>Aviso:</strong> Mantenha-se sempre atualizado consultando as fontes oficiais. Os links fornecidos direcionam ao site do Planalto.
      </p>
    </div>
  );
};

export default Legislacao;