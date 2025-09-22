// LexProMobile/app/screens/ClientesScreen.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ClientesScreen from './ClientesScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  }
}));

describe('ClientesScreen', () => {
  it('renders correctly', () => {
    render(<ClientesScreen />);
    expect(screen.getByText('Gestão de Clientes')).toBeTruthy();
  });

  it('displays empty state when no clients', () => {
    render(<ClientesScreen />);
    expect(screen.getByText('Nenhum cliente cadastrado.')).toBeTruthy();
  });
});