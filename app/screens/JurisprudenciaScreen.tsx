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

// Interface para tipagem dos dados da Jurisprudência
interface Jurisprudencia {
  id: string;
  titulo: string;
  tribunal: string;
  data: string;
  processo: string;
  ementa: string;
  link: string;
}

// Chave para AsyncStorage
const STORAGE_KEY_JURISPRUDENCIA = '@LexProMobile:jurisprudencia';

const JurisprudenciaScreen: React.FC = () => {
  const [jurisprudencias, setJurisprudencias] = useState<Jurisprudencia[]>([]);
  const [novaJurisprudencia, setNovaJurisprudencia] = useState<Omit<Jurisprudencia, 'id'>>({
    titulo: '',
    tribunal: '',
    data: '',
    processo: '',
    ementa: '',
    link: ''
  });

  // Carregar jurisprudências do AsyncStorage ao montar o componente
  useEffect(() => {
    const loadJurisprudencias = async () => {
      try {
        const storedJurisprudencias = await AsyncStorage.getItem(STORAGE_KEY_JURISPRUDENCIA);
        if (storedJurisprudencias !== null) {
          setJurisprudencias(JSON.parse(storedJurisprudencias));
        }
      } catch (error) {
        console.error('Erro ao carregar jurisprudências do AsyncStorage:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados das jurisprudências.');
      }
    };
    loadJurisprudencias();
  }, []);

  // Salvar jurisprudências no AsyncStorage sempre que a lista de jurisprudências mudar
  useEffect(() => {
    const saveJurisprudencias = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_JURISPRUDENCIA, JSON.stringify(jurisprudencias));
      } catch (error) {
        console.error('Erro ao salvar jurisprudências no AsyncStorage:', error);
      }
    };
    saveJurisprudencias();
  }, [jurisprudencias]);

  const handleJurisprudenciaInputChange = useCallback((fieldName: keyof Omit<Jurisprudencia, 'id'>, value: string) => {
    setNovaJurisprudencia(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmitJurisprudenciaForm = useCallback(() => {
    if (!novaJurisprudencia.titulo.trim()) {
      Alert.alert('Campo Obrigatório', 'O título da jurisprudência é obrigatório.');
      return;
    }

    if (!novaJurisprudencia.tribunal.trim()) {
      Alert.alert('Campo Obrigatório', 'O tribunal da jurisprudência é obrigatório.');
      return;
    }

    const jurisprudenciaComId: Jurisprudencia = {
      ...novaJurisprudencia,
      id: new Date().toISOString()
    };

    setJurisprudencias(prevJurisprudencias => [jurisprudenciaComId, ...prevJurisprudencias]);
    setNovaJurisprudencia({
      titulo: '',
      tribunal: '',
      data: '',
      processo: '',
      ementa: '',
      link: ''
    });
    Alert.alert('Sucesso', 'Jurisprudência adicionada com sucesso!');
  }, [novaJurisprudencia]);

  const renderJurisprudenciaItem = ({ item }: { item: Jurisprudencia }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTextStrong}>{item.titulo}</Text>
        <Text style={styles.listItemTribunal}>{item.tribunal}</Text>
      </View>
      <Text style={styles.listItemText}>Data: {item.data}</Text>
      <Text style={styles.listItemText}>Processo: {item.processo}</Text>
      <Text style={styles.listItemText} numberOfLines={3}>{item.ementa}</Text>
      {item.link ? (
        <TouchableOpacity style={styles.linkButton}>
          <MaterialCommunityIcons name="link-variant" size={16} color="#0059b3" />
          <Text style={styles.linkButtonText}>Ver na íntegra</Text>
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
            <Text style={styles.header}>Banco de Jurisprudência</Text>

            <View style={styles.formSection}>
              <Text style={styles.subHeader}>Adicionar Nova Jurisprudência</Text>
              <TextInput
                style={styles.input}
                placeholder="Título *"
                value={novaJurisprudencia.titulo}
                onChangeText={(text) => handleJurisprudenciaInputChange('titulo', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Tribunal *"
                value={novaJurisprudencia.tribunal}
                onChangeText={(text) => handleJurisprudenciaInputChange('tribunal', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Data (DD/MM/AAAA)"
                value={novaJurisprudencia.data}
                onChangeText={(text) => handleJurisprudenciaInputChange('data', text)}
                keyboardType="default"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Número do Processo"
                value={novaJurisprudencia.processo}
                onChangeText={(text) => handleJurisprudenciaInputChange('processo', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ementa"
                value={novaJurisprudencia.ementa}
                onChangeText={(text) => handleJurisprudenciaInputChange('ementa', text)}
                multiline
                numberOfLines={4}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Link para acórdão"
                value={novaJurisprudencia.link}
                onChangeText={(text) => handleJurisprudenciaInputChange('link', text)}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmitJurisprudenciaForm}>
                <Text style={styles.buttonText}>Adicionar Jurisprudência</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.subHeader}>Jurisprudências Cadastradas</Text>
              {jurisprudencias.length === 0 ? (
                <Text style={styles.emptyListText}>Nenhuma jurisprudência cadastrada.</Text>
              ) : (
                <FlatList
                  data={jurisprudencias}
                  renderItem={renderJurisprudenciaItem}
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
  listItemTribunal: {
    fontSize: 14,
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

export default JurisprudenciaScreen;
