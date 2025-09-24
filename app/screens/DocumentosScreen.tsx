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
  SafeAreaView,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Interface para tipagem dos dados do Documento
interface Documento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  data: string;
  processoRelacionado: string;
  link: string;
}

// Chave para AsyncStorage
const STORAGE_KEY_DOCUMENTOS = '@LexProMobile:documentos';

const DocumentosScreen: React.FC = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [novoDocumento, setNovoDocumento] = useState<Omit<Documento, 'id'>>({
    titulo: '',
    descricao: '',
    tipo: '',
    data: new Date().toISOString().split('T')[0],
    processoRelacionado: '',
    link: ''
  });

  // Carregar documentos do AsyncStorage ao montar o componente
  useEffect(() => {
    const loadDocumentos = async () => {
      try {
        const storedDocumentos = await AsyncStorage.getItem(STORAGE_KEY_DOCUMENTOS);
        if (storedDocumentos !== null) {
          setDocumentos(JSON.parse(storedDocumentos));
        }
      } catch (error) {
        console.error('Erro ao carregar documentos do AsyncStorage:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados dos documentos.');
      }
    };
    loadDocumentos();
  }, []);

  // Salvar documentos no AsyncStorage sempre que a lista de documentos mudar
  useEffect(() => {
    const saveDocumentos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_DOCUMENTOS, JSON.stringify(documentos));
      } catch (error) {
        console.error('Erro ao salvar documentos no AsyncStorage:', error);
      }
    };
    saveDocumentos();
  }, [documentos]);

  const handleDocumentoInputChange = useCallback((fieldName: keyof Omit<Documento, 'id'>, value: string) => {
    setNovoDocumento(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmitDocumentoForm = useCallback(() => {
    if (!novoDocumento.titulo.trim()) {
      Alert.alert('Campo Obrigatório', 'O título do documento é obrigatório.');
      return;
    }

    if (!novoDocumento.tipo.trim()) {
      Alert.alert('Campo Obrigatório', 'O tipo do documento é obrigatório.');
      return;
    }

    const documentoComId: Documento = {
      ...novoDocumento,
      id: new Date().toISOString()
    };

    setDocumentos(prevDocumentos => [documentoComId, ...prevDocumentos]);
    setNovoDocumento({
      titulo: '',
      descricao: '',
      tipo: '',
      data: new Date().toISOString().split('T')[0],
      processoRelacionado: '',
      link: ''
    });
    Alert.alert('Sucesso', 'Documento adicionado com sucesso!');
  }, [novoDocumento]);

  const openDocumentoLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert('Erro', 'Não foi possível abrir o link do documento.');
        console.error('Erro ao abrir URL:', err);
      });
    } else {
      Alert.alert('Aviso', 'Este documento não tem um link associado.');
    }
  };

  const renderDocumentoItem = ({ item }: { item: Documento }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemTextStrong}>{item.titulo}</Text>
        <Text style={styles.listItemTipo}>{item.tipo}</Text>
      </View>
      <Text style={styles.listItemText}>Processo: {item.processoRelacionado}</Text>
      <Text style={styles.listItemText}>Data: {item.data}</Text>
      {item.descricao ? <Text style={styles.listItemText} numberOfLines={2}>{item.descricao}</Text> : null}
      {item.link ? (
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => openDocumentoLink(item.link)}
        >
          <MaterialCommunityIcons name="file-document" size={16} color="#0059b3" />
          <Text style={styles.linkButtonText}>Abrir Documento</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.linkButton}>
          <MaterialCommunityIcons name="file-document-outline" size={16} color="#ccc" />
          <Text style={[styles.linkButtonText, { color: '#ccc' }]}>Documento Local</Text>
        </View>
      )}
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
            <Text style={styles.header}>Gestão de Documentos</Text>

            <View style={styles.formSection}>
              <Text style={styles.subHeader}>Adicionar Novo Documento</Text>
              <TextInput
                style={styles.input}
                placeholder="Título *"
                value={novoDocumento.titulo}
                onChangeText={(text) => handleDocumentoInputChange('titulo', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Tipo * (Petição, Contrato, etc.)"
                value={novoDocumento.tipo}
                onChangeText={(text) => handleDocumentoInputChange('tipo', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Data (YYYY-MM-DD)"
                value={novoDocumento.data}
                onChangeText={(text) => handleDocumentoInputChange('data', text)}
                keyboardType="default"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Processo Relacionado"
                value={novoDocumento.processoRelacionado}
                onChangeText={(text) => handleDocumentoInputChange('processoRelacionado', text)}
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição"
                value={novoDocumento.descricao}
                onChangeText={(text) => handleDocumentoInputChange('descricao', text)}
                multiline
                numberOfLines={3}
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                placeholder="Link para Documento (Opcional)"
                value={novoDocumento.link}
                onChangeText={(text) => handleDocumentoInputChange('link', text)}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.button} onPress={handleSubmitDocumentoForm}>
                <Text style={styles.buttonText}>Adicionar Documento</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.subHeader}>Documentos Cadastrados</Text>
              {documentos.length === 0 ? (
                <Text style={styles.emptyListText}>Nenhum documento cadastrado.</Text>
              ) : (
                <FlatList
                  data={documentos}
                  renderItem={renderDocumentoItem}
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
  listItemTipo: {
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

export default DocumentosScreen;
