// src/components/clientes/Clientes.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Clientes from './Clientes';

// Mock the toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('Clientes Component', () => {
  const defaultProps = {
    clientes: [],
    setClientes: jest.fn(),
    novoCliente: {
      nome: '',
      cpfCnpj: '',
      email: '',
      telefone: '',
      endereco: ''
    },
    setNovoCliente: jest.fn(),
    editingClienteId: null,
    setEditingClienteId: jest.fn(),
    termoBuscaCliente: '',
    setTermoBuscaCliente: jest.fn()
  };

  it('renders without crashing', () => {
    render(<Clientes {...defaultProps} />);
    expect(screen.getByText('Gestão de Clientes (CRM Jurídico)')).toBeInTheDocument();
  });

  it('displays message when no clients are registered', () => {
    render(<Clientes {...defaultProps} />);
    expect(screen.getByText('Nenhum cliente cadastrado.')).toBeInTheDocument();
  });

  it('displays clients when available', () => {
    const clientes = [
      {
        id: '1',
        nome: 'Cliente Teste',
        cpfCnpj: '123.456.789-00',
        email: 'cliente@teste.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Teste, 123'
      }
    ];

    render(<Clientes {...defaultProps} clientes={clientes} />);
    expect(screen.getByText('Cliente Teste')).toBeInTheDocument();
  });
});