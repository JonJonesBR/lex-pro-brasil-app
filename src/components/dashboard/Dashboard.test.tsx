// src/components/dashboard/Dashboard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

describe('Dashboard Component', () => {
  const defaultProps = {
    processos: [],
    registrosFinanceiros: [],
    eventos: [],
    handleMenuClick: jest.fn()
  };

  it('renders without crashing', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText('Painel de Controle')).toBeInTheDocument();
  });

  it('displays correct metrics', () => {
    const props = {
      ...defaultProps,
      processos: [
        { id: '1', status: 'Ativo' },
        { id: '2', status: 'Suspenso' }
      ],
      registrosFinanceiros: [
        { id: '1', tipo: 'honorario', status: 'Aguardando Pagamento', valor: 1000 } as any,
        { id: '2', tipo: 'despesa', valor: 500 } as any
      ]
    };

    render(<Dashboard {...props} />);
    expect(screen.getByText('1')).toBeInTheDocument(); // Processos ativos
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument(); // Total a receber
  });
});