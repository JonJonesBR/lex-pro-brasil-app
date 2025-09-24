import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Interface para tipagem dos dados do Movimento Financeiro
interface MovimentoFinanceiro {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'Receita' | 'Despesa';
  valor: string; // Armazenando como string para lidar com formatação monetária
  data: string; // YYYY-MM-DD
  categoria: string;
  status: 'Pendente' | 'Pago' | 'Recebido';
}

// Chave para AsyncStorage
const STORAGE_KEY_FINANCEIRO = '@LexProMobile:movimentosFinanceiros';

const FinanceiroScreen: React.FC = () => {
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [novoMovimento, setNovoMovimento] = useState<Omit<MovimentoFinanceiro, 'id'>>({
    titulo: '',
    descricao: '',
    tipo: 'Receita',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    status: 'Pendente'
  });
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [saldo, setSaldo] = useState(0);

  // Carregar movimentos financeiros do AsyncStorage ao montar o componente
  useEffect(() => {
    const loadMovimentos = async () => {
      try {
        const storedMovimentos = await AsyncStorage.getItem(STORAGE_KEY_FINANCEIRO);
        if (storedMovimentos !== null) {
          const movimentosCarregados = JSON.parse(storedMovimentos);
          setMovimentos(movimentosCarregados);
          calcularTotais(movimentosCarregados);
        }
      } catch (error) {
        console.error('Erro ao carregar movimentos financeiros do AsyncStorage:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
      }
    };
    loadMovimentos();
  }, []);

  // Cálculo de totais e saldo
  useEffect(() => {
    calcularTotais(movimentos);
  }, [movimentos]);

  // Salvar movimentos financeiros no AsyncStorage sempre que a lista mudar
  useEffect(() => {
    const saveMovimentos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_FINANCEIRO, JSON.stringify(movimentos));
      } catch (error) {
        console.error('Erro ao salvar movimentos financeiros no AsyncStorage:', error);
      }
    };
    saveMovimentos();
  }, [movimentos]);

  const calcularTotais = (movimentos: MovimentoFinanceiro[]) => {
    const receitas = movimentos
      .filter(m => m.tipo === 'Receita' && m.status !== 'Pendente')
      .reduce((total, mov) => total + parseFloat(mov.valor.replace('R$ ', '').replace('.', '').replace(',', '.')), 0);
    
    const despesas = movimentos
      .filter(m => m.tipo === 'Despesa' && m.status !== 'Pendente')
      .reduce((total, mov) => total + parseFloat(mov.valor.replace('R$ ', '').replace('.', '').replace(',', '.')), 0);
    
    setTotalReceitas(receitas);
    setTotalDespesas(despesas);
    setSaldo(receitas - despesas);
  };

  const handleMovimentoInputChange = useCallback((fieldName: keyof Omit<MovimentoFinanceiro, 'id'>, value: string) => {
    setNovoMovimento(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const formatarValor = (valor: string) => {
    // Remover tudo que não for número
    const numeros = valor.replace(/\D/g, '');
    
    // Adicionar ponto a cada 3 dígitos a partir da direita
    const valorComPontos = numeros.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    
    // Adicionar vírgula para centavos (últimos 2 dígitos)
    if (valorComPontos.length >= 3) {
      const inteiro = valorComPontos.slice(0, -2);
      const centavos = valorComPontos.slice(-2);
      return `R$ ${inteiro},${centavos}`;
    } else {
      return `R$ 0,${numeros.padStart(2, '0')}`;
    }
  };

  const handleSubmitMovimentoForm = useCallback(() => {
    if (!novoMovimento.titulo.trim()) {
      Alert.alert('Campo Obrigatório', 'O título do movimento financeiro é obrigatório.');
      return;
    }

    if (!novoMovimento.valor.trim()) {
      Alert.alert('Campo Obrigatório', 'O valor do movimento financeiro é obrigatório.');
      return;
    }

    // Formatando o valor para o padrão monetário
    const valorNumerico = novoMovimento.valor.replace(/\D/g, '');
    const valorFormatado = formatarValor(valorNumerico);

    const movimentoComId: MovimentoFinanceiro = {
      ...novoMovimento,
      id: new Date().toISOString(),
      valor: valorFormatado
    };

    setMovimentos(prevMovimentos => [movimentoComId, ...prevMovimentos]);
    setNovoMovimento({
      titulo: '',
      descricao: '',
      tipo: 'Receita',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      status: 'Pendente'
    });
    Alert.alert('Sucesso', 'Movimento financeiro adicionado com sucesso!');
  }, [novoMovimento]);

  const toggleStatus = (id: string) => {
    setMovimentos(prevMovimentos => 
      prevMovimentos.map(movimento => {
        if (movimento.id === id) {
          let novoStatus: 'Pendente' | 'Pago' | 'Recebido' = 'Pendente';
          if (movimento.status === 'Pendente') {
            novoStatus = movimento.tipo === 'Receita' ? 'Recebido' : 'Pago';
          } else if (movimento.status === 'Recebido' || movimento.status === 'Pago') {
            novoStatus = 'Pendente';
          }
          return { ...movimento, status: novoStatus };
        }
        return movimento;
      })
    );
  };

  const renderMovimentoItem = ({ item }: { item: MovimentoFinanceiro }) => {
    const statusCores = {
      'Pendente': '#FFC107',
      'Pago': '#F44336',
      'Recebido': '#4CAF50',
    };

    const tipoIcones = {
      'Receita': 'credit-card',
      'Despesa': 'cash-remove'
    };

    return (
      <View style={[styles.listItem, styles[`movimentoTipo${item.tipo}`]]}>
        <View style={styles.listItemHeader}>
          <View style={styles.listItemHeaderLeft}>
            <MaterialCommunityIcons 
              name={tipoIcones[item.tipo as keyof typeof tipoIcones] as any} 
              size={24} 
              color={item.tipo === 'Receita' ? '#28a745' : '#dc3545'} 
            />
            <View>
              <Text style={styles.listItemTextStrong}>{item.titulo}</Text>
              <Text style={styles.listItemCategoria}>{item.categoria}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.statusButton, { backgroundColor: statusCores[item.status] }]}
            onPress={() => toggleStatus(item.id)}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.listItemText}>Data: {item.data}</Text>
        <Text style={styles.listItemText}>Valor: {item.valor}</Text>
        {item.descricao ? <Text style={styles.listItemText} numberOfLines={2}>{item.descricao}</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.container}>
            <Text style={styles.header}>Gestão Financeira</Text>

            {/* Resumo financeiro */}
            <View style={styles.resumoContainer}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoTitulo}>Total Receitas</Text>
                <Text style={[styles.resumoValor, { color: '#28a745' }]}>R$ {totalReceitas.toFixed(2).replace('.', ',')}</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoTitulo}>Total Despesas</Text>
                <Text style={[styles.resumoValor, { color: '#dc3545' }]}>R$ {totalDespesas.toFixed(2).replace('.', ',')}</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoTitulo}>Saldo</Text>
                <Text style={[styles.resumoValor, { color: saldo >= 0 ? '#28a745' : '#dc3545' }]}>
                  R$ {saldo.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.subHeader}>Adicionar Movimento</Text>
              <TextInput
                style={styles.input}
                placeholder="Título *"
                value={novoMovimento.titulo}
                onChangeText={(text) => handleMovimentoInputChange('titulo', text)}
                placeholderTextColor="#888"
              />
              <View style={styles.rowContainer}>
                <View style={styles.tipoButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.tipoButton, novoMovimento.tipo === 'Receita' && styles.tipoButtonSelected]}
                    onPress={() => handleMovimentoInputChange('tipo', 'Receita')}
                  >
                    <Text style={[styles.tipoButtonText, novoMovimento.tipo === 'Receita' && styles.tipoButtonTextSelected]}>
                      Receita
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tipoButton, novoMovimento.tipo === 'Despesa' && styles.tipoButtonSelected]}
                    onPress={() => handleMovimentoInputChange('tipo', 'Despesa')}
                  >
                    <Text style={[styles.tipoButtonText, novoMovimento.tipo === 'Despesa' && styles.tipoButtonTextSelected]}>
                      Despesa
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Valor * (R$)"
                value={formatarValor(novoMovimento.valor.replace(/\D/g, ''))}
                onChangeText={(text) => handleMovimentoInputChange('valor', text.replace(/\D/g, ''))}
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Data (YYYY-MM-DD)"
                value={novoMovimento.data}
                onChangeText={(text) => handleMovimentoInputChange('data', text)}
                keyboardType="default"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Categoria"
                value={novoMovimento.categoria}
                onChangeText={(text) => handleMovimentoInputChange('categoria', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição (Opcional)"
                value={novoMovimento.descricao}
                onChangeText={(text) => handleMovimentoInputChange('descricao', text)}
                multiline
                numberOfLines={3}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmitMovimentoForm}>
                <Text style={styles.buttonText}>Adicionar Movimento</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.subHeader}>Movimentos Financeiros</Text>
              {movimentos.length === 0 ? (
                <Text style={styles.emptyListText}>Nenhum movimento financeiro cadastrado.</Text>
              ) : (
                <FlatList
                  data={movimentos}
                  renderItem={renderMovimentoItem}
                  keyExtractor={item => item.id}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
    textAlign: 'center',
  },
  resumoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resumoItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  resumoTitulo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resumoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  formSection: {
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#004c99',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top', // Para Android
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tipoButtonsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tipoButtonSelected: {
    backgroundColor: '#0059b3',
    borderColor: '#0059b3',
  },
  tipoButtonText: {
    color: '#333',
    fontSize: 14,
  },
  tipoButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0059b3',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listSection: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  listItem: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  movimentoTipoReceita: {
    borderLeftColor: '#28a745',
  },
  movimentoTipoDespesa: {
    borderLeftColor: '#dc3545',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  listItemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listItemTextStrong: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#003366',
    marginLeft: 10,
  },
  listItemCategoria: {
    fontSize: 13,
    color: '#0059b3',
    fontWeight: '600',
    marginLeft: 10,
  },
  statusButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listItemText: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 2,
    marginLeft: 34,
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
  },
});

export default FinanceiroScreen;
