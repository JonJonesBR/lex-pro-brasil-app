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

// Interface para tipagem dos dados da Legislação
interface Legislacao {
  id: string;
  titulo: string;
  tipo: string;
  numero: string;
  data: string;
  ementa: string;
  link: string;
}

// Chave para AsyncStorage
const STORAGE_KEY_LEGISLACAO = '@LexProMobile:legislacao';

const LegislacaoScreen: React.FC = () => {
  const [legislacoes, setLegislacoes] = useState<Legislacao[]>([]);
  const [novaLegislacao, setNovaLegislacao] = useState<Omit<Legislacao, 'id'>>({
    titulo: '',
    tipo: '',
    numero: '',
    data: '',
    ementa: '',
    link: ''
  });

  // Carregar legislações do AsyncStorage ao montar o componente
  useEffect(() => {
    const loadLegislacoes = async () => {
      try {
        const storedLegislacoes = await AsyncStorage.getItem(STORAGE_KEY_LEGISLACAO);
        if (storedLegislacoes !== null) {
          setLegislacoes(JSON.parse(storedLegislacoes));
        }
      } catch (error) {
        console.error('Erro ao carregar legislações do AsyncStorage:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados das legislações.');
      }
    };
    loadLegislacoes();
  }, []);

  // Salvar legislações no AsyncStorage sempre que a lista de legislações mudar
  useEffect(() => {
    const saveLegislacoes = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_LEGISLACAO, JSON.stringify(legislacoes));
      } catch (error) {
        console.error('Erro ao salvar legislações no AsyncStorage:', error);
      }
    };
    saveLegislacoes();
  }, [legislacoes]);

  const handleLegislacaoInputChange = useCallback((fieldName: keyof Omit<Legislacao, 'id'>, value: string) => {
    setNovaLegislacao(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmitLegislacaoForm = useCallback(() => {
    if (!novaLegislacao.titulo.trim()) {
      Alert.alert('Campo Obrigatório', 'O título da legislação é obrigatório.');
      return;
    }

    if (!novaLegislacao.tipo.trim()) {
      Alert.alert('Campo Obrigatório', 'O tipo da legislação é obrigatório.');
      return;
    }

    if (!novaLegislacao.numero.trim()) {
      Alert.alert('Campo Obrigatório', 'O número da legislação é obrigatório.');
      return;
    }

    const legislacaoComId: Legislacao = {
      ...novaLegislacao,
      id: new Date().toISOString()
    };

    setLegislacoes(prevLegislacoes => [legislacaoComId, ...prevLegislacoes]);
    setNovaLegislacao({
      titulo: '',
      tipo: '',
      numero: '',
      data: '',
      ementa: '',
      link: ''
    });
    Alert.alert('Sucesso', 'Legislação adicionada com sucesso!');
  }, [novaLegislacao]);

  const renderLegislacaoItem = ({ item }: { item: Legislacao }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTextStrong}>{item.titulo}</Text>
        <Text style={styles.listItemTipo}>{item.tipo} {item.numero}</Text>
      </View>
      <Text style={styles.listItemText}>Data: {item.data}</Text>
      <Text style={styles.listItemText} numberOfLines={3}>{item.ementa}</Text>
      {item.link ? (
        <TouchableOpacity style={styles.linkButton}>
          <MaterialCommunityIcons name="link-variant" size={16} color="#0059b3" />
          <Text style={styles.linkButtonText}>Ver norma completa</Text>
        </TouchableOpacity>
      ) : null}
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
            <Text style={styles.header}>Banco de Legislação</Text>

            <View style={styles.formSection}>
              <Text style={styles.subHeader}>Adicionar Nova Legislação</Text>
              <TextInput
                style={styles.input}
                placeholder="Título *"
                value={novaLegislacao.titulo}
                onChangeText={(text) => handleLegislacaoInputChange('titulo', text)}
                placeholderTextColor="#888"
              />
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Tipo * (Lei, Decreto, etc.)"
                  value={novaLegislacao.tipo}
                  onChangeText={(text) => handleLegislacaoInputChange('tipo', text)}
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={[styles.input, styles.halfWidth]}
                  placeholder="Número *"
                  value={novaLegislacao.numero}
                  onChangeText={(text) => handleLegislacaoInputChange('numero', text)}
                  placeholderTextColor="#888"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Data (DD/MM/AAAA)"
                value={novaLegislacao.data}
                onChangeText={(text) => handleLegislacaoInputChange('data', text)}
                keyboardType="default"
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ementa"
                value={novaLegislacao.ementa}
                onChangeText={(text) => handleLegislacaoInputChange('ementa', text)}
                multiline
                numberOfLines={4}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Link para norma"
                value={novaLegislacao.link}
                onChangeText={(text) => handleLegislacaoInputChange('link', text)}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmitLegislacaoForm}>
                <Text style={styles.buttonText}>Adicionar Legislação</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.subHeader}>Legislações Cadastradas</Text>
              {legislacoes.length === 0 ? (
                <Text style={styles.emptyListText}>Nenhuma legislação cadastrada.</Text>
              ) : (
                <FlatList
                  data={legislacoes}
                  renderItem={renderLegislacaoItem}
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
    height: 100,
    textAlignVertical: 'top', // Para Android
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  listItemTextStrong: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#003366',
  },
  listItemTipo: {
    fontSize: 15,
    color: '#0059b3',
    fontWeight: '600',
  },
  listItemText: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 2,
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    color: '#0059b3',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default LegislacaoScreen;
