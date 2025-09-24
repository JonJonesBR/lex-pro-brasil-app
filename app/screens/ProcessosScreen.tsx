// LexProMobile/app/screens/ProcessosScreen.tsx
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

// Interface para tipagem dos dados do Processo
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

// Chave para AsyncStorage
const STORAGE_KEY_PROCESSOS = '@LexProMobile:processos';

const ProcessosScreen: React.FC = () => {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [novoProcesso, setNovoProcesso] = useState<Omit<Processo, 'id'>>({
    numero: '',
    comarca: '',
    vara: '',
    natureza: '',
    partes: '',
    objeto: '',
    valorCausa: '',
    status: 'Ativo'
  });

  // Carregar processos do AsyncStorage ao montar o componente
  useEffect(() => {
    const loadProcessos = async () => {
      try {
        const storedProcessos = await AsyncStorage.getItem(STORAGE_KEY_PROCESSOS);
        if (storedProcessos !== null) {
          setProcessos(JSON.parse(storedProcessos));
        }
      } catch (error) {
        console.error('Erro ao carregar processos do AsyncStorage:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados dos processos.');
      }
    };
    loadProcessos();
  }, []);

  // Salvar processos no AsyncStorage sempre que a lista de processos mudar
  useEffect(() => {
    const saveProcessos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_PROCESSOS, JSON.stringify(processos));
      } catch (error) {
        console.error('Erro ao salvar processos no AsyncStorage:', error);
      }
    };
    saveProcessos();
  }, [processos]);

  const handleProcessoInputChange = useCallback((fieldName: keyof Omit<Processo, 'id'>, value: string) => {
    setNovoProcesso(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmitProcessoForm = useCallback(() => {
    if (!novoProcesso.numero.trim()) {
      Alert.alert('Campo Obrigatório', 'O número do processo é obrigatório.');
      return;
    }

    const processoComId: Processo = {
      ...novoProcesso,
      id: new Date().toISOString() // Gera um ID único simples
    };

    setProcessos(prevProcessos => [processoComId, ...prevProcessos]); // Adiciona no início da lista
    setNovoProcesso({ 
      numero: '', 
      comarca: '', 
      vara: '', 
      natureza: '', 
      partes: '', 
      objeto: '', 
      valorCausa: '', 
      status: 'Ativo' 
    }); // Limpa o formulário
    Alert.alert('Sucesso', 'Processo adicionado com sucesso!');
  }, [novoProcesso]);

  const renderProcessoItem = ({ item }: { item: Processo }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemTextStrong}>{item.numero}</Text>
      <Text style={styles.listItemText}>Comarca: {item.comarca} - Vara: {item.vara}</Text>
      <Text style={styles.listItemText}>Natureza: {item.natureza}</Text>
      <Text style={styles.listItemText}>Partes: {item.partes}</Text>
      <Text style={styles.listItemText}>Objeto: {item.objeto}</Text>
      <Text style={styles.listItemText}>Valor: R$ {item.valorCausa}</Text>
      <Text style={styles.listItemText}>Status: <Text style={styles.statusText}>{item.status}</Text></Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.container}>
            <Text style={styles.header}>Gestão de Processos</Text>

            <View style={styles.formSection}>
              <Text style={styles.subHeader}>Adicionar Novo Processo</Text>
              <TextInput
                style={styles.input}
                placeholder="Número do Processo (CNJ) *"
                value={novoProcesso.numero}
                onChangeText={(text) => handleProcessoInputChange('numero', text)}
                placeholderTextColor="#888"
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Comarca"
                value={novoProcesso.comarca}
                onChangeText={(text) => handleProcessoInputChange('comarca', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Vara"
                value={novoProcesso.vara}
                onChangeText={(text) => handleProcessoInputChange('vara', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Natureza da Ação"
                value={novoProcesso.natureza}
                onChangeText={(text) => handleProcessoInputChange('natureza', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Partes Envolvidas"
                value={novoProcesso.partes}
                onChangeText={(text) => handleProcessoInputChange('partes', text)}
                multiline
                numberOfLines={3}
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Objeto da Ação"
                value={novoProcesso.objeto}
                onChangeText={(text) => handleProcessoInputChange('objeto', text)}
                multiline
                numberOfLines={3}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Valor da Causa (R$)"
                value={novoProcesso.valorCausa}
                onChangeText={(text) => handleProcessoInputChange('valorCausa', text)}
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmitProcessoForm}>
                <Text style={styles.buttonText}>Adicionar Processo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.subHeader}>Processos Cadastrados</Text>
              {processos.length === 0 ? (
                <Text style={styles.emptyListText}>Nenhum processo cadastrado.</Text>
              ) : (
                <FlatList
                  data={processos}
                  renderItem={renderProcessoItem}
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
    textAlignVertical: 'top',
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
    borderLeftColor: '#0059b3',
  },
  listItemTextStrong: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 3,
  },
  listItemText: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 2,
  },
  statusText: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
  }
});

export default ProcessosScreen;