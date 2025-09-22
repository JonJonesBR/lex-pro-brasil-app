import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import CalculadoraMonetaria from './CalculadoraMonetaria';
import CalculadoraPrazos from './CalculadoraPrazos';

interface CalculadorasProps {
  activeCalculator: string;
  setActiveCalculator: React.Dispatch<React.SetStateAction<string>>;
}

const Calculadoras: React.FC<CalculadorasProps> = ({ 
  activeCalculator,
  setActiveCalculator
}) => {
  return (
    <div className="card">
      <h2>Calculadoras Jurídicas</h2>
      <Box className="sub-module-nav" sx={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee', display: 'flex', gap: 1 }}>
        <Button
          variant={activeCalculator === 'monetaria' ? 'contained' : 'outlined'}
          onClick={() => setActiveCalculator('monetaria')}
        >
          Atualização Monetária
        </Button>
        <Button
          variant={activeCalculator === 'prazos' ? 'contained' : 'outlined'}
          onClick={() => setActiveCalculator('prazos')}
        >
          Prazos Processuais
        </Button>
      </Box>

      {activeCalculator === 'monetaria' && <CalculadoraMonetaria />}
      {activeCalculator === 'prazos' && <CalculadoraPrazos />}

      {(activeCalculator !== 'monetaria' && activeCalculator !== 'prazos') && (
        <>
          <hr style={{ marginTop: '30px' }} />
          <h4>Outras Calculadoras (descritivo):</h4>
          <ul>
            <li>Calculadora de Horas Extras e Verbas Rescisórias (Trabalhista)</li>
            <li>Calculadora de Custas Processuais</li>
          </ul>
          <p><em>(As demais calculadoras ainda são descritivas.)</em></p>
        </>
      )}
    </div>
  );
};

export default Calculadoras;